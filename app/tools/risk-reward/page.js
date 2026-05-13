'use client'
// app/tools/risk-reward/page.js

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function RiskRewardCalculator() {
  const [entryPrice, setEntryPrice] = useState('1.35000')
  const [stopLoss, setStopLoss] = useState('1.34500')
  const [takeProfit, setTakeProfit] = useState('1.36000')
  const [lotSize, setLotSize] = useState('0.1')
  const [direction, setDirection] = useState('LONG')
  const [result, setResult] = useState(null)

  useEffect(() => { calculate() }, [entryPrice, stopLoss, takeProfit, lotSize, direction])

  function calculate() {
    const entry = parseFloat(entryPrice)
    const sl = parseFloat(stopLoss)
    const tp = parseFloat(takeProfit)
    const lots = parseFloat(lotSize)
    if (!entry || !sl || !tp || !lots) { setResult(null); return }

    const riskPips = Math.abs(entry - sl) / 0.0001
    const rewardPips = Math.abs(tp - entry) / 0.0001
    const rrRatio = rewardPips / riskPips
    const pipValue = lots * 10
    const riskAmount = riskPips * pipValue
    const rewardAmount = rewardPips * pipValue
    const winRateNeeded = (1 / (1 + rrRatio)) * 100

    setResult({
      riskPips: riskPips.toFixed(1),
      rewardPips: rewardPips.toFixed(1),
      rrRatio: rrRatio.toFixed(2),
      riskAmount: riskAmount.toFixed(2),
      rewardAmount: rewardAmount.toFixed(2),
      winRateNeeded: winRateNeeded.toFixed(1),
      isGood: rrRatio >= 1.5,
    })
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: '#060b11', border: '1px solid #1a2535',
    borderRadius: '8px', color: '#f1f5f9', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = { color: '#94a3b8', fontSize: '13px', marginBottom: '6px', display: 'block' }

  return (
    <div style={{ background: '#080d14', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ background: '#0d1520', borderBottom: '1px solid #1a2535', padding: '16px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            <Link href="/tools" style={{ color: '#60c8d4', textDecoration: 'none' }}>Tools</Link>
            {' › '} Risk/Reward Calculator
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 8px' }}>Risk/Reward Calculator</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px', lineHeight: '1.6' }}>
              Calculate your risk-reward ratio and potential profit or loss before entering any trade.
            </p>

            {/* Direction Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {['LONG', 'SHORT'].map(d => (
                <button key={d} onClick={() => setDirection(d)} style={{
                  padding: '10px 28px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                  background: direction === d ? (d === 'LONG' ? '#1D9E75' : '#e05555') : '#0d1520',
                  color: direction === d ? '#fff' : '#64748b',
                  fontWeight: '600', fontSize: '14px',
                  border: direction === d ? 'none' : '1px solid #1a2535',
                }}>
                  {d === 'LONG' ? '▲ Long' : '▼ Short'}
                </button>
              ))}
            </div>

            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Entry Price</label>
                  <input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} style={inputStyle} step="0.00001" />
                </div>
                <div>
                  <label style={labelStyle}>Lot Size</label>
                  <input type="number" value={lotSize} onChange={e => setLotSize(e.target.value)} style={inputStyle} step="0.01" />
                </div>
                <div>
                  <label style={{ ...labelStyle, color: '#e05555' }}>Stop Loss Price</label>
                  <input type="number" value={stopLoss} onChange={e => setStopLoss(e.target.value)}
                    style={{ ...inputStyle, borderColor: '#3a1a1a' }} step="0.00001" />
                </div>
                <div>
                  <label style={{ ...labelStyle, color: '#1D9E75' }}>Take Profit Price</label>
                  <input type="number" value={takeProfit} onChange={e => setTakeProfit(e.target.value)}
                    style={{ ...inputStyle, borderColor: '#1a3a2a' }} step="0.00001" />
                </div>
              </div>

              {result && (
                <div>
                  {/* RR Ratio Banner */}
                  <div style={{
                    background: result.isGood ? '#0a1a12' : '#1a0a0a',
                    border: `1px solid ${result.isGood ? '#1a3a2a' : '#3a1a1a'}`,
                    borderRadius: '10px', padding: '20px', marginBottom: '16px', textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                      Risk/Reward Ratio
                    </div>
                    <div style={{ fontSize: '52px', fontWeight: '700', color: result.isGood ? '#1D9E75' : '#e05555', lineHeight: '1' }}>
                      1:{result.rrRatio}
                    </div>
                    <div style={{ color: result.isGood ? '#1D9E75' : '#e05555', fontSize: '13px', marginTop: '8px' }}>
                      {result.isGood ? '✓ Good setup — reward exceeds risk' : '⚠ Poor setup — risk exceeds reward'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    {[
                      { label: 'Risk (Pips)', value: result.riskPips, color: '#e05555' },
                      { label: 'Reward (Pips)', value: result.rewardPips, color: '#1D9E75' },
                      { label: 'Win Rate Needed', value: `${result.winRateNeeded}%`, color: '#60c8d4' },
                      { label: 'Risk Amount', value: `$${result.riskAmount}`, color: '#e05555' },
                      { label: 'Reward Amount', value: `$${result.rewardAmount}`, color: '#1D9E75' },
                      { label: 'Net if Won', value: `+$${result.rewardAmount}`, color: '#1D9E75' },
                    ].map(item => (
                      <div key={item.label} style={{ background: '#060b11', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{item.label}</div>
                        <div style={{ color: item.color, fontWeight: '600', fontSize: '15px' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px' }}>Why R:R Ratio Matters</h2>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.8', margin: '0 0 12px' }}>
                A minimum 1:2 risk-reward means you only need to win 33% of trades to be profitable. At 1:3 you only need 25% win rate.
              </p>
              <div style={{ background: '#060b11', borderRadius: '8px', padding: '14px 16px', fontFamily: 'monospace', color: '#60c8d4', fontSize: '13px' }}>
                RR Ratio = (Take Profit - Entry) ÷ (Entry - Stop Loss)<br />
                Win Rate Needed = 1 ÷ (1 + RR Ratio) × 100
              </div>
            </div>
          </div>

          <div style={{ position: 'sticky', top: '24px' }}>
            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Related Tools</h3>
              {[
                { slug: 'position-size', name: 'Position Size Calculator', icon: '⚖️' },
                { slug: 'pip-calculator', name: 'Pip Calculator', icon: '📐' },
                { slug: 'profit-loss', name: 'P&L Calculator', icon: '💰' },
              ].map(t => (
                <Link key={t.slug} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #1a2535' }}>
                    <span style={{ fontSize: '16px' }}>{t.icon}</span>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{t.name}</span>
                    <span style={{ color: '#60c8d4', marginLeft: 'auto', fontSize: '12px' }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ background: '#0a1020', border: '1px solid #1a2535', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>🎯</div>
              <h4 style={{ color: '#60c8d4', fontSize: '14px', fontWeight: '600', margin: '0 0 8px' }}>RR Benchmarks</h4>
              <div style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.9' }}>
                <div style={{ color: '#e05555' }}>1:1 → Need 50% win rate</div>
                <div style={{ color: '#f59e0b' }}>1:2 → Need 33% win rate</div>
                <div style={{ color: '#1D9E75' }}>1:3 → Need 25% win rate</div>
                <div style={{ color: '#1D9E75' }}>1:5 → Need 17% win rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
