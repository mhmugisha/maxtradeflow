'use client';
// app/commodities/[symbol]/page.js

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchPrices, fetchScreener } from '../../../lib/api';

const COMMODITY_INFO = {
  'xauusd': { display: 'XAU/USD', name: 'Gold / US Dollar', tv: 'OANDA:XAUUSD', icon: '🥇' },
};

export default function CommoditySymbolPage({ params }) {
  const symbol = params.symbol.toLowerCase();
  const info = COMMODITY_INFO[symbol] || { display: symbol.toUpperCase(), name: symbol.toUpperCase(), tv: symbol.toUpperCase(), icon: '📦' };

  const [price, setPrice] = useState(null);
  const [signal, setSignal] = useState(null);
  const [articles, setArticles] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    const load = () => {
      fetchPrices().then(prices => {
        const p = prices.find(p => p.symbol === info.display || p.symbol === 'XAU/USD');
        if (p) setPrice(p);
      });
      fetchScreener().then(screener => {
        const s = screener.find(s => s.symbol === info.display || s.symbol === 'XAU/USD');
        if (s) setSignal(s);
      });
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

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.innerHTML = '';
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol: info.tv,
      interval: 'H1',
      timezone: 'Etc/UTC',
      theme: 'dark',
      style: '1',
      locale: 'en',
      backgroundColor: '#0d1520',
      gridColor: '#1a2535',
      hide_top_toolbar: false,
      save_image: false,
    });
    chartRef.current.appendChild(script);
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
            {price && (
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { label: 'Bid', value: `$${parseFloat(price.bid).toFixed(2)}`, color: '#EF9F27' },
                  { label: 'Ask', value: `$${parseFloat(price.ask).toFixed(2)}`, color: '#EF9F27' },
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

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div>
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
            <div ref={chartRef} style={{ height: '450px', width: '100%' }}>
              <div style={{ height: '450px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: '13px' }}>Loading chart...</div>
            </div>
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
