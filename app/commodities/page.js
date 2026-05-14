'use client';
// app/commodities/page.js

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchPrices, fetchScreener } from '../../lib/api';

const COMMODITIES = ['XAU/USD', 'XAUUSD'];
const COMMODITY_NAMES = { 'XAU/USD': 'Gold / US Dollar', 'XAUUSD': 'Gold / US Dollar' };

export default function CommoditiesPage() {
  const [prices, setPrices] = useState([]);
  const [screener, setScreener] = useState([]);
  const [recentSignals, setRecentSignals] = useState([]);
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    const load = () => {
      fetchPrices().then(p => { setPrices(p); setLastUpdate(new Date().toLocaleTimeString()); });
      fetchScreener().then(setScreener);
    };
    load();
    const interval = setInterval(load, 5000);
    fetch('/api/articles?category=signal&limit=6')
      .then(r => r.json())
      .then(d => setRecentSignals((d.articles || []).filter(a => ['XAUUSD','XAU/USD'].includes(a.ticker))))
      .catch(() => {});
    return () => clearInterval(interval);
  }, []);

  const commodityPrices = prices.filter(p => COMMODITIES.includes(p.symbol));
  const commodityScreener = screener.filter(s => ['XAU/USD','XAUUSD'].includes(s.symbol));
  const getSignal = (symbol) => commodityScreener.find(s => s.symbol === symbol);
  const tradeSignals = commodityScreener.filter(s => s.action === 'TRADE').length;

  const ratingColor = (rating) => {
    if (rating === 'TRADE') return { bg: '#1D9E7520', color: '#1D9E75', border: '#1D9E7540' };
    if (rating === 'WATCH') return { bg: '#EF9F2720', color: '#EF9F27', border: '#EF9F2740' };
    return { bg: '#e0555520', color: '#e05555', border: '#e0555540' };
  };

  return (
    <div style={{ background: '#080d14', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ background: 'linear-gradient(180deg, #0d1f2d 0%, #080d14 100%)', borderBottom: '1px solid #1a2535', padding: '28px 24px 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Live Markets</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 4px' }}>Commodities</h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Gold (XAU/USD) · Live prices & AI signal scores</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { label: 'Tracked', value: '1', color: '#60c8d4' },
                { label: 'Active Signals', value: tradeSignals.toString(), color: '#1D9E75' },
              ].map(card => (
                <div key={card.label} style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '8px', padding: '10px 16px', textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{card.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: card.color }}>{card.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        <div>
          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #1a2535' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Live Prices</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                {lastUpdate && <span style={{ color: '#1D9E75' }}>● </span>}
                Updating every 5s {lastUpdate && `· ${lastUpdate}`}
              </div>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #1a2535' }}>
                  {['Commodity', 'Bid', 'Ask', 'Spread', 'ADX', 'Score', 'Direction', 'Signal', ''].map(h => (
                    <th key={h} style={{ padding: '10px 12px', color: '#475569', fontWeight: '400', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {commodityPrices.length > 0 ? commodityPrices.map((price, i) => {
                  const signal = getSignal(price.symbol);
                  const rc = signal ? ratingColor(signal.action) : null;
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid #0a1020' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#060b11'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '12px' }}>
                        <div style={{ fontWeight: '600', color: '#f1f5f9' }}>{price.symbol}</div>
                        <div style={{ fontSize: '11px', color: '#475569' }}>{COMMODITY_NAMES[price.symbol]}</div>
                      </td>
                      <td style={{ padding: '12px', color: '#e05555', fontFamily: 'monospace', fontWeight: '500' }}>{price.bid}</td>
                      <td style={{ padding: '12px', color: '#1D9E75', fontFamily: 'monospace' }}>{price.ask}</td>
                      <td style={{ padding: '12px', color: '#475569', fontFamily: 'monospace' }}>{price.spread}</td>
                      <td style={{ padding: '12px' }}>
                        {signal ? <span style={{ fontSize: '12px', fontWeight: '600', color: parseFloat(signal.adx) >= 25 ? '#1D9E75' : parseFloat(signal.adx) >= 15 ? '#EF9F27' : '#e05555' }}>{signal.adx}</span> : <span style={{ color: '#1a2535' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {signal ? (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ background: '#1a2535', borderRadius: '2px', height: '4px', width: '40px' }}>
                              <div style={{ height: '4px', borderRadius: '2px', background: signal.score >= 8 ? '#1D9E75' : signal.score >= 6 ? '#EF9F27' : '#e05555', width: `${signal.score * 10}%` }} />
                            </div>
                            <span style={{ fontSize: '12px', color: '#94a3b8', whiteSpace: 'nowrap' }}>{signal.score}/10</span>
                          </div>
                        ) : <span style={{ color: '#1a2535' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {signal ? <span style={{ color: signal.direction === 'LONG' ? '#1D9E75' : '#e05555', fontSize: '12px', fontWeight: '600' }}>{signal.direction === 'LONG' ? '▲' : '▼'} {signal.direction}</span> : <span style={{ color: '#1a2535' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px' }}>
                        {signal && rc ? <span style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, borderRadius: '4px', padding: '3px 8px', fontSize: '10px', fontWeight: '700' }}>{signal.action}</span> : <span style={{ color: '#1a2535' }}>—</span>}
                      </td>
                      <td style={{ padding: '12px' }}>
                        <Link href={`/commodities/${price.symbol.replace('/', '').toLowerCase()}`} style={{ textDecoration: 'none' }}>
                          <span style={{ fontSize: '11px', color: '#60c8d4', border: '1px solid #1a2535', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Analysis →</span>
                        </Link>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#475569' }}>Loading prices...</td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #1a2535' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Recent Commodity Signals</div>
              <Link href="/articles" style={{ fontSize: '11px', color: '#60c8d4', textDecoration: 'none' }}>All signals →</Link>
            </div>
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {recentSignals.length > 0 ? recentSignals.map((article, i) => (
                <Link key={i} href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#060b11', border: '1px solid #1a2535', borderRadius: '8px', padding: '14px' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#60c8d4'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2535'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#EF9F27', fontWeight: '700', fontSize: '13px' }}>{article.ticker}</span>
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
                <div style={{ color: '#475569', fontSize: '13px' }}>Commodity signal articles will appear here as the bot fires signals.</div>
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
