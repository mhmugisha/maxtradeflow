'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchPrices, fetchScreener } from '../lib/api';

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
            Real-time signals from Smart Asset Bot. Live screener across 15 instruments. No opinion — just data.
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

      {/* Live Signal Scores */}
      <section style={{ padding: '48px 24px', background: '#080d14' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>Live Signal Scores</h2>
            <Link href="/articles" style={{ color: '#60c8d4', fontSize: '13px', textDecoration: 'none' }}>View all signals →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
            {screener.map((signal, index) => (
              <div key={index} style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '8px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '700', color: '#f1f5f9', fontSize: '14px' }}>{signal.symbol}</span>
                  <span style={{
                    padding: '2px 8px', borderRadius: '4px', fontSize: '10px', fontWeight: '700',
                    background: signal.action === 'TRADE' ? '#1D9E7520' : signal.action === 'WATCH' ? '#EF9F2720' : '#e0555520',
                    color: signal.action === 'TRADE' ? '#1D9E75' : signal.action === 'WATCH' ? '#EF9F27' : '#e05555',
                    border: `1px solid ${signal.action === 'TRADE' ? '#1D9E7540' : signal.action === 'WATCH' ? '#EF9F2740' : '#e0555540'}`,
                  }}>
                    {signal.action}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  <span style={{ color: signal.direction === 'LONG' ? '#1D9E75' : '#e05555' }}>{signal.direction}</span>
                  {' · '}Score {signal.score}
                </div>
                <div style={{ fontSize: '11px', color: '#475569', marginTop: '2px' }}>ADX {signal.adx}</div>
              </div>
            ))}
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
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: '12px' }}>
                    <span>{formatDate(article.created_at)}</span>
                    <span>{article.score}/10</span>
                  </div>
                </div>
              </Link>
            )) : (
              <div style={{ gridColumn: '1/-1', color: '#64748b', fontSize: '14px', padding: '20px 0' }}>
                Signals are auto-published when the bot fires. Check back soon.
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
