'use client'
// app/tools/profit-loss/page.js

import { useState, useEffect } from 'react'
import Link from 'next/link'

const PAIRS = [
  'EUR/USD', 'GBP/USD', 'USD/JPY', 'GBP/JPY', 'AUD/USD',
  'USD/CAD', 'EUR/GBP', 'AUD/JPY', 'CHF/JPY', 'GBP/AUD',
  'NZD/USD', 'XAU/USD', 'US500', 'NAS100', 'US30',
]

export default function ProfitLossCalculator() {
  const [pair, setPair] = useState('EUR/USD')
  const [direction, setDirection] = useState('LONG')
  const [entryPrice, setEntryPrice] = useState('1.35000')
  const [exitPrice, setExitPrice] = useState('1.36000')
  const [lotSize, setLotSize] = useState('0.1')
  const [result, setResult] = useState(null)

  useEffect(() => { calculate() }, [pair, direction, entryPrice, exitPrice, lotSize])

  function calculate() {
    const entry = parseFloat(entryPrice)
    const exit = parseFloat(exitPrice)
    const lots = parseFloat(lotSize)
    if (!entry || !exit || !lots) { setResult(null); return }

    const isJPY = ['USD/JPY', 'GBP/JPY', 'AUD/JPY', 'CHF/JPY'].includes(pair)
    const isIndex = ['US500', 'NAS100', 'US30'].includes(pair)
    const isMetal = pair === 'XAU/USD'

    let priceDiff = direction === 'LONG' ? exit - entry : entry - exit
    let pnl

    if (isIndex) {
      pnl = priceDiff * lots
    } else if (isMetal) {
      pnl = priceDiff * lots * 100
    } else if (isJPY) {
      const pips = priceDiff / 0.01
      pnl = pips * lots * 1000 / exit
    } else {
      const pips = priceDiff / 0.0001
      pnl = pips * lots * 10
    }

    const pips = isJPY ? priceDiff / 0.01 : isIndex ? priceDiff : priceDiff / 0.0001
    const isProfit = pnl > 0

    setResult({
      pnl: pnl.toFixed(2),
      pips: Math.abs(pips).toFixed(1),
      isProfit,
      priceDiff: Math.abs(priceDiff).toFixed(isJPY ? 3 : 5),
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
            {' › '} P&L Calculator
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 8px' }}>P&L Calculator</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px', lineHeight: '1.6' }}>
              Calculate your exact profit or loss on any closed or hypothetical trade.
            </p>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
              {['LONG', 'SHORT'].map(d => (
                <button key={d} onClick={() => setDirection(d)} style={{
                  padding: '10px 28px', borderRadius: '8px', border: direction === d ? 'none' : '1px solid #1a2535',
                  background: direction === d ? (d === 'LONG' ? '#1D9E75' : '#e05555') : '#0d1520',
                  color: direction === d ? '#fff' : '#64748b',
                  fontWeight: '600', fontSize: '14px', cursor: 'pointer',
                }}>
                  {d === 'LONG' ? '▲ Long' : '▼ Short'}
                </button>
              ))}
            </div>

            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Currency Pair</label>
                  <select value={pair} onChange={e => setPair(e.target.value)} style={inputStyle}>
                    {PAIRS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Lot Size</label>
                  <input type="number" value={lotSize} onChange={e => setLotSize(e.target.value)} style={inputStyle} step="0.01" />
                </div>
                <div>
                  <label style={labelStyle}>Entry Price</label>
                  <input type="number" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} style={inputStyle} step="0.00001" />
                </div>
                <div>
                  <label style={labelStyle}>Exit Price</label>
                  <input type="number" value={exitPrice} onChange={e => setExitPrice(e.target.value)} style={inputStyle} step="0.00001" />
                </div>
              </div>

              {result && (
                <div style={{
                  background: result.isProfit ? '#0a1a12' : '#1a0a0a',
                  border: `1px solid ${result.isProfit ? '#1a3a2a' : '#3a1a1a'}`,
                  borderRadius: '10px', padding: '24px', textAlign: 'center',
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    {result.isProfit ? 'Profit' : 'Loss'}
                  </div>
                  <div style={{ fontSize: '56px', fontWeight: '700', color: result.isProfit ? '#1D9E75' : '#e05555', lineHeight: '1' }}>
                    {result.isProfit ? '+' : '-'}${Math.abs(parseFloat(result.pnl)).toFixed(2)}
                  </div>
                  <div style={{ color: '#64748b', fontSize: '14px', marginTop: '8px' }}>
                    {result.pips} pips · {result.priceDiff} price move
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px' }}>How P&L is Calculated</h2>
              <div style={{ background: '#060b11', borderRadius: '8px', padding: '14px 16px', fontFamily: 'monospace', color: '#60c8d4', fontSize: '13px' }}>
                Long P&L = (Exit - Entry) × Lot Size × Contract Size<br />
                Short P&L = (Entry - Exit) × Lot Size × Contract Size
              </div>
            </div>
          </div>

          <div style={{ position: 'sticky', top: '24px' }}>
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
