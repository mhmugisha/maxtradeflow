'use client'
// app/tools/pip-calculator/page.js

import { useState, useEffect } from 'react'
import Link from 'next/link'

const PAIRS = [
  { label: 'EUR/USD', pipSize: 0.0001, isJPY: false },
  { label: 'GBP/USD', pipSize: 0.0001, isJPY: false },
  { label: 'USD/JPY', pipSize: 0.01, isJPY: true },
  { label: 'GBP/JPY', pipSize: 0.01, isJPY: true },
  { label: 'AUD/USD', pipSize: 0.0001, isJPY: false },
  { label: 'USD/CAD', pipSize: 0.0001, isJPY: false },
  { label: 'EUR/GBP', pipSize: 0.0001, isJPY: false },
  { label: 'AUD/JPY', pipSize: 0.01, isJPY: true },
  { label: 'CHF/JPY', pipSize: 0.01, isJPY: true },
  { label: 'GBP/AUD', pipSize: 0.0001, isJPY: false },
  { label: 'NZD/USD', pipSize: 0.0001, isJPY: false },
  { label: 'XAU/USD', pipSize: 0.01, isJPY: false, isMetal: true },
]

const LOT_SIZES = [
  { label: 'Standard (1.0)', value: 100000 },
  { label: 'Mini (0.1)', value: 10000 },
  { label: 'Micro (0.01)', value: 1000 },
  { label: 'Nano (0.001)', value: 100 },
]

export default function PipCalculator() {
  const [pair, setPair] = useState('EUR/USD')
  const [lotType, setLotType] = useState('100000')
  const [customLot, setCustomLot] = useState('')
  const [accountCurrency, setAccountCurrency] = useState('USD')
  const [exchangeRate, setExchangeRate] = useState('1')
  const [result, setResult] = useState(null)

  useEffect(() => { calculate() }, [pair, lotType, customLot, accountCurrency, exchangeRate])

  function calculate() {
    const pairInfo = PAIRS.find(p => p.label === pair)
    if (!pairInfo) return

    const units = customLot ? parseFloat(customLot) * 100000 : parseFloat(lotType)
    const rate = parseFloat(exchangeRate) || 1
    if (!units) { setResult(null); return }

    let pipValueUSD
    if (pairInfo.isMetal) {
      pipValueUSD = units * pairInfo.pipSize
    } else if (pairInfo.isJPY) {
      pipValueUSD = (pairInfo.pipSize / rate) * units
    } else if (pair.endsWith('/USD')) {
      pipValueUSD = pairInfo.pipSize * units
    } else if (pair.startsWith('USD/')) {
      pipValueUSD = (pairInfo.pipSize / rate) * units
    } else {
      pipValueUSD = pairInfo.pipSize * units * rate
    }

    const lotSize = customLot ? parseFloat(customLot) : units / 100000

    setResult({
      pipValue: pipValueUSD.toFixed(2),
      pipValuePer10: (pipValueUSD * 10).toFixed(2),
      pipValuePer100: (pipValueUSD * 100).toFixed(2),
      lotSize: lotSize.toFixed(2),
      pipSize: pairInfo.pipSize,
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
            {' › '} Pip Calculator
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 8px' }}>Pip Calculator</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px', lineHeight: '1.6' }}>
              Calculate the exact pip value for any currency pair and lot size to manage your risk precisely.
            </p>

            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Currency Pair</label>
                  <select value={pair} onChange={e => setPair(e.target.value)} style={inputStyle}>
                    {PAIRS.map(p => <option key={p.label} value={p.label}>{p.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Lot Size</label>
                  <select value={lotType} onChange={e => setLotType(e.target.value)} style={inputStyle}>
                    {LOT_SIZES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Custom Lots (optional)</label>
                  <input
                    type="number" value={customLot} placeholder="e.g. 0.5"
                    onChange={e => setCustomLot(e.target.value)} style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Quote/Account Rate</label>
                  <input
                    type="number" value={exchangeRate} placeholder="1.0"
                    onChange={e => setExchangeRate(e.target.value)} style={inputStyle}
                  />
                </div>
              </div>

              {result && (
                <div style={{ background: '#060b11', border: '1px solid #1a3a2a', borderRadius: '10px', padding: '20px' }}>
                  <div style={{ fontSize: '12px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                    Pip Value for {result.lotSize} lots on {pair}
                  </div>
                  <div style={{ fontSize: '42px', fontWeight: '700', color: '#60c8d4', lineHeight: '1', marginBottom: '4px' }}>
                    ${result.pipValue}
                    <span style={{ fontSize: '18px', color: '#64748b', marginLeft: '8px' }}>per pip</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '16px' }}>
                    {[
                      { label: '10 pips', value: `$${result.pipValuePer10}` },
                      { label: '100 pips', value: `$${result.pipValuePer100}` },
                      { label: 'Pip size', value: result.pipSize },
                    ].map(item => (
                      <div key={item.label} style={{ background: '#0a1628', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                        <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>{item.label}</div>
                        <div style={{ color: '#f1f5f9', fontWeight: '600', fontSize: '15px' }}>{item.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px' }}>What is a Pip?</h2>
              <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.8', margin: '0 0 12px' }}>
                A pip (Percentage in Point) is the smallest price move in a currency pair. For most pairs it's the 4th decimal place (0.0001). For JPY pairs it's the 2nd decimal place (0.01).
              </p>
              <div style={{ background: '#060b11', borderRadius: '8px', padding: '14px 16px', fontFamily: 'monospace', color: '#60c8d4', fontSize: '13px' }}>
                Pip Value = Pip Size × Lot Size × Exchange Rate
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ position: 'sticky', top: '24px' }}>
            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Related Tools</h3>
              {[
                { slug: 'position-size', name: 'Position Size Calculator', icon: '⚖️' },
                { slug: 'risk-reward', name: 'Risk/Reward Calculator', icon: '🎯' },
                { slug: 'margin-calculator', name: 'Margin Calculator', icon: '🏦' },
              ].map(t => (
                <Link key={t.slug} href={`/tools/${t.slug}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid #1a2535', cursor: 'pointer' }}>
                    <span style={{ fontSize: '16px' }}>{t.icon}</span>
                    <span style={{ color: '#94a3b8', fontSize: '13px' }}>{t.name}</span>
                    <span style={{ color: '#60c8d4', marginLeft: 'auto', fontSize: '12px' }}>→</span>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ background: '#0a1020', border: '1px solid #1a2535', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>📌</div>
              <h4 style={{ color: '#60c8d4', fontSize: '14px', fontWeight: '600', margin: '0 0 8px' }}>Pip Value by Lot</h4>
              <div style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.8' }}>
                <div>Standard (1.0) = $10/pip</div>
                <div>Mini (0.1) = $1/pip</div>
                <div>Micro (0.01) = $0.10/pip</div>
                <div style={{ color: '#94a3b8', marginTop: '4px', fontSize: '11px' }}>*For EUR/USD, USD as account currency</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
