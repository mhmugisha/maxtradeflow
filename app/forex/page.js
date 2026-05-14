'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchPrices, fetchScreener } from '../../lib/api';

const FOREX_PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'GBP/JPY', 'AUD/USD',
  'USD/CAD', 'EUR/GBP', 'AUD/JPY', 'GBP/AUD', 'CHF/JPY', 'NZD/USD'
];

const PAIR_NAMES = {
  'EUR/USD': 'Euro / US Dollar',
  'GBP/USD': 'Pound / US Dollar',
  'USD/JPY': 'US Dollar / Yen',
  'GBP/JPY': 'Pound / Yen',
  'AUD/USD': 'Aussie / US Dollar',
  'USD/CAD': 'US Dollar / Canadian',
  'EUR/GBP': 'Euro / Pound',
  'AUD/JPY': 'Aussie / Yen',
  'GBP/AUD': 'Pound / Aussie',
  'CHF/JPY': 'Franc / Yen',
  'NZD/USD': 'Kiwi / US Dollar',
};

const FILTERS = ['All Pairs', 'Majors', 'Minors', 'JPY Pairs', 'GBP Pairs'];
const MAJORS = ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD', 'USD/CAD', 'NZD/USD'];
const JPY_PAIRS = ['USD/JPY', 'GBP/JPY', 'AUD/JPY', 'CHF/JPY'];
const GBP_PAIRS = ['GBP/USD', 'GBP/JPY', 'GBP/AUD', 'EUR/GBP'];
const PAGE_SIZE = 7;

