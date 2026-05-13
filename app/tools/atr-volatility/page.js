'use client'
// app/tools/atr-volatility/page.js

import { useState } from 'react'
import Link from 'next/link'

const PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'GBP/JPY', 'AUD/USD',
  'USD/CAD', 'EUR/GBP', 'AUD/JPY', 'CHF/JPY', 'GBP/AUD',
  'NZD/USD', 'XAU/USD', 'US500', 'NAS100', 'US30',
]

// Typical daily ATR values in pips (approximate, for reference)
const TYPICAL_ATR = {
  'EUR/USD': 80, 'GBP/USD': 110, 'USD/JPY': 70, 'GBP/JPY': 150,
  'AUD/USD': 70, 'USD/CAD': 80, 'EUR/GBP': 55, 'AUD/JPY': 90,
  'CHF/JPY': 100, 'GBP/AUD': 130, 'NZD/USD': 65, 'XAU/USD': 200,
  'US500': 50, 'NAS100': 200, 'US30': 300,
}

export default function ATRCalculator() {
  const [pair, setPair] = useState('EUR/USD')
  const [period, setPeriod] = useState('14')
  const [highs, setHighs] = useState(['', '', '', '', '', '', '', '', '', '', '', '', '', ''])
  const [lows, setLows] = useState(['', '', '', '', '', '', '', '', '', '', '', '', '', ''])
  const [closes, setCloses] = useState(['', '', '', '', '', '', '', '', '', '', '', '', '', ''])
  const [result, setResult] = useState(null)
  const [useManual, setUseManual] = useState(false)

  const isJPY = ['USD/JPY', 'GBP/JPY', 'AUD/JPY', 'CHF/JPY'].includes(pair)
  const isIndex = ['US500', 'NAS100', 'US30'].includes(pair)
  const isMetal = pair === 'XAU/USD'
  const pipDivisor = isJPY ? 0.01 : isIndex || isMetal ? 1 : 0.0001

  function calculateFromManual() {
    const n = parseInt(period)
    const trueRanges = []

    for (let i = 0; i < n; i++) {
      const h = parseFloat(highs[i])
      const l = parseFloat(lows[i])
      const prevC = i > 0 ? parseFloat(closes[i - 1]) : null

      if (!h || !l) continue

      const hl = h - l
      const hc = prevC ? Math.abs(h - prevC) : 0
      const lc = prevC ? Math.abs(l - prevC) : 0
      trueRanges.push(Math.max(hl, hc, lc))
    }

    if (trueRanges.length < 2) return

    const atr = trueRanges.reduce((a, b) => a + b, 0) / trueRanges.length
    const atrPips = atr / pipDivisor

    setResult({
      atr: atr.toFixed(5),
      atrPips: atrPips.toFixed(1),
      suggestedSL: (atrPips * 1.5).toFixed(1),
      suggestedTP: (atrPips * 3).toFixed(1),
      volatility: atrPips > TYPICAL_ATR[pair] * 1.2 ? 'High' : atrPips < TYPICAL_ATR[pair] * 0.8 ? 'Low' : 'Normal',
    })
  }

  function calculateFromTypical() {
    const atrPips = TYPICAL_ATR[pair]
    const atr = atrPips * pipDivisor
    setResult({
      atr: atr.toFixed(5),
      atrPips: atrPips.toFixed(1),
      suggestedSL: (atrPips * 1.5).toFixed(1),
      suggestedTP: (atrPips * 3).toFixed(1),
      volatility: 'Normal',
      isTypical: true,
    })
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px',
    background: '#060b11', border: '1px solid #1a2535',
    borderRadius: '6px', color: '#f1f5f9', fontSize: '13px',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = { color: '#94a3b8', fontSize: '13px', marginBottom: '6px', display: 'block' }

  const volatilityColor = result?.volatility === 'High' ? '#e05555' : result?.volatility === 'Low' ? '#60c8d4' : '#1D9E75'

  return (
    <div style={{ background: '#080d14', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ background: '#0d1520', borderBottom: '1px solid #1a2535', padding: '16px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            <Link href="/tools" style={{ color: '#60c8d4', textDecoration: 'none' }}>Tools</Link>
            {' › '} ATR Volatility Calculator
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 8px' }}>
              ATR Volatility Calculator
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px', lineHeight: '1.6' }}>
              Calculate Average True Range to measure volatility and set dynamic stop losses based on current market conditions.
            </p>

            {/* Mode Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              <button onClick={() => setUseManual(false)} style={{
                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                background: !useManual ? '#60c8d4' : 'transparent',
                color: !useManual ? '#080d14' : '#64748b',
                border: useManual ? '1px solid #1a2535' : 'none',
                fontWeight: !useManual ? '600' : '400', fontSize: '13px',
              }}>
                Use Typical ATR
              </button>
              <button onClick={() => setUseManual(true)} style={{
                padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
                background: useManual ? '#60c8d4' : 'transparent',
                color: useManual ? '#080d14' : '#64748b',
                border: !useManual ? '1px solid #1a2535' : 'none',
                fontWeight: useManual ? '600' : '400', fontSize: '13px',
              }}>
                Enter Price Data
              </button>
            </div>

            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Currency Pair</label>
                  <select value={pair} onChange={e => setPair(e.target.value)} style={{ ...inputStyle, fontSize: '15px', padding: '12px 14px' }}>
                    {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                {useManual && (
                  <div>
                    <label style={labelStyle}>ATR Period</label>
                    <select value={period} onChange={e => {
                      setHighs(Array(parseInt(e.target.value)).fill(''))
                      setLows(Array(parseInt(e.target.value)).fill(''))
                      setCloses(Array(parseInt(e.target.value)).fill(''))
                      setPeriod(e.target.value)
                    }} style={{ ...inputStyle, fontSize: '15px', padding: '12px 14px' }}>
                      {['7', '10', '14', '20'].map(p => <option key={p} value={p}>Period {p}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {useManual && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '12px' }}>
                    Enter High, Low, Close for each of the last {period} candles (oldest first):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                    <div />
                    <div style={{ color: '#64748b', fontSize: '11px', textAlign: 'center' }}>High</div>
                    <div style={{ color: '#64748b', fontSize: '11px', textAlign: 'center' }}>Low</div>
                    <div style={{ color: '#64748b', fontSize: '11px', textAlign: 'center' }}>Close</div>
                  </div>
                  <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
                    {highs.map((_, i) => (
                      <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 1fr 1fr', gap: '6px', marginBottom: '6px' }}>
                        <div style={{ color: '#64748b', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</div>
                        <input type="number" value={highs[i]} placeholder="High"
                          onChange={e => { const n = [...highs]; n[i] = e.target.value; setHighs(n) }}
                          style={inputStyle} step="0.00001" />
                        <input type="number" value={lows[i]} placeholder="Low"
                          onChange={e => { const n = [...lows]; n[i] = e.target.value; setLows(n) }}
                          style={inputStyle} step="0.00001" />
                        <input type="number" value={closes[i]} placeholder="Close"
                          onChange={e => { const n = [...closes]; n[i] = e.target.value; setCloses(n) }}
                          style={inputStyle} step="0.00001" />
                      </div>
                    ))}
                  </div>
                  <button onClick={calculateFromManual} style={{
                    marginTop: '16px', padding: '12px 24px',
                    background: '#60c8d4', color: '#080d14',
                    border: 'none', borderRadius: '8px',
                    fontWeight: '600', fontSize: '14px', cursor: 'pointer', width: '100%',
                  }}>
                    Calculate ATR
                  </button>
                </div>
              )}

              {!useManual && (
                <button onClick={calculateFromTypical} style={{
                  padding: '12px 24px', background: '#60c8d4', color: '#080d14',
                  border: 'none', borderRadius: '8px',
                  fontWeight: '600', fontSize: '14px', cursor: 'pointer', width: '100%', marginBottom: '20px',
                }}>
                  Calculate Typical ATR for {pair}
                </button>
              )}

              {result && (
                <div style={{ background: '#060b11', border: '1px solid #1a2535', borderRadius: '10px', padding: '20px' }}>
                  {result.isTypical && (
                    <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px', fontStyle: 'italic' }}>
                      Using typical 14-period daily ATR for {pair}
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: '#0a1020', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>ATR Value</div>
                      <div style={{ color: '#60c8d4', fontWeight: '700', fontSize: '24px' }}>{result.atrPips}</div>
                      <div style={{ color: '#64748b', fontSize: '12px' }}>pips</div>
                    </div>
                    <div style={{ background: '#0a1020', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Volatility</div>
                      <div style={{ color: volatilityColor, fontWeight: '700', fontSize: '24px' }}>{result.volatility}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: '#0a1020', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Suggested SL (1.5× ATR)</div>
                      <div style={{ color: '#e05555', fontWeight: '600', fontSize: '16px' }}>{result.suggestedSL} pips</div>
                    </div>
                    <div style={{ background: '#0a1020', borderRadius: '8px', padding: '12px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Suggested TP (3× ATR)</div>
                      <div style={{ color: '#1D9E75', fontWeight: '600', fontSize: '16px' }}>{result.suggestedTP} pips</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px' }}>What is ATR?</h2>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.8', margin: '0 0 12px' }}>
                Average True Range (ATR) measures market volatility by averaging the True Range over a set period. It helps traders set stop losses that respect current market conditions — not arbitrary pip amounts.
              </p>
              <div style={{ background: '#060b11', borderRadius: '8px', padding: '14px 16px', fontFamily: 'monospace', color: '#60c8d4', fontSize: '13px', marginBottom: '12px' }}>
                True Range = Max(High-Low, |High-PrevClose|, |Low-PrevClose|)<br />
                ATR = Average of True Range over N periods
              </div>
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                <strong style={{ color: '#94a3b8' }}>Pro tip:</strong> Set your stop loss at 1.5–2× ATR below entry (for longs) to avoid being stopped out by normal volatility.
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: '24px' }}>
            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                Typical Daily ATR
              </h3>
              {Object.entries(TYPICAL_ATR).slice(0, 8).map(([p, atr]) => (
                <div key={p} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #1a2535' }}>
                  <span style={{ color: '#94a3b8', fontSize: '13px' }}>{p}</span>
                  <span style={{ color: '#60c8d4', fontSize: '13px', fontWeight: '500' }}>~{atr} pips</span>
                </div>
              ))}
            </div>
            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Related Tools</h3>
              {[
                { slug: 'position-size', name: 'Position Size Calculator', icon: '⚖️' },
                { slug: 'risk-reward', name: 'Risk/Reward Calculator', icon: '🎯' },
                { slug: 'pip-calculator', name: 'Pip Calculator', icon: '📐' },
              ].map(t => (
                <Link key={t.slug} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #1a2535' }}>
                    <span>{t.icon}</span>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{t.name}</span>
                    <span style={{ color: '#60c8d4', marginLeft: 'auto', fontSize: '12px' }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
