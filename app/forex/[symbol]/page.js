'use client';
// app/forex/[symbol]/page.js

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchPrices, fetchScreener } from '../../../lib/api';
import TradingViewChart from '../../../components/TradingViewChart';

const PAIR_NAMES = {
  'eurusd': { display: 'EUR/USD', name: 'Euro / US Dollar', tv: 'OANDA:EURUSD', related: ['gbpusd', 'eurgbp', 'eurcad'] },
  'gbpusd': { display: 'GBP/USD', name: 'Pound / US Dollar', tv: 'OANDA:GBPUSD', related: ['eurusd', 'gbpjpy', 'gbpaud'] },
  'usdjpy': { display: 'USD/JPY', name: 'US Dollar / Yen', tv: 'OANDA:USDJPY', related: ['gbpjpy', 'audjpy', 'chfjpy'] },
  'gbpjpy': { display: 'GBP/JPY', name: 'Pound / Yen', tv: 'OANDA:GBPJPY', related: ['usdjpy', 'gbpusd', 'audjpy'] },
  'audusd': { display: 'AUD/USD', name: 'Aussie / US Dollar', tv: 'OANDA:AUDUSD', related: ['nzdusd', 'audjpy', 'gbpaud'] },
  'usdcad': { display: 'USD/CAD', name: 'US Dollar / Canadian', tv: 'OANDA:USDCAD', related: ['eurusd', 'gbpusd', 'audusd'] },
  'eurgbp': { display: 'EUR/GBP', name: 'Euro / Pound', tv: 'OANDA:EURGBP', related: ['eurusd', 'gbpusd', 'gbpjpy'] },
  'audjpy': { display: 'AUD/JPY', name: 'Aussie / Yen', tv: 'OANDA:AUDJPY', related: ['usdjpy', 'gbpjpy', 'audusd'] },
  'gbpaud': { display: 'GBP/AUD', name: 'Pound / Aussie', tv: 'OANDA:GBPAUD', related: ['gbpusd', 'audusd', 'gbpjpy'] },
  'chfjpy': { display: 'CHF/JPY', name: 'Franc / Yen', tv: 'OANDA:CHFJPY', related: ['usdjpy', 'gbpjpy', 'audjpy'] },
  'nzdusd': { display: 'NZD/USD', name: 'Kiwi / US Dollar', tv: 'OANDA:NZDUSD', related: ['audusd', 'audjpy', 'usdcad'] },
};

