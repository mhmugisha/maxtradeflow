'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchPrices, fetchScreener } from '../lib/api';
import { formatPrice } from '../lib/formatPrice';
import { getUpcomingEvents, formatEventTime, formatCountdown } from '../lib/featured-events';

export default function Home() {
  const [prices, setPrices] = useState([]);
  const [screener, setScreener] = useState([]);
  const [recentSignals, setRecentSignals] = useState([]);
  const [recentArticles, setRecentArticles] = useState([]);

  useEffect(() => {
    fetchPrices().then(setPrices);
    fetchScreener().then(setScreener);

    // Fetch recent signal articles
    fetch('/api/articles?category=signal&limit=3')
      .then(r => r.json())
      .then(data => setRecentSignals(data.articles || []))
      .catch(() => {})

    // Fetch recent education articles
    fetch('/api/articles?category=education&limit=3')
      .then(r => r.json())
      .then(data => setRecentArticles(data.articles || []))
      .catch(() => {})

    const pricesInterval = setInterval(() => {
      fetchPrices().then(setPrices);
    }, 5000);

    return () => clearInterval(pricesInterval);
  }, []);

  const getMarketStatus = (timezone) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (timezone * 3600000));
    const hour = localTime.getHours();
    const day = localTime.getDay();
    if (day === 0 || day === 6) return 'Closed';
    if (hour >= 9 && hour < 17) return 'Open';
    return 'Closed';
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const featuredTools = [
    { slug: 'position-size', name: 'Position Size', icon: '⚖️', desc: 'Calculate ideal lot size' },
    { slug: 'risk-reward', name: 'Risk/Reward', icon: '🎯', desc: 'Analyse your trade setup' },
    { slug: 'pip-calculator', name: 'Pip Value', icon: '📐', desc: 'Calculate pip values' },
    { slug: 'compound-interest', name: 'Compound Growth', icon: '📈', desc: 'Project account growth' },
  ]


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
    <div className="min-h-screen" style={{ background: '#080d14' }}>

      {/* Hero Section */}
      <section style={{ background: 'linear-gradient(180deg, #0d1f2d 0%, #080d14 100%)', padding: '64px 24px 48px', borderBottom: '1px solid #1a2535' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: '#60c8d4', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '16px', fontFamily: 'monospace' }}>
            Smart Asset Bot — Live
          </div>
          <h1 style={{ fontSize: 'clamp(32px, 6vw, 64px)', fontWeight: '800', color: '#f1f5f9', lineHeight: '1.1', marginBottom: '20px' }}>
            AI-Powered{' '}
            <span style={{ color: '#60c8d4' }}>Market Signals</span>
            {' '}& Analysis
          </h1>
          <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '32px', maxWidth: '560px', margin: '0 auto 32px', lineHeight: '1.6' }}>
            Real-time signals from Smart Asset Bot. Continuous market scanning across forex, indices, commodities, and crypto. No opinion — just data.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/articles" style={{ textDecoration: 'none' }}>
              <button style={{ background: '#60c8d4', color: '#080d14', padding: '12px 28px', borderRadius: '8px', fontWeight: '700', fontSize: '15px', border: 'none', cursor: 'pointer' }}>
                View Market Signals
              </button>
            </Link>
            <Link href="/tools" style={{ textDecoration: 'none' }}>
              <button style={{ background: 'transparent', color: '#60c8d4', padding: '12px 28px', borderRadius: '8px', fontWeight: '600', fontSize: '15px', border: '1px solid #60c8d4', cursor: 'pointer' }}>
                Trading Calculators
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Live Price Ticker */}
      <section style={{ background: '#0d1520', padding: '12px 0', borderBottom: '1px solid #1a2535', overflow: 'hidden' }}>
        <div className="animate-scroll" style={{ display: 'flex', gap: '32px', whiteSpace: 'nowrap' }}>
          {[...prices, ...prices].slice(0, 30).map((price, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
              <span style={{ color: '#94a3b8', fontWeight: '600' }}>{price.symbol}</span>
              <span style={{ color: '#60c8d4', fontFamily: 'monospace' }}>{price.bid}</span>
              <span style={{ color: '#1a2535' }}>|</span>
            </div>
          ))}
        </div>
      </section>


      {/* Economic Calendar + Event Explainers */}
      <section style={{ padding: '48px 24px', background: '#080d14' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
            {(() => {
              const events = getUpcomingEvents();
              return (
                <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '11px', color: '#60c8d4', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>This Week</div>
                    <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>Economic Calendar</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                    {events.map((evt, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 14px', background: '#080d14', border: '1px solid #1a2535', borderRadius: '6px' }}>
                        <div>
                          <div style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: '500' }}>{evt.flag}&nbsp;&nbsp;{evt.code} {evt.name}</div>
                          <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px' }}>{formatEventTime(evt.datetime)}</div>
                        </div>
                        <span style={{ background: '#e0555520', color: '#e05555', border: '1px solid #e0555540', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', fontWeight: '700' }}>{evt.impact}</span>
                      </div>
                    ))}
                  </div>
                  <Link href="/economic-calendar" style={{ color: '#60c8d4', fontSize: '13px', textDecoration: 'none', textAlign: 'right', marginBottom: '14px' }}>See full calendar →</Link>
                  {events.length > 0 && (
                    <div style={{ marginTop: 'auto', background: '#60c8d420', border: '1px solid #60c8d440', borderRadius: '6px', padding: '10px 12px' }}>
                      <div style={{ color: '#60c8d4', fontSize: '9px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '4px' }}>⚡ Next Major Event</div>
                      <div style={{ color: '#f1f5f9', fontSize: '13px', fontWeight: '600' }}>
                        {events[0].flag} {events[0].code} {events[0].short} · {formatCountdown(events[0].datetime)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', padding: '24px', display: 'flex', flexDirection: 'column' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '11px', color: '#60c8d4', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Learn The Events</div>
                <h3 style={{ fontSize: '20px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>Event Explainers</h3>
              </div>
              <Link href="/education/cpi-explained" style={{ textDecoration: 'none', marginBottom: '14px' }}>
                <div style={{ background: '#080d14', border: '1px solid #1a2535', borderRadius: '8px', padding: '16px', cursor: 'pointer', transition: 'border-color 0.2s' }}>
                  <div style={{ color: '#60c8d4', fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>📖 Featured</div>
                  <div style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '600', marginBottom: '6px', lineHeight: '1.4' }}>What CPI Means for the USD and Global Markets</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px', lineHeight: '1.5' }}>A trader's guide to inflation data and how it moves currencies, indices, gold, and crypto.</div>
                </div>
              </Link>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '14px' }}>
                <Link href="/education/nfp-explained" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a2535' }}>
                  <span style={{ color: '#c8dce8', fontSize: '13px' }}>Understanding NFP &amp; the USD</span>
                  <span style={{ color: '#60c8d4', fontSize: '13px' }}>→</span>
                </Link>
                <Link href="/education/fomc-explained" style={{ textDecoration: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0' }}>
                  <span style={{ color: '#c8dce8', fontSize: '13px' }}>FOMC: How Rate Decisions Move Markets</span>
                  <span style={{ color: '#60c8d4', fontSize: '13px' }}>→</span>
                </Link>
              </div>
              <Link href="/education" style={{ marginTop: 'auto', color: '#60c8d4', fontSize: '13px', textDecoration: 'none', textAlign: 'right' }}>See all explainers →</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Signal Articles */}
      <section style={{ padding: '48px 24px', background: '#0d1520', borderTop: '1px solid #1a2535' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#60c8d4', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Auto-published by Smart Asset Bot</div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>Latest Market Signals</h2>
            </div>
            <Link href="/articles" style={{ color: '#60c8d4', fontSize: '13px', textDecoration: 'none' }}>All signals →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {recentSignals.length > 0 ? recentSignals.map((article, i) => (
              <Link key={i} href={`/articles/${article.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#080d14', border: '1px solid #1a2535', borderRadius: '10px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#60c8d4'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2535'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ color: '#60c8d4', fontSize: '13px', fontWeight: '700' }}>{article.ticker}</span>
                    <span style={{ background: '#1D9E7520', color: '#1D9E75', border: '1px solid #1D9E7540', borderRadius: '4px', padding: '2px 8px', fontSize: '10px', fontWeight: '700' }}>
                      {article.rating || 'TRADE'}
                    </span>
                  </div>
                  <h3 style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '600', margin: '0 0 8px', lineHeight: '1.4' }}>{article.title}</h3>
                  {(article.entry_price || article.stop_loss || article.take_profit || article.rr_ratio) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                      {article.entry_price && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '6px 8px', background: '#0d1520', borderRadius: '4px' }}>
                          <span style={{ color: '#3a6070' }}>Entry</span>
                          <span style={{ color: '#60c8d4', fontWeight: '500' }}>{formatPrice(article.entry_price, article.ticker)}</span>
                        </div>
                      )}
                      {article.rr_ratio && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '6px 8px', background: '#0d1520', borderRadius: '4px' }}>
                          <span style={{ color: '#3a6070' }}>R:R</span>
                          <span style={{ color: '#60c8d4', fontWeight: '500' }}>{`1:${parseFloat(article.rr_ratio).toFixed(2)}`}</span>
                        </div>
                      )}
                      {article.stop_loss && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '6px 8px', background: '#0d1520', borderRadius: '4px' }}>
                          <span style={{ color: '#3a6070' }}>SL</span>
                          <span style={{ color: '#e05555', fontWeight: '500' }}>{formatPrice(article.stop_loss, article.ticker)}</span>
                        </div>
                      )}
                      {article.take_profit && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', padding: '6px 8px', background: '#0d1520', borderRadius: '4px' }}>
                          <span style={{ color: '#3a6070' }}>TP</span>
                          <span style={{ color: '#1D9E75', fontWeight: '500' }}>{formatPrice(article.take_profit, article.ticker)}</span>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12px' }}>
                    <span>{formatDate(article.created_at)}</span>
                    <span>{article.score}/10</span>
                  </div>
                </div>
              </Link>
            )) : (
              <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'center' }}>
                <div style={{ maxWidth: '600px', width: '100%', background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', padding: '40px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px', lineHeight: '1' }}>📡</div>
                  <p style={{ color: '#f1f5f9', fontSize: '15px', fontWeight: '500', margin: '0 0 6px 0' }}>Waiting for the next qualifying setup</p>
                  <p style={{ color: '#64748b', fontSize: '12px', lineHeight: '1.6', margin: 0, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto' }}>The bot scans markets continuously. Signals appear here when high-conviction trades emerge.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Tools Preview */}
      <section style={{ padding: '48px 24px', background: '#080d14', borderTop: '1px solid #1a2535' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#60c8d4', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Free Tools</div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>Trading Calculators</h2>
            </div>
            <Link href="/tools" style={{ color: '#60c8d4', fontSize: '13px', textDecoration: 'none' }}>All 8 tools →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '12px' }}>
            {featuredTools.map(tool => (
              <Link key={tool.slug} href={`/tools/${tool.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#60c8d4'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2535'}
                >
                  <div style={{ fontSize: '24px', marginBottom: '10px' }}>{tool.icon}</div>
                  <div style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{tool.name}</div>
                  <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '12px' }}>{tool.desc}</div>
                  <div style={{ color: '#60c8d4', fontSize: '12px' }}>Open Calculator →</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Education Preview */}
      <section style={{ padding: '48px 24px', background: '#0d1520', borderTop: '1px solid #1a2535' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#60c8d4', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Learn Trading</div>
              <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>Education</h2>
            </div>
            <Link href="/education" style={{ color: '#60c8d4', fontSize: '13px', textDecoration: 'none' }}>All articles →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
            {recentArticles.length > 0 ? recentArticles.map((article, i) => (
              <Link key={i} href={`/education/${article.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#080d14', border: '1px solid #1a2535', borderRadius: '10px', padding: '20px', cursor: 'pointer', transition: 'border-color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#60c8d4'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2535'}
                >
                  <div style={{ color: '#60c8d4', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Education</div>
                  <h3 style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '600', margin: '0 0 8px', lineHeight: '1.4' }}>{article.title}</h3>
                  <div style={{ color: '#64748b', fontSize: '12px' }}>{formatDate(article.created_at)}</div>
                </div>
              </Link>
            )) : (
              [
                { title: 'Understanding ADX: How to Measure Trend Strength', slug: 'understanding-adx' },
                { title: 'RSI Divergence: A Signal Within a Signal', slug: 'rsi-divergence' },
                { title: 'The 1% Risk Rule Every Trader Must Follow', slug: 'one-percent-risk-rule' },
              ].map((a, i) => (
                <Link key={i} href={`/education/${a.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ background: '#080d14', border: '1px solid #1a2535', borderRadius: '10px', padding: '20px' }}>
                    <div style={{ color: '#60c8d4', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Education</div>
                    <h3 style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '600', margin: 0, lineHeight: '1.4' }}>{a.title}</h3>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Market Sessions */}
      <section style={{ padding: '40px 24px', background: '#080d14', borderTop: '1px solid #1a2535' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 20px', textAlign: 'center' }}>Market Sessions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', maxWidth: '600px', margin: '0 auto' }}>
            {[
              { name: 'Sydney', tz: 10 },
              { name: 'Tokyo', tz: 9 },
              { name: 'London', tz: 1 },
              { name: 'New York', tz: -4 },
            ].map(session => {
              const status = getMarketStatus(session.tz)
              return (
                <div key={session.name} style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '8px', padding: '14px', textAlign: 'center' }}>
                  <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>{session.name}</div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: status === 'Open' ? '#1D9E75' : '#64748b' }}>
                    {status === 'Open' ? '● Open' : '○ Closed'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0d1520', borderTop: '1px solid #1a2535', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', marginBottom: '16px' }}>
            {[
              { href: '/', label: 'Home' },
              { href: '/articles', label: 'Signals' },
              { href: '/education', label: 'Education' },
              { href: '/tools', label: 'Tools' },
              { href: '/guides', label: 'Guides' },
              { href: '/subscribe', label: 'Subscribe' },
            ].map(link => (
              <Link key={link.href} href={link.href} style={{ color: '#64748b', textDecoration: 'none', fontSize: '14px' }}>
                {link.label}
              </Link>
            ))}
          </div>
          <p style={{ color: '#374151', fontSize: '12px', textAlign: 'center', margin: 0 }}>
            © 2026 MaxTradeFlow · Data powered by cTrader · Analysis generated by AI · Not financial advice
          </p>
        </div>
      </footer>
    </div>
  );
}