export default function ForexPage() {
  const [prices, setPrices] = useState([]);
  const [screener, setScreener] = useState([]);
  const [recentSignals, setRecentSignals] = useState([]);
  const [filter, setFilter] = useState('All Pairs');
  const [lastUpdate, setLastUpdate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = () => {
      fetchPrices().then(p => { setPrices(p); setLastUpdate(new Date().toLocaleTimeString()); });
      fetchScreener().then(setScreener);
    };
    load();
    const interval = setInterval(load, 5000);
    fetch('/api/articles?category=signal&limit=6')
      .then(r => r.json())
      .then(d => setRecentSignals((d.articles || []).filter(a =>
        FOREX_PAIRS.some(p => a.ticker === p.replace('/', ''))
      )))
      .catch(() => {});
    return () => clearInterval(interval);
  }, []);

  // Reset page when filter changes
  useEffect(() => { setPage(1); }, [filter]);

  const forexPrices = prices.filter(p => FOREX_PAIRS.includes(p.symbol));
  const forexScreener = screener.filter(s => FOREX_PAIRS.includes(s.symbol));

  const filteredPrices = forexPrices.filter(p => {
    if (filter === 'All Pairs') return true;
    if (filter === 'Majors') return MAJORS.includes(p.symbol);
    if (filter === 'Minors') return !MAJORS.includes(p.symbol);
    if (filter === 'JPY Pairs') return JPY_PAIRS.includes(p.symbol);
    if (filter === 'GBP Pairs') return GBP_PAIRS.includes(p.symbol);
    return true;
  });

  const totalPages = Math.ceil(filteredPrices.length / PAGE_SIZE);
  const pagedPrices = filteredPrices.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const tradeSignals = forexScreener.filter(s => s.action === 'TRADE').length;
  const getSignal = (symbol) => forexScreener.find(s => s.symbol === symbol);

  const ratingColor = (rating) => {
    if (rating === 'TRADE') return { bg: '#1D9E7520', color: '#1D9E75', border: '#1D9E7540' };
    if (rating === 'WATCH') return { bg: '#EF9F2720', color: '#EF9F27', border: '#EF9F2740' };
    return { bg: '#e0555520', color: '#e05555', border: '#e0555540' };
  };

  return (
    <div style={{ background: '#080d14', minHeight: '100vh', color: '#e2e8f0' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, #0d1f2d 0%, #080d14 100%)', borderBottom: '1px solid #1a2535', padding: '28px 24px 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Live Markets</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 4px' }}>Forex Markets</h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>Live prices · AI signal scores · Recent articles</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { label: 'Pairs Tracked', value: '11', color: '#60c8d4' },
                { label: 'Active Signals', value: tradeSignals.toString(), color: '#1D9E75' },
                { label: 'Strongest', value: 'USD', color: '#f1f5f9' },
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

      {/* Main Content */}
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>

        {/* LEFT COLUMN */}
        <div>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
                background: filter === f ? '#60c8d4' : 'transparent',
                color: filter === f ? '#080d14' : '#64748b',
                border: filter === f ? 'none' : '1px solid #1a2535',
                fontWeight: filter === f ? '600' : '400',
              }}>
                {f}
              </button>
            ))}
          </div>

          {/* Live Prices Table — fixed height via pagination */}
          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', marginBottom: '24px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #1a2535' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Live Prices</div>
              <div style={{ fontSize: '11px', color: '#475569' }}>
                {lastUpdate && <span style={{ color: '#1D9E75' }}>● </span>}
                Updating every 5s {lastUpdate && `· ${lastUpdate}`}
              </div>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #1a2535' }}>
                    {['Pair', 'Bid', 'Ask', 'Spread', 'ADX', 'Score', 'Direction', 'Signal', ''].map(h => (
                      <th key={h} style={{ padding: '10px 12px', color: '#475569', fontWeight: '400', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedPrices.length > 0 ? pagedPrices.map((price, i) => {
                    const signal = getSignal(price.symbol);
                    const rc = signal ? ratingColor(signal.action) : null;
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #0a1020' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#060b11'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: '600', color: '#f1f5f9' }}>{price.symbol}</div>
                          <div style={{ fontSize: '11px', color: '#475569' }}>{PAIR_NAMES[price.symbol]}</div>
                        </td>
                        <td style={{ padding: '12px', color: '#60c8d4', fontFamily: 'monospace', fontWeight: '500' }}>{price.bid}</td>
                        <td style={{ padding: '12px', color: '#60c8d4', fontFamily: 'monospace' }}>{price.ask}</td>
                        <td style={{ padding: '12px', color: '#475569', fontFamily: 'monospace' }}>{price.spread}</td>
                        {/* ADX column */}
                        <td style={{ padding: '12px' }}>
                          {signal ? (
                            <span style={{
                              fontSize: '12px', fontWeight: '600',
                              color: parseFloat(signal.adx) >= 25 ? '#1D9E75' : parseFloat(signal.adx) >= 15 ? '#EF9F27' : '#e05555'
                            }}>
                              {signal.adx}
                            </span>
                          ) : <span style={{ color: '#1a2535' }}>—</span>}
                        </td>
                        {/* Score as X/10 */}
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
                          {signal ? (
                            <span style={{ color: signal.direction === 'LONG' ? '#1D9E75' : '#e05555', fontSize: '12px', fontWeight: '600' }}>
                              {signal.direction === 'LONG' ? '▲' : '▼'} {signal.direction}
                            </span>
                          ) : <span style={{ color: '#1a2535' }}>—</span>}
                        </td>
                        <td style={{ padding: '12px' }}>
                          {signal && rc ? (
                            <span style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, borderRadius: '4px', padding: '3px 8px', fontSize: '10px', fontWeight: '700' }}>
                              {signal.action}
                            </span>
                          ) : <span style={{ color: '#1a2535' }}>—</span>}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <Link href={`/forex/${price.symbol.replace('/', '').toLowerCase()}`} style={{ textDecoration: 'none' }}>
                            <span style={{ fontSize: '11px', color: '#60c8d4', border: '1px solid #1a2535', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                              Analysis →
                            </span>
                          </Link>
                        </td>
                      </tr>
                    );
                  }) : (
                    <tr>
                      <td colSpan={9} style={{ padding: '32px', textAlign: 'center', color: '#475569' }}>Loading prices...</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #1a2535' }}>
                <div style={{ fontSize: '12px', color: '#475569' }}>
                  Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filteredPrices.length)} of {filteredPrices.length} pairs
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{
                    padding: '5px 12px', borderRadius: '5px', fontSize: '12px', cursor: page === 1 ? 'not-allowed' : 'pointer',
                    background: 'transparent', border: '1px solid #1a2535',
                    color: page === 1 ? '#1a2535' : '#60c8d4',
                  }}>← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} style={{
                      padding: '5px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer',
                      background: page === i + 1 ? '#60c8d4' : 'transparent',
                      color: page === i + 1 ? '#080d14' : '#64748b',
                      border: page === i + 1 ? 'none' : '1px solid #1a2535',
                      fontWeight: page === i + 1 ? '600' : '400',
                    }}>{i + 1}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{
                    padding: '5px 12px', borderRadius: '5px', fontSize: '12px', cursor: page === totalPages ? 'not-allowed' : 'pointer',
                    background: 'transparent', border: '1px solid #1a2535',
                    color: page === totalPages ? '#1a2535' : '#60c8d4',
                  }}>Next →</button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Forex Signals — now immediately below table */}
          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid #1a2535' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Recent Forex Signals</div>
              <Link href="/articles" style={{ fontSize: '11px', color: '#60c8d4', textDecoration: 'none' }}>All forex signals →</Link>
            </div>
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {recentSignals.length > 0 ? recentSignals.map((article, i) => (
                <Link key={i} href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#060b11', border: '1px solid #1a2535', borderRadius: '8px', padding: '14px', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = '#60c8d4'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2535'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <span style={{ color: '#60c8d4', fontWeight: '700', fontSize: '13px' }}>{article.ticker}</span>
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
                <div style={{ gridColumn: '1/-1', color: '#475569', fontSize: '13px', padding: '8px 0' }}>
                  Forex signal articles will appear here as the bot fires signals.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div>
          {/* AdSense Top */}
          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a2535' }}>
              <span style={{ fontSize: '10px', color: '#1a2535', textTransform: 'uppercase', letterSpacing: '1px' }}>Advertisement</span>
            </div>
            <div style={{ width: '100%', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2535', fontSize: '12px' }}>
              AdSense 300×250
            </div>
          </div>

          {/* Quick Calculators */}
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
                    <span style={{ fontSize: '16px' }}>{tool.icon}</span>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{tool.name}</span>
                    <span style={{ color: '#60c8d4', marginLeft: 'auto', fontSize: '12px' }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* AdSense Bottom */}
          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '8px 12px', borderBottom: '1px solid #1a2535' }}>
              <span style={{ fontSize: '10px', color: '#1a2535', textTransform: 'uppercase', letterSpacing: '1px' }}>Advertisement</span>
            </div>
            <div style={{ width: '100%', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2535', fontSize: '12px' }}>
              AdSense 300×250
            </div>
          </div>

          {/* Session Status */}
          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a2535' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Session Status</div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {[
                { name: 'Sydney', tz: 10 },
                { name: 'Tokyo', tz: 9 },
                { name: 'London', tz: 1 },
                { name: 'New York', tz: -4 },
              ].map(session => {
                const now = new Date();
                const utc = now.getTime() + now.getTimezoneOffset() * 60000;
                const local = new Date(utc + session.tz * 3600000);
                const h = local.getHours();
                const day = local.getDay();
                const open = day !== 0 && day !== 6 && h >= 9 && h < 17;
                return (
                  <div key={session.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #060b11' }}>
                    <span style={{ fontSize: '13px', color: '#94a3b8' }}>{session.name}</span>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: open ? '#1D9E75' : '#475569' }}>
                      {open ? '● Open' : '○ Closed'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
