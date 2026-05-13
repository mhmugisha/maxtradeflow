'use client'
// app/tools/margin-calculator/page.js

import { useState, useEffect } from 'react'
import Link from 'next/link'

const PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'GBP/JPY', 'AUD/USD',
  'USD/CAD', 'EUR/GBP', 'AUD/JPY', 'CHF/JPY', 'GBP/AUD',
  'NZD/USD', 'XAU/USD', 'US500', 'NAS100', 'US30',
]

const LEVERAGES = ['1:10', '1:20', '1:30', '1:50', '1:100', '1:200', '1:500']

export default function MarginCalculator() {
  const [pair, setPair] = useState('EUR/USD')
  const [lotSize, setLotSize] = useState('1')
  const [leverage, setLeverage] = useState('1:100')
  const [price, setPrice] = useState('1.35000')
  const [accountBalance, setAccountBalance] = useState('10000')
  const [result, setResult] = useState(null)

  useEffect(() => { calculate() }, [pair, lotSize, leverage, price, accountBalance])

  function calculate() {
    const lots = parseFloat(lotSize)
    const p = parseFloat(price)
    const balance = parseFloat(accountBalance)
    const lev = parseFloat(leverage.split(':')[1])
    if (!lots || !p || !lev) { setResult(null); return }

    let contractSize = 100000
    if (['US500', 'NAS100', 'US30'].includes(pair)) contractSize = 1
    if (pair === 'XAU/USD') contractSize = 100

    const notionalValue = lots * contractSize * p
    const requiredMargin = notionalValue / lev
    const freeMargin = balance ? balance - requiredMargin : null
    const marginLevel = balance ? (balance / requiredMargin) * 100 : null

    setResult({
      notionalValue: notionalValue.toFixed(2),
      requiredMargin: requiredMargin.toFixed(2),
      freeMargin: freeMargin ? freeMargin.toFixed(2) : null,
      marginLevel: marginLevel ? marginLevel.toFixed(0) : null,
      marginPercent: ((requiredMargin / (balance || requiredMargin)) * 100).toFixed(1),
      isSafe: marginLevel ? marginLevel > 200 : true,
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
            {' › '} Margin Calculator
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 8px' }}>Margin Calculator</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px', lineHeight: '1.6' }}>
              Calculate required margin, free margin and margin level for any position size and leverage.
            </p>

            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Currency Pair</label>
                  <select value={pair} onChange={e => setPair(e.target.value)} style={inputStyle}>
                    {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Leverage</label>
                  <select value={leverage} onChange={e => setLeverage(e.target.value)} style={inputStyle}>
                    {LEVERAGES.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Lot Size</label>
                  <input type="number" value={lotSize} onChange={e => setLotSize(e.target.value)} style={inputStyle} step="0.01" />
                </div>
                <div>
                  <label style={labelStyle}>Current Price</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} style={inputStyle} step="0.00001" />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Account Balance (USD) — for margin level</label>
                  <input type="number" value={accountBalance} onChange={e => setAccountBalance(e.target.value)} style={inputStyle} />
                </div>
              </div>

              {result && (
                <div style={{ background: '#060b11', border: '1px solid #1a2535', borderRadius: '10px', padding: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ background: '#0a1020', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Required Margin</div>
                      <div style={{ color: '#60c8d4', fontWeight: '700', fontSize: '24px' }}>${result.requiredMargin}</div>
                    </div>
                    <div style={{ background: '#0a1020', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Notional Value</div>
                      <div style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '24px' }}>${parseFloat(result.notionalValue).toLocaleString()}</div>
                    </div>
                  </div>
                  {result.freeMargin && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                      <div style={{ background: '#0a1020', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Free Margin</div>
                        <div style={{ color: parseFloat(result.freeMargin) > 0 ? '#1D9E75' : '#e05555', fontWeight: '600', fontSize: '15px' }}>${result.freeMargin}</div>
                      </div>
                      <div style={{ background: '#0a1020', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Margin Level</div>
                        <div style={{ color: result.isSafe ? '#1D9E75' : '#e05555', fontWeight: '600', fontSize: '15px' }}>{result.marginLevel}%</div>
                      </div>
                      <div style={{ background: '#0a1020', borderRadius: '8px', padding: '12px' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Margin Used</div>
                        <div style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '15px' }}>{result.marginPercent}%</div>
                      </div>
                    </div>
                  )}
                  {result.marginLevel && !result.isSafe && (
                    <div style={{ background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: '8px', padding: '12px', marginTop: '12px', color: '#e05555', fontSize: '13px' }}>
                      ⚠️ Margin level below 200% — consider reducing position size or adding funds.
                    </div>
                  )}
                </div>
              )}
            </div>

            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px' }}>Understanding Margin</h2>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.8', margin: '0 0 12px' }}>
                Margin is the collateral required to open a leveraged position. It's not a fee — it's a deposit held while the trade is open.
              </p>
              <div style={{ background: '#060b11', borderRadius: '8px', padding: '14px 16px', fontFamily: 'monospace', color: '#60c8d4', fontSize: '13px' }}>
                Required Margin = (Lot Size × Contract Size × Price) ÷ Leverage<br />
                Margin Level = (Equity ÷ Used Margin) × 100
              </div>
            </div>
          </div>

          <div style={{ position: 'sticky', top: '24px' }}>
            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Related Tools</h3>
              {[
                { slug: 'position-size', name: 'Position Size Calculator', icon: '⚖️' },
                { slug: 'risk-reward', name: 'Risk/Reward Calculator', icon: '🎯' },
                { slug: 'profit-loss', name: 'P&L Calculator', icon: '💰' },
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
            <div style={{ background: '#0a1020', border: '1px solid #1a2535', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>🏦</div>
              <h4 style={{ color: '#60c8d4', fontSize: '14px', fontWeight: '600', margin: '0 0 8px' }}>Margin Call Levels</h4>
              <div style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.9' }}>
                <div style={{ color: '#1D9E75' }}>{'>'} 200% — Safe zone</div>
                <div style={{ color: '#f59e0b' }}>100–200% — Caution</div>
                <div style={{ color: '#e05555' }}>50–100% — Margin call risk</div>
                <div style={{ color: '#e05555' }}>{'<'} 50% — Stop out risk</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
