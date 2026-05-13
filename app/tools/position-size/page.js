'use client'
// app/tools/position-size/page.js

import { useState, useEffect } from 'react'
import Link from 'next/link'

const PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'GBP/JPY', 'AUD/USD',
  'USD/CAD', 'EUR/GBP', 'AUD/JPY', 'CHF/JPY', 'GBP/AUD',
  'NZD/USD', 'XAU/USD', 'US500', 'NAS100', 'US30',
]

const JPY_PAIRS = ['USD/JPY', 'GBP/JPY', 'AUD/JPY', 'CHF/JPY']
const METAL_PAIRS = ['XAU/USD']
const INDEX_PAIRS = ['US500', 'NAS100', 'US30']

function getInfo(pair) {
  if (JPY_PAIRS.includes(pair)) return { pipSize: 0.01, pipLabel: '0.01', pipValue: 1000 }
  if (METAL_PAIRS.includes(pair)) return { pipSize: 0.1, pipLabel: '0.1', pipValue: 1 }
  if (INDEX_PAIRS.includes(pair)) return { pipSize: 1, pipLabel: '1 point', pipValue: 1 }
  return { pipSize: 0.0001, pipLabel: '0.0001', pipValue: 10 }
}

export default function PositionSizeCalculator() {
  const [balance, setBalance] = useState('10000')
  const [risk, setRisk] = useState('1')
  const [stopLoss, setStopLoss] = useState('50')
  const [pair, setPair] = useState('EUR/USD')
  const [result, setResult] = useState(null)

  useEffect(() => {
    calculate()
  }, [balance, risk, stopLoss, pair])

  function calculate() {
    const b = parseFloat(balance)
    const r = parseFloat(risk)
    const sl = parseFloat(stopLoss)
    if (!b || !r || !sl) { setResult(null); return }

    const riskAmount = (b * r) / 100
    const info = getInfo(pair)

    let lotSize, units
    if (INDEX_PAIRS.includes(pair)) {
      lotSize = riskAmount / sl
      units = lotSize
    } else if (METAL_PAIRS.includes(pair)) {
      const pipValuePerLot = 100
      lotSize = riskAmount / (sl * pipValuePerLot)
      units = lotSize * 100
    } else {
      const pipValuePerLot = JPY_PAIRS.includes(pair) ? 1000 : 10
      lotSize = riskAmount / (sl * pipValuePerLot)
      units = lotSize * 100000
    }

    setResult({
      lotSize: lotSize.toFixed(2),
      units: Math.round(units).toLocaleString(),
      riskAmount: riskAmount.toFixed(2),
      pipInfo: info.pipLabel,
    })
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: '#060b11', border: '1px solid #1a2535',
    borderRadius: '8px', color: '#f1f5f9', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }
  const labelStyle = { color: '#94a3b8', fontSize: '13px', marginBottom: '6px', display: 'block' }

  return (
    <div style={{ background: '#080d14', minHeight: '100vh', color: '#e2e8f0' }}>
      {/* Header */}
      <div style={{ background: '#0d1520', borderBottom: '1px solid #1a2535', padding: '16px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            <Link href="/tools" style={{ color: '#60c8d4', textDecoration: 'none' }}>Tools</Link>
            {' › '} Position Size Calculator
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px', alignItems: 'start' }}>

          {/* Left — Calculator */}
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 8px' }}>
              Position Size Calculator
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px', lineHeight: '1.6' }}>
              Calculate the correct lot size for any trade based on your account balance, risk tolerance and stop loss distance.
            </p>

            {/* Calculator Card */}
            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Account Balance (USD)</label>
                  <input
                    type="number" value={balance}
                    onChange={e => setBalance(e.target.value)}
                    style={inputStyle} placeholder="10000"
                    onFocus={e => e.target.style.borderColor = '#60c8d4'}
                    onBlur={e => e.target.style.borderColor = '#1a2535'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Risk Percentage (%)</label>
                  <input
                    type="number" value={risk}
                    onChange={e => setRisk(e.target.value)}
                    style={inputStyle} placeholder="1" step="0.1"
                    onFocus={e => e.target.style.borderColor = '#60c8d4'}
                    onBlur={e => e.target.style.borderColor = '#1a2535'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Stop Loss (pips)</label>
                  <input
                    type="number" value={stopLoss}
                    onChange={e => setStopLoss(e.target.value)}
                    style={inputStyle} placeholder="50"
                    onFocus={e => e.target.style.borderColor = '#60c8d4'}
                    onBlur={e => e.target.style.borderColor = '#1a2535'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Currency Pair</label>
                  <select
                    value={pair} onChange={e => setPair(e.target.value)}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = '#60c8d4'}
                    onBlur={e => e.target.style.borderColor = '#1a2535'}
                  >
                    {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              {/* Result */}
              {result && (
                <div style={{ background: '#060b11', border: '1px solid #1a3a2a', borderRadius: '10px', padding: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Recommended Position Size
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: '700', color: '#1D9E75', lineHeight: '1', marginBottom: '4px' }}>
                    {result.lotSize} <span style={{ fontSize: '20px', color: '#64748b' }}>Lots</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                    {result.units} units
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: '#0a1628', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Risk Amount</div>
                      <div style={{ color: '#e05555', fontWeight: '600', fontSize: '16px' }}>${result.riskAmount}</div>
                    </div>
                    <div style={{ background: '#0a1628', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Pip Size</div>
                      <div style={{ color: '#60c8d4', fontWeight: '600', fontSize: '16px' }}>{result.pipInfo}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* How it works */}
            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px' }}>
                How Position Size is Calculated
              </h2>
              <div style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.8' }}>
                <p style={{ margin: '0 0 12px' }}>
                  The position size formula ensures you never risk more than your chosen percentage on any single trade:
                </p>
                <div style={{ background: '#060b11', borderRadius: '8px', padding: '14px 16px', marginBottom: '12px', fontFamily: 'monospace', color: '#60c8d4', fontSize: '13px' }}>
                  Risk Amount = Account Balance × (Risk % / 100)<br />
                  Lot Size = Risk Amount ÷ (Stop Loss Pips × Pip Value)
                </div>
                <p style={{ margin: '0 0 8px' }}><strong style={{ color: '#94a3b8' }}>Example:</strong> $10,000 account, 1% risk, 50 pip stop loss on EUR/USD:</p>
                <p style={{ margin: '0' }}>Risk Amount = $100 → Lot Size = $100 ÷ (50 × $10) = <strong style={{ color: '#1D9E75' }}>0.20 lots</strong></p>
              </div>
            </div>
          </div>

          {/* Right Sidebar — Related Tools */}
          <div style={{ position: 'sticky', top: '24px' }}>
            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Related Tools
              </h3>
              {[
                { slug: 'risk-reward', name: 'Risk/Reward Calculator', icon: '🎯' },
                { slug: 'pip-calculator', name: 'Pip Calculator', icon: '📐' },
                { slug: 'margin-calculator', name: 'Margin Calculator', icon: '🏦' },
                { slug: 'profit-loss', name: 'P&L Calculator', icon: '💰' },
              ].map(t => (
                <Link key={t.slug} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 0', borderBottom: '1px solid #1a2535',
                    cursor: 'pointer',
                  }}>
                    <span style={{ fontSize: '16px' }}>{t.icon}</span>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{t.name}</span>
                    <span style={{ color: '#60c8d4', marginLeft: 'auto', fontSize: '12px' }}>→</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Risk Rule */}
            <div style={{ background: '#0a1a12', border: '1px solid #1a3a2a', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>💡</div>
              <h4 style={{ color: '#1D9E75', fontSize: '14px', fontWeight: '600', margin: '0 0 8px' }}>The 1% Rule</h4>
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                Professional traders risk no more than 1-2% of their account per trade. This ensures a losing streak won't wipe out your account.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