export default function ForexSymbolPage({ params }) {
  const symbol = params.symbol.toLowerCase();
  const info = PAIR_NAMES[symbol] || { display: symbol.toUpperCase(), name: symbol.toUpperCase(), tv: `OANDA:${symbol.toUpperCase()}`, related: [] };

  const [price, setPrice] = useState(null);
  const [signal, setSignal] = useState(null);
  const [articles, setArticles] = useState([]);
  const [morningOutlook, setMorningOutlook] = useState(null);

  useEffect(() => {
    const load = () => {
      fetchPrices().then(prices => {
        const p = prices.find(p => p.symbol === info.display);
        if (p) setPrice(p);
      });
      fetchScreener().then(screener => {
        const s = screener.find(s => s.symbol === info.display);
        if (s) setSignal(s);
      });
    };
    load();
    const interval = setInterval(load, 5000);

    fetch(`/api/articles?category=signal&limit=10`)
      .then(r => r.json())
      .then(d => {
        const ticker = symbol.toUpperCase();
        const filtered = (d.articles || []).filter(a =>
          a.ticker === ticker || a.ticker === info.display.replace('/', '')
        );
        setArticles(filtered);
      })
      .catch(() => {});

    fetch(`/api/morning-outlook`)
      .then(r => r.json())
      .then(d => setMorningOutlook(d))
      .catch(() => {});

    return () => clearInterval(interval);
  }, [symbol]);

  const ratingColor = (rating) => {
    if (rating === 'TRADE') return { bg: '#1D9E7520', color: '#1D9E75', border: '#1D9E7540' };
    if (rating === 'WATCH') return { bg: '#EF9F2720', color: '#EF9F27', border: '#EF9F2740' };
    return { bg: '#e0555520', color: '#e05555', border: '#e0555540' };
  };

  const rc = signal ? ratingColor(signal.action) : null;
  const isJPY = symbol.includes('jpy');

  return (
    <div style={{ background: '#080d14', minHeight: '100vh', color: '#e2e8f0' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, #0d1f2d 0%, #080d14 100%)', borderBottom: '1px solid #1a2535', padding: '20px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>
            <Link href="/" style={{ color: '#60c8d4', textDecoration: 'none' }}>Home</Link>
            {' › '}
            <Link href="/forex" style={{ color: '#60c8d4', textDecoration: 'none' }}>Forex</Link>
            {' › '}
            <span>{info.display}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 2px' }}>{info.display}</h1>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{info.name} · Forex</div>
              </div>
              {signal && rc && (
                <span style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, borderRadius: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: '700' }}>
                  {signal.action}
                </span>
              )}
            </div>
            {price && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { label: 'Bid', value: price.bid, color: '#60c8d4' },
                  { label: 'Ask', value: price.ask, color: '#60c8d4' },
                  { label: 'Spread', value: price.spread, color: '#64748b' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: item.color, fontFamily: 'monospace' }}>{item.value}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>

        {/* LEFT */}
        <div>
          {/* Signal Card */}
          {signal && (
            <div style={{ background: '#0d1520', border: `1px solid ${rc?.border || '#1a2535'}`, borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9' }}>Live Signal — {info.display}</div>
                <span style={{ background: rc?.bg, color: rc?.color, border: `1px solid ${rc?.border}`, borderRadius: '4px', padding: '4px 12px', fontSize: '12px', fontWeight: '700' }}>
                  {signal.score}/10
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
                {[
                  { label: 'Direction', value: `${signal.direction === 'LONG' ? '▲' : '▼'} ${signal.direction}`, color: signal.direction === 'LONG' ? '#1D9E75' : '#e05555' },
                  { label: 'ADX', value: signal.adx, color: '#60c8d4' },
                  { label: 'RSI', value: signal.rsi, color: '#60c8d4' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#060b11', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: '#475569' }}>{item.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569', marginBottom: '6px' }}>
                <span>Signal Strength</span>
                <span style={{ color: rc?.color }}>{signal.score}/10</span>
              </div>
              <div style={{ background: '#1a2535', borderRadius: '4px', height: '6px' }}>
                <div style={{ height: '6px', borderRadius: '4px', background: signal.score >= 8 ? '#1D9E75' : '#EF9F27', width: `${signal.score * 10}%`, transition: 'width 0.3s' }} />
              </div>
            </div>
          )}

          {/* TradingView Chart */}
          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a2535', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>{info.display} Chart</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>Powered by TradingView</div>
            </div>
            <TradingViewChart symbol={info.tv} height={500} interval="60" />
          </div>

          {/* Signal Articles */}
          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #1a2535' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>{info.display} Signal History</div>
              <Link href="/articles" style={{ fontSize: '11px', color: '#60c8d4', textDecoration: 'none' }}>All signals →</Link>
            </div>
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {articles.length > 0 ? articles.map((article, i) => (
                <Link key={i} href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#060b11', border: '1px solid #1a2535', borderRadius: '8px', padding: '14px', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#60c8d4'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2535'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#60c8d4', fontWeight: '700', fontSize: '13px' }}>{info.display}</span>
                      <span style={{ background: '#1D9E7520', color: '#1D9E75', border: '1px solid #1D9E7540', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: '700' }}>{article.rating}</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px', lineHeight: '1.4' }}>{article.title}</div>
                    {article.entry_price && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '8px' }}>
                        <div style={{ background: '#0a1020', borderRadius: '4px', padding: '4px 6px', fontSize: '10px' }}>
                          <div style={{ color: '#475569' }}>Entry</div>
                          <div style={{ color: '#60c8d4', fontFamily: 'monospace' }}>{parseFloat(article.entry_price).toFixed(isJPY ? 3 : 5)}</div>
                        </div>
                        <div style={{ background: '#0a1020', borderRadius: '4px', padding: '4px 6px', fontSize: '10px' }}>
                          <div style={{ color: '#475569' }}>SL</div>
                          <div style={{ color: '#e05555', fontFamily: 'monospace' }}>{parseFloat(article.stop_loss).toFixed(isJPY ? 3 : 5)}</div>
                        </div>
                        <div style={{ background: '#0a1020', borderRadius: '4px', padding: '4px 6px', fontSize: '10px' }}>
                          <div style={{ color: '#475569' }}>TP</div>
                          <div style={{ color: '#1D9E75', fontFamily: 'monospace' }}>{parseFloat(article.take_profit).toFixed(isJPY ? 3 : 5)}</div>
                        </div>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                      <span>{new Date(article.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                      <span>{article.score}/10</span>
                    </div>
                  </div>
                </Link>
              )) : (
                <div style={{ gridColumn: '1/-1', color: '#475569', fontSize: '13px', padding: '8px 0' }}>
                  No signal articles yet for {info.display}. Articles are auto-published when the bot fires a signal.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div>
          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a2535' }}>
              <span style={{ fontSize: '10px', color: '#1a2535', textTransform: 'uppercase', letterSpacing: '1px' }}>Advertisement</span>
            </div>
            <div style={{ width: '100%', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2535', fontSize: '12px' }}>
              AdSense 300×250
            </div>
          </div>

          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a2535' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Related Pairs</div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {info.related.map(rel => {
                const relInfo = PAIR_NAMES[rel];
                if (!relInfo) return null;
                return (
                  <Link key={rel} href={`/forex/${rel}`} style={{ textDecoration: 'none' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', borderBottom: '1px solid #060b11' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#060b11'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '13px' }}>{relInfo.display}</div>
                        <div style={{ fontSize: '11px', color: '#475569' }}>{relInfo.name}</div>
                      </div>
                      <span style={{ color: '#60c8d4', fontSize: '12px' }}>→</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a2535' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Quick Calculators</div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {[
                { icon: '⚖️', name: 'Position Size', href: '/tools/position-size' },
                { icon: '📐', name: 'Pip Calculator', href: '/tools/pip-calculator' },
                { icon: '🎯', name: 'Risk/Reward', href: '/tools/risk-reward' },
                { icon: '🏦', name: 'Margin Calculator', href: '/tools/margin-calculator' },
              ].map(tool => (
                <Link key={tool.name} href={tool.href} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderBottom: '1px solid #060b11' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#060b11'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span>{tool.icon}</span>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{tool.name}</span>
                    <span style={{ color: '#60c8d4', marginLeft: 'auto', fontSize: '12px' }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a2535' }}>
              <span style={{ fontSize: '10px', color: '#1a2535', textTransform: 'uppercase', letterSpacing: '1px' }}>Advertisement</span>
            </div>
            <div style={{ width: '100%', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2535', fontSize: '12px' }}>
              AdSense 300×250
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}