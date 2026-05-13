'use client'
// app/tools/page.js

import Link from 'next/link'


const tools = [
  {
    slug: 'position-size',
    name: 'Position Size Calculator',
    description: 'Calculate the ideal position size based on your account balance, risk percentage and stop loss distance.',
    icon: '⚖️',
    category: 'Risk Management',
    action: 'Calculate Size',
  },
  {
    slug: 'pip-calculator',
    name: 'Pip Calculator',
    description: 'Calculate the pip value for any currency pair, lot size and account currency instantly.',
    icon: '📐',
    category: 'Forex',
    action: 'Calculate Pips',
  },
  {
    slug: 'risk-reward',
    name: 'Risk/Reward Calculator',
    description: 'Determine your risk-reward ratio and potential profit or loss before entering a trade.',
    icon: '🎯',
    category: 'Risk Management',
    action: 'Calculate R:R',
  },
  {
    slug: 'margin-calculator',
    name: 'Margin Calculator',
    description: 'Calculate required margin, free margin and margin level for any trade size and leverage.',
    icon: '🏦',
    category: 'Risk Management',
    action: 'Calculate Margin',
  },
  {
    slug: 'profit-loss',
    name: 'P&L Calculator',
    description: 'Calculate your profit or loss on any trade based on entry, exit price and lot size.',
    icon: '💰',
    category: 'Calculators',
    action: 'Calculate P&L',
  },
  {
    slug: 'compound-interest',
    name: 'Compound Interest',
    description: 'See how your trading account grows over time with consistent monthly returns compounded.',
    icon: '📈',
    category: 'Calculators',
    action: 'Calculate Growth',
  },
  {
    slug: 'atr-volatility',
    name: 'ATR Volatility',
    description: 'Calculate Average True Range to measure market volatility and set dynamic stop losses.',
    icon: '📊',
    category: 'Market Analysis',
    action: 'Calculate ATR',
  },
  {
    slug: 'session-converter',
    name: 'Session Time Converter',
    description: 'Convert trading session times (London, New York, Tokyo, Sydney) to your local timezone.',
    icon: '🕐',
    category: 'Tools',
    action: 'Convert Times',
  },
]

const categories = ['All', 'Risk Management', 'Forex', 'Calculators', 'Market Analysis', 'Tools']

export default function ToolsPage() {
  return (
    <div style={{ background: '#080d14', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Hero */}
      <div style={{
        background: 'linear-gradient(180deg, #0d1520 0%, #080d14 100%)',
        borderBottom: '1px solid #1a2535',
        padding: '48px 0 40px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: '13px', color: '#60c8d4', marginBottom: '12px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Free Tools
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: '700',
            color: '#f1f5f9',
            margin: '0 0 12px',
            lineHeight: '1.15',
          }}>
            Professional Trading Calculators
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '520px', margin: 0, lineHeight: '1.6' }}>
            Free, accurate calculators built for serious traders. Calculate position sizes, pip values, margins and more.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '32px' }}>
          {categories.map((cat, i) => (
            <button key={cat} style={{
              padding: '8px 18px',
              borderRadius: '6px',
              border: i === 0 ? 'none' : '1px solid #1a2535',
              background: i === 0 ? '#60c8d4' : 'transparent',
              color: i === 0 ? '#080d14' : '#94a3b8',
              fontSize: '13px',
              fontWeight: i === 0 ? '600' : '400',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}>
              {cat}
            </button>
          ))}
        </div>

        {/* Tools Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '16px',
          marginBottom: '48px',
        }}>
          {tools.map((tool) => (
            <Link key={tool.slug} href={`/tools/${tool.slug}`} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#0d1520',
                border: '1px solid #1a2535',
                borderRadius: '10px',
                padding: '24px',
                cursor: 'pointer',
                transition: 'border-color 0.2s, transform 0.2s',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#60c8d4'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#1a2535'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '12px' }}>
                  <div style={{
                    width: '44px', height: '44px',
                    background: '#060b11',
                    border: '1px solid #1a2535',
                    borderRadius: '8px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '20px', flexShrink: 0,
                  }}>
                    {tool.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: '#60c8d4', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>
                      {tool.category}
                    </div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#f1f5f9', lineHeight: '1.3' }}>
                      {tool.name}
                    </h3>
                  </div>
                </div>
                <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', margin: '0 0 16px', flex: 1 }}>
                  {tool.description}
                </p>
                <div style={{ color: '#60c8d4', fontSize: '13px', fontWeight: '500', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {tool.action} →
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #0d1f2d 0%, #0a1628 100%)',
          border: '1px solid #1a3a4a',
          borderRadius: '12px',
          padding: '32px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
        }}>
          {[
            { icon: '🆓', title: '100% Free', desc: 'All calculators free, no signup required' },
            { icon: '🎯', title: 'Accurate', desc: 'Built with professional-grade formulas' },
            { icon: '📱', title: 'Mobile Friendly', desc: 'Works on any device, anywhere' },
            { icon: '⚡', title: 'Instant Results', desc: 'Real-time calculations as you type' },
          ].map(item => (
            <div key={item.title} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '22px' }}>{item.icon}</span>
              <div>
                <div style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '14px', marginBottom: '4px' }}>{item.title}</div>
                <div style={{ color: '#64748b', fontSize: '13px' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
