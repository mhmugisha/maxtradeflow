'use client';
// app/stocks/page.js

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchPrices, fetchScreener } from '../../lib/api';

const STOCK_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA'];

const STOCK_INFO = {
  'AAPL':  { display: 'AAPL',  name: 'Apple Inc.',          icon: '',  color: '#A2AAAD', decimals: 2, sector: 'Tech' },
  'MSFT':  { display: 'MSFT',  name: 'Microsoft Corp.',     icon: '⊞',  color: '#00A4EF', decimals: 2, sector: 'Tech' },
  'GOOGL': { display: 'GOOGL', name: 'Alphabet Inc.',       icon: 'G',  color: '#4285F4', decimals: 2, sector: 'Tech' },
  'AMZN':  { display: 'AMZN',  name: 'Amazon.com Inc.',     icon: 'a',  color: '#FF9900', decimals: 2, sector: 'Consumer' },
  'NVDA':  { display: 'NVDA',  name: 'NVIDIA Corp.',        icon: '▲',  color: '#76B900', decimals: 2, sector: 'Tech' },
  'META':  { display: 'META',  name: 'Meta Platforms Inc.', icon: '∞',  color: '#0668E1', decimals: 2, sector: 'Tech' },
  'TSLA':  { display: 'TSLA',  name: 'Tesla Inc.',          icon: 'T',  color: '#E31937', decimals: 2, sector: 'Consumer' },
};

const FILTERS = ['All Stocks', 'Tech', 'Consumer'];
const PAGE_SIZE = 7;

