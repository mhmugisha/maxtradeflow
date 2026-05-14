'use client';
// app/commodities/[symbol]/page.js

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchPrices, fetchScreener } from '../../../lib/api';
import TradingViewChart from '../../../components/TradingViewChart';
import Skeleton from '../../../components/Skeleton';

const COMMODITY_INFO = {
  'xauusd': { display: 'XAU/USD', name: 'Gold / US Dollar', tv: 'OANDA:XAUUSD', icon: '🥇' },
};

function PriceBoxSkeleton({ label }) {
  return (
    <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
      <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{label}</div>
      <Skeleton height="22px" style={{ margin: '0 auto', maxWidth: '70px' }} />
    </div>
  );
}

function SignalCardSkeleton() {
  return (
    <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', padding: '20px', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Skeleton width="180px" height="16px" />
        <Skeleton width="50px" height="22px" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '14px' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{ background: '#060b11', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between' }}>
            <Skeleton width="50px" height="12px" />
            <Skeleton width="40px" height="14px" />
          </div>
        ))}
      </div>
      <Skeleton height="6px" />
    </div>
  );
}

export default function CommoditySymbolPage({ params }) {
  const symbol = params.symbol.toLowerCase();
  const info = COMMODITY_INFO[symbol] || { display: symbol.toUpperCase(), name: symbol.toUpperCase(), tv: symbol.toUpperCase(), icon: '📦' };

  const [price, setPrice] = useState(null);
  const [signal, setSignal] = useState(null);
  const [signalChecked, setSignalChecked] = useState(false);
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    const load = () => {
      fetchPrices().then(prices => {
        const p = prices.find(p => p.symbol === info.display || p.symbol === 'XAU/USD');
        if (p) setPrice(p);
      });
      fetchScreener().then(screener => {
        const s = screener.find(s => s.symbol === info.display || s.symbol === 'XAU/USD');
        if (s) setSignal(s);
        setSignalChecked(true);
      }).catch(() => setSignalChecked(true));
    };
    load();
    const interval = setInterval(load, 5000);
    fetch(`/api/articles?category=signal&limit=10`)
      .then(r => r.json())
      .then(d => {
        const filtered = (d.articles || []).filter(a => ['XAUUSD', 'XAU/USD'].includes(a.ticker));
        setArticles(filtered);
      })
      .catch(() => {});
    return () => clearInterval(interval);
  }, [symbol]);

  const ratingColor = (rating) => {
    if (rating === 'TRADE') return { bg: '#1D9E7520', color: '#1D9E75', border: '#1D9E7540' };
    if (rating === 'WATCH') return { bg: '#EF9F2720', color: '#EF9F27', border: '#EF9F2740' };
    return { bg: '#e0555520', color: '#e05555', border: '#e0555540' };
  };

  const rc = signal ? ratingColor(signal.action) : null;

  return (
    <div style={{ background: '#080d14', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ background: 'linear-gradient(180deg, #0d1f2d 0%, #080d14 100%)', borderBottom: '1px solid #1a2535', padding: '20px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>
            <Link href="/" style={{ color: '#60c8d4', textDecoration: 'none' }}>Home</Link>
            {' › '}
            <Link href="/commodities" style={{ color: '#60c8d4', textDecoration: 'none' }}>Commodities</Link>
            {' › '}
            <span>{info.display}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <span style={{ fontSize: '36px' }}>{info.icon}</span>
              <div>
                <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 2px' }}>{info.display}</h1>
                <div style={{ fontSize: '13px', color: '#64748b' }}>{info.name} · Commodity</div>
              </div>
              {signal && rc && (
                <span style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, borderRadius: '6px', padding: '6px 14px', fontSize: '13px', fontWeight: '700' }}>
                  {signal.action}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {price ? (
                [
                  { label: 'Bid', value: `$${parseFloat(price.bid).toFixed(2)}`, color: '#EF9F27' },
                  { label: 'Ask', value: `$${parseFloat(price.ask).toFixed(2)}`, color: '#EF9F27' },
                  { label: 'Spread', value: price.spread, color: '#64748b' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '8px', padding: '10px 16px', textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: item.color, fontFamily: 'monospace' }}>{item.value}</div>
                  </div>
                ))
              ) : (
                <>
                  <PriceBoxSkeleton label="Bid" />
                  <PriceBoxSkeleton label="Ask" />
                  <PriceBoxSkeleton label="Spread" />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div>
          {!signalChecked && <SignalCardSkeleton />}
          {signalChecked && signal && (
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
                  { label: 'ADX', value: signal.adx, color: '#e05555' },
                  { label: 'RSI', value: signal.rsi, color: '#e05555' },
                ].map(item => (
                  <div key={item.label} style={{ background: '#060b11', borderRadius: '8px', padding: '12px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '12px', color: '#475569' }}>{item.label}</span>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: item.color }}>{item.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: '#1a2535', borderRadius: '4px', height: '6px' }}>
                <div style={{ height: '6px', borderRadius: '4px', background: signal.score >= 8 ? '#1D9E75' : '#EF9F27', width: `${signal.score * 10}%` }} />
              </div>
            </div>
          )}

          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', overflow: 'hidden', marginBottom: '24px' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a2535', display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>{info.display} Chart</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>Powered by TradingView</div>
            </div>
            <TradingViewChart symbol={info.tv} height={450} interval="H1" />
          </div>

          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #1a2535' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Gold Signal History</div>
              <Link href="/articles" style={{ fontSize: '11px', color: '#60c8d4', textDecoration: 'none' }}>All signals →</Link>
            </div>
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {articles.length > 0 ? articles.map((article, i) => (
                <Link key={i} href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#060b11', border: '1px solid #1a2535', borderRadius: '8px', padding: '14px' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#60c8d4'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2535'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#EF9F27', fontWeight: '700', fontSize: '13px' }}>XAU/USD</span>
                      <span style={{ background: '#1D9E7520', color: '#1D9E75', border: '1px solid #1D9E7540', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: '700' }}>{article.rating}</span>
                    </div>
                    <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px', lineHeight: '1.4' }}>{article.title}</div>
                    {article.entry_price && (
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px', marginBottom: '8px' }}>
                        <div style={{ background: '#0a1020', borderRadius: '4px', padding: '4px 6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '9px', color: '#475569', marginBottom: '2px' }}>Entry</div>
                          <div style={{ fontSize: '10px', color: '#60c8d4', fontFamily: 'monospace', fontWeight: '600' }}>{parseFloat(article.entry_price).toFixed(2)}</div>
                        </div>
                        <div style={{ background: '#0a1020', borderRadius: '4px', padding: '4px 6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '9px', color: '#475569', marginBottom: '2px' }}>SL</div>
                          <div style={{ fontSize: '10px', color: '#e05555', fontFamily: 'monospace', fontWeight: '600' }}>{parseFloat(article.stop_loss).toFixed(2)}</div>
                        </div>
                        <div style={{ background: '#0a1020', borderRadius: '4px', padding: '4px 6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '9px', color: '#475569', marginBottom: '2px' }}>TP</div>
                          <div style={{ fontSize: '10px', color: '#1D9E75', fontFamily: 'monospace', fontWeight: '600' }}>{parseFloat(article.take_profit).toFixed(2)}</div>
                        </div>
                        <div style={{ background: '#0a1020', borderRadius: '4px', padding: '4px 6px', textAlign: 'center' }}>
                          <div style={{ fontSize: '9px', color: '#475569', marginBottom: '2px' }}>R:R</div>
                          <div style={{ fontSize: '10px', color: '#f1f5f9', fontFamily: 'monospace', fontWeight: '600' }}>1:{parseFloat(article.rr_ratio).toFixed(1)}</div>
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
                <div style={{ color: '#475569', fontSize: '13px' }}>No Gold signal articles yet.</div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a2535' }}>
              <span style={{ fontSize: '10px', color: '#1a2535', textTransform: 'uppercase', letterSpacing: '1px' }}>Advertisement</span>
            </div>
            <div style={{ width: '100%', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2535', fontSize: '12px' }}>AdSense 300×250</div>
          </div>

          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a2535' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Quick Calculators</div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {[
                { icon: '⚖️', name: 'Position Size', href: '/tools/position-size' },
                { icon: '📐', name: 'Pip Calculator', href: '/tools/pip-calculator' },
                { icon: '💰', name: 'P&L Calculator', href: '/tools/profit-loss' },
                { icon: '📊', name: 'ATR Volatility', href: '/tools/atr-volatility' },
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
            <div style={{ width: '100%', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2535', fontSize: '12px' }}>AdSense 300×250</div>
          </div>
        </div>
      </div>
    </div>
  );
}