export default function StocksPage() {
  const [prices, setPrices] = useState([]);
  const [screener, setScreener] = useState([]);
  const [recentSignals, setRecentSignals] = useState([]);
  const [filter, setFilter] = useState('All Stocks');
  const [lastUpdate, setLastUpdate] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = () => {
      fetchPrices().then(p => { setPrices(p); setLastUpdate(new Date().toLocaleTimeString()); });
      fetchScreener().then(setScreener);
    };
    load();
    const interval = setInterval(load, 5000);
    fetch('/api/articles?category=signal&limit=10')
      .then(r => r.json())
      .then(d => setRecentSignals((d.articles || []).filter(a => STOCK_SYMBOLS.includes(a.ticker))))
      .catch(() => {});
    return () => clearInterval(interval);
  }, []);

  useEffect(() => { setPage(1); }, [filter]);

  const stockPrices = prices.filter(p => STOCK_SYMBOLS.includes(p.symbol));
  const stockScreener = screener.filter(s => STOCK_SYMBOLS.includes(s.symbol));
  const tradeSignals = stockScreener.filter(s => s.action === 'TRADE').length;

  // Build a list to display: even with no live prices, we want to render the stock list
  const stocksToShow = STOCK_SYMBOLS.map(sym => {
    const live = stockPrices.find(p => p.symbol === sym);
    return live || { symbol: sym };
  });

  const filteredStocks = stocksToShow.filter(s => {
    const info = STOCK_INFO[s.symbol];
    if (filter === 'All Stocks') return true;
    return info?.sector === filter;
  });

  const totalPages = Math.ceil(filteredStocks.length / PAGE_SIZE);
  const pagedStocks = filteredStocks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const getSignal = (symbol) => stockScreener.find(s => s.symbol === symbol);
  const getInfo = (symbol) => STOCK_INFO[symbol] || { display: symbol, name: symbol, icon: '📈', color: '#60c8d4', decimals: 2, sector: 'Other' };

  const ratingColor = (rating) => {
    if (rating === 'TRADE') return { bg: '#1D9E7520', color: '#1D9E75', border: '#1D9E7540' };
    if (rating === 'WATCH') return { bg: '#EF9F2720', color: '#EF9F27', border: '#EF9F2740' };
    return { bg: '#e0555520', color: '#e05555', border: '#e0555540' };
  };

  const getSignalAge = (createdAt) => {
    const now = new Date();
    const created = new Date(createdAt);
    const diffMs = now - created;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    if (diffMins < 1) return { label: 'Just now', color: '#1D9E75', dot: '🟢' };
    if (diffMins < 30) return { label: `${diffMins}m ago`, color: '#1D9E75', dot: '🟢' };
    if (diffMins < 120) return { label: `${diffMins}m ago`, color: '#EF9F27', dot: '🟡' };
    if (diffHours < 24) return { label: `${diffHours}h ago`, color: '#e05555', dot: '🔴' };
    return { label: `${Math.floor(diffHours/24)}d ago`, color: '#475569', dot: '⚫' };
  };

  return (
    <div style={{ background: '#080d14', minHeight: '100vh', color: '#e2e8f0' }}>

      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, #0d1f2d 0%, #080d14 100%)', borderBottom: '1px solid #1a2535', padding: '28px 24px 20px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Live Markets</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 4px' }}>Stocks (Mag 7)</h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>AAPL · MSFT · GOOGL · AMZN · NVDA · META · TSLA · Charts & AI signal scores</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { label: 'Stocks Tracked', value: '7', color: '#60c8d4' },
                { label: 'Active Signals', value: tradeSignals.toString(), color: '#1D9E75' },
                { label: 'Coverage', value: 'US', color: '#EF9F27' },
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

        {/* LEFT */}
        <div>
          {/* Feature Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
            {['AAPL', 'NVDA', 'TSLA'].map(symbol => {
              const price = stockPrices.find(p => p.symbol === symbol);
              const signal = getSignal(symbol);
              const info = getInfo(symbol);
              const rc = signal ? ratingColor(signal.action) : null;
              return (
                <Link key={symbol} href={`/stocks/${symbol.toLowerCase()}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', padding: '20px', cursor: 'pointer' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = info.color}
                    onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2535'}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: info.color + '20', border: `1px solid ${info.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', color: info.color, fontWeight: '700' }}>
                          {info.icon}
                        </div>
                        <div>
                          <div style={{ fontWeight: '700', color: '#f1f5f9', fontSize: '14px' }}>{info.display}</div>
                          <div style={{ fontSize: '10px', color: '#475569' }}>{info.name}</div>
                        </div>
                      </div>
                      {signal && rc && (
                        <span style={{ background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`, borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: '700' }}>
                          {signal.action}
                        </span>
                      )}
                    </div>
                    {price ? (
                      <div style={{ fontSize: '20px', fontWeight: '700', color: info.color, fontFamily: 'monospace', marginBottom: '8px' }}>
                        ${parseFloat(price.bid).toFixed(info.decimals)}
                      </div>
                    ) : (
                      <div style={{ fontSize: '12px', color: '#475569', marginBottom: '8px' }}>Live data coming soon</div>
                    )}
                    {signal && (
                      <div>
                        <div style={{ fontSize: '11px', color: signal.direction === 'LONG' ? '#1D9E75' : '#e05555', marginBottom: '4px' }}>
                          {signal.direction === 'LONG' ? '▲' : '▼'} {signal.direction} · {signal.score}/10
                        </div>
                        <div style={{ background: '#1a2535', borderRadius: '2px', height: '3px' }}>
                          <div style={{ height: '3px', borderRadius: '2px', background: signal.score >= 8 ? '#1D9E75' : '#EF9F27', width: `${signal.score * 10}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Filter Tabs */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} style={{
                padding: '7px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
                background: filter === f ? '#60c8d4' : 'transparent',
                color: filter === f ? '#080d14' : '#64748b',
                border: filter === f ? 'none' : '1px solid #1a2535',
                fontWeight: filter === f ? '600' : '400',
              }}>{f}</button>
            ))}
          </div>

          {/* Stocks Table */}
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
                    {['Stock', 'Bid', 'Ask', 'Spread', 'ADX', 'Score', 'Direction', 'Signal', ''].map(h => (
                      <th key={h} style={{ padding: '10px 12px', color: '#475569', fontWeight: '400', textAlign: 'left', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagedStocks.map((stock, i) => {
                    const signal = getSignal(stock.symbol);
                    const rc = signal ? ratingColor(signal.action) : null;
                    const info = getInfo(stock.symbol);
                    const hasPrice = stock.bid !== undefined;
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid #0a1020' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#060b11'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: info.color + '20', border: `1px solid ${info.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: info.color, fontWeight: '700', flexShrink: 0 }}>
                              {info.icon}
                            </div>
                            <div>
                              <div style={{ fontWeight: '600', color: '#f1f5f9' }}>{info.display}</div>
                              <div style={{ fontSize: '11px', color: '#475569' }}>{info.name}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '12px', color: hasPrice ? '#e05555' : '#1a2535', fontFamily: 'monospace', fontWeight: '500' }}>
                          {hasPrice ? `$${parseFloat(stock.bid).toFixed(info.decimals)}` : '—'}
                        </td>
                        <td style={{ padding: '12px', color: hasPrice ? '#1D9E75' : '#1a2535', fontFamily: 'monospace' }}>
                          {hasPrice ? `$${parseFloat(stock.ask).toFixed(info.decimals)}` : '—'}
                        </td>
                        <td style={{ padding: '12px', color: '#475569', fontFamily: 'monospace' }}>{hasPrice ? stock.spread : '—'}</td>
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
                          <Link href={`/stocks/${stock.symbol.toLowerCase()}`} style={{ textDecoration: 'none' }}>
                            <span style={{ fontSize: '11px', color: '#60c8d4', border: '1px solid #1a2535', borderRadius: '4px', padding: '3px 8px', cursor: 'pointer', whiteSpace: 'nowrap' }}>Analysis →</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderTop: '1px solid #1a2535' }}>
                <div style={{ fontSize: '12px', color: '#475569' }}>Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filteredStocks.length)} of {filteredStocks.length}</div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ padding: '5px 12px', borderRadius: '5px', fontSize: '12px', cursor: page === 1 ? 'not-allowed' : 'pointer', background: 'transparent', border: '1px solid #1a2535', color: page === 1 ? '#1a2535' : '#60c8d4' }}>← Prev</button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} onClick={() => setPage(i + 1)} style={{ padding: '5px 10px', borderRadius: '5px', fontSize: '12px', cursor: 'pointer', background: page === i + 1 ? '#60c8d4' : 'transparent', color: page === i + 1 ? '#080d14' : '#64748b', border: page === i + 1 ? 'none' : '1px solid #1a2535', fontWeight: page === i + 1 ? '600' : '400' }}>{i + 1}</button>
                  ))}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ padding: '5px 12px', borderRadius: '5px', fontSize: '12px', cursor: page === totalPages ? 'not-allowed' : 'pointer', background: 'transparent', border: '1px solid #1a2535', color: page === totalPages ? '#1a2535' : '#60c8d4' }}>Next →</button>
                </div>
              </div>
            )}
          </div>

          {/* Recent Signals */}
          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '14px 16px', borderBottom: '1px solid #1a2535' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Recent Stock Signals</div>
              <Link href="/articles" style={{ fontSize: '11px', color: '#60c8d4', textDecoration: 'none' }}>All signals →</Link>
            </div>
            <div style={{ padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
              {recentSignals.length > 0 ? recentSignals.map((article, i) => {
                const info = getInfo(article.ticker);
                return (
                  <Link key={i} href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#060b11', border: '1px solid #1a2535', borderRadius: '8px', padding: '14px' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#60c8d4'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2535'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span style={{ color: info.color, fontWeight: '700', fontSize: '13px' }}>{article.ticker}</span>
                        <span style={{ background: '#1D9E7520', color: '#1D9E75', border: '1px solid #1D9E7540', borderRadius: '4px', padding: '2px 6px', fontSize: '10px', fontWeight: '700' }}>{article.rating}</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px', lineHeight: '1.4' }}>{article.title}</div>
                      {article.entry_price && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px', marginBottom: '8px' }}>
                          {[
                            { label: 'Entry', value: parseFloat(article.entry_price).toFixed(2), color: '#60c8d4' },
                            { label: 'SL', value: parseFloat(article.stop_loss).toFixed(2), color: '#e05555' },
                            { label: 'TP', value: parseFloat(article.take_profit).toFixed(2), color: '#1D9E75' },
                            { label: 'R:R', value: `1:${parseFloat(article.rr_ratio).toFixed(1)}`, color: '#f1f5f9' },
                          ].map(item => (
                            <div key={item.label} style={{ background: '#0a1020', borderRadius: '4px', padding: '4px 6px', textAlign: 'center' }}>
                              <div style={{ fontSize: '9px', color: '#475569', marginBottom: '2px' }}>{item.label}</div>
                              <div style={{ fontSize: '10px', fontWeight: '600', color: item.color, fontFamily: 'monospace' }}>{item.value}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#475569' }}>
                        <span style={{ color: getSignalAge(article.created_at).color }}>
                          {getSignalAge(article.created_at).dot} {getSignalAge(article.created_at).label}
                        </span>
                        <span>{article.score}/10</span>
                      </div>
                    </div>
                  </Link>
                );
              }) : (
                <div style={{ color: '#475569', fontSize: '13px' }}>Stock signal articles will appear here as the bot fires signals.</div>
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
            <div style={{ width: '100%', height: '250px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1a2535', fontSize: '12px' }}>AdSense 300×250</div>
          </div>

          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a2535' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Top Signals Today</div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {stockScreener.filter(s => s.action === 'TRADE').slice(0, 5).map((signal, i) => {
                const info = getInfo(signal.symbol);
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 16px', borderBottom: '1px solid #060b11' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: info.color, fontSize: '14px', fontWeight: '700' }}>{info.icon}</span>
                      <div>
                        <div style={{ fontWeight: '600', color: '#f1f5f9', fontSize: '13px' }}>{info.display}</div>
                        <div style={{ fontSize: '11px', color: signal.direction === 'LONG' ? '#1D9E75' : '#e05555' }}>{signal.direction === 'LONG' ? '▲' : '▼'} {signal.direction}</div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#1D9E75' }}>{signal.score}</div>
                      <div style={{ fontSize: '10px', color: '#475569' }}>/ 10</div>
                    </div>
                  </div>
                );
              })}
              {stockScreener.filter(s => s.action === 'TRADE').length === 0 && (
                <div style={{ padding: '16px', color: '#475569', fontSize: '13px' }}>No TRADE signals active</div>
              )}
            </div>
          </div>

          <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', marginBottom: '20px', overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: '1px solid #1a2535' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#f1f5f9' }}>Quick Calculators</div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {[
                { icon: '⚖️', name: 'Position Size', href: '/tools/position-size' },
                { icon: '💰', name: 'P&L Calculator', href: '/tools/profit-loss' },
                { icon: '🎯', name: 'Risk/Reward', href: '/tools/risk-reward' },
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