'use client'
// app/tools/compound-interest/page.js

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CompoundInterestCalculator() {
  const [startBalance, setStartBalance] = useState('10000')
  const [monthlyReturn, setMonthlyReturn] = useState('5')
  const [months, setMonths] = useState('12')
  const [monthlyDeposit, setMonthlyDeposit] = useState('0')
  const [result, setResult] = useState(null)

  useEffect(() => { calculate() }, [startBalance, monthlyReturn, months, monthlyDeposit])

  function calculate() {
    const balance = parseFloat(startBalance)
    const rate = parseFloat(monthlyReturn) / 100
    const m = parseInt(months)
    const deposit = parseFloat(monthlyDeposit) || 0
    if (!balance || !rate || !m) { setResult(null); return }

    const data = []
    let current = balance
    for (let i = 1; i <= m; i++) {
      current = current * (1 + rate) + deposit
      data.push({ month: i, balance: parseFloat(current.toFixed(2)) })
    }

    const finalBalance = data[data.length - 1].balance
    const totalDeposited = balance + deposit * m
    const totalProfit = finalBalance - totalDeposited

    setResult({
      finalBalance: finalBalance.toFixed(2),
      totalProfit: totalProfit.toFixed(2),
      totalDeposited: totalDeposited.toFixed(2),
      returnMultiple: (finalBalance / balance).toFixed(2),
      data,
    })
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: '#060b11', border: '1px solid #1a2535',
    borderRadius: '8px', color: '#f1f5f9', fontSize: '15px',
    outline: 'none', boxSizing: 'border-box',
  }
  const labelStyle = { color: '#94a3b8', fontSize: '13px', marginBottom: '6px', display: 'block' }

  const maxBalance = result ? Math.max(...result.data.map(d => d.balance)) : 0

  return (
    <div style={{ background: '#080d14', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ background: '#0d1520', borderBottom: '1px solid #1a2535', padding: '16px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            <Link href="/tools" style={{ color: '#60c8d4', textDecoration: 'none' }}>Tools</Link>
            {' › '} Compound Interest Calculator
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '32px', alignItems: 'start' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 8px' }}>Compound Interest Calculator</h1>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px', lineHeight: '1.6' }}>
              See how your trading account grows with consistent monthly returns compounded over time.
            </p>

            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px', marginBottom: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                <div>
                  <label style={labelStyle}>Starting Balance ($)</label>
                  <input type="number" value={startBalance} onChange={e => setStartBalance(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Monthly Return (%)</label>
                  <input type="number" value={monthlyReturn} onChange={e => setMonthlyReturn(e.target.value)} style={inputStyle} step="0.1" />
                </div>
                <div>
                  <label style={labelStyle}>Number of Months</label>
                  <input type="number" value={months} onChange={e => setMonths(e.target.value)} style={inputStyle} min="1" max="120" />
                </div>
                <div>
                  <label style={labelStyle}>Monthly Deposit ($)</label>
                  <input type="number" value={monthlyDeposit} onChange={e => setMonthlyDeposit(e.target.value)} style={inputStyle} />
                </div>
              </div>

              {result && (
                <div>
                  {/* Summary Cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                    <div style={{ background: '#0a1628', border: '1px solid #1a3a2a', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Final Balance</div>
                      <div style={{ color: '#1D9E75', fontWeight: '700', fontSize: '20px' }}>${parseFloat(result.finalBalance).toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#0a1020', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Total Profit</div>
                      <div style={{ color: '#60c8d4', fontWeight: '700', fontSize: '20px' }}>${parseFloat(result.totalProfit).toLocaleString()}</div>
                    </div>
                    <div style={{ background: '#0a1020', borderRadius: '8px', padding: '16px' }}>
                      <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Return Multiple</div>
                      <div style={{ color: '#f1f5f9', fontWeight: '700', fontSize: '20px' }}>{result.returnMultiple}x</div>
                    </div>
                  </div>

                  {/* Growth Chart */}
                  <div style={{ background: '#060b11', borderRadius: '10px', padding: '16px' }}>
                    <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Monthly Growth
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '80px' }}>
                      {result.data.map((d, i) => (
                        <div key={i} style={{
                          flex: 1,
                          height: `${(d.balance / maxBalance) * 100}%`,
                          background: `rgba(29, 158, 117, ${0.4 + (i / result.data.length) * 0.6})`,
                          borderRadius: '2px 2px 0 0',
                          minWidth: '2px',
                        }} title={`Month ${d.month}: $${d.balance.toLocaleString()}`} />
                      ))}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', color: '#64748b', fontSize: '11px' }}>
                      <span>Month 1</span>
                      <span>Month {months}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Monthly breakdown table */}
            {result && (
              <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px' }}>Monthly Breakdown</h2>
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #1a2535' }}>
                        {['Month', 'Balance', 'Profit This Month', 'Total Profit'].map(h => (
                          <th key={h} style={{ padding: '8px 12px', color: '#64748b', textAlign: 'left', fontWeight: '500' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {result.data.map((d, i) => {
                        const prev = i === 0 ? parseFloat(startBalance) : result.data[i - 1].balance
                        const monthProfit = d.balance - prev - (parseFloat(monthlyDeposit) || 0)
                        const totalProfit = d.balance - parseFloat(startBalance) - (parseFloat(monthlyDeposit) || 0) * (i + 1)
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid #0d1520' }}>
                            <td style={{ padding: '8px 12px', color: '#64748b' }}>{i + 1}</td>
                            <td style={{ padding: '8px 12px', color: '#f1f5f9', fontWeight: '500' }}>${d.balance.toLocaleString()}</td>
                            <td style={{ padding: '8px 12px', color: '#1D9E75' }}>+${monthProfit.toFixed(2)}</td>
                            <td style={{ padding: '8px 12px', color: '#60c8d4' }}>+${totalProfit.toFixed(2)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div style={{ position: 'sticky', top: '24px' }}>
            <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '20px', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px', textTransform: 'uppercase', letterSpacing: '1px' }}>Related Tools</h3>
              {[
                { slug: 'position-size', name: 'Position Size Calculator', icon: '⚖️' },
                { slug: 'profit-loss', name: 'P&L Calculator', icon: '💰' },
                { slug: 'risk-reward', name: 'Risk/Reward Calculator', icon: '🎯' },
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
            <div style={{ background: '#0a1628', border: '1px solid #1a3a2a', borderRadius: '12px', padding: '20px' }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>📈</div>
              <h4 style={{ color: '#1D9E75', fontSize: '14px', fontWeight: '600', margin: '0 0 8px' }}>The Power of Compounding</h4>
              <p style={{ color: '#64748b', fontSize: '13px', lineHeight: '1.6', margin: 0 }}>
                A $10,000 account growing at 5% per month becomes $34,000 in 12 months and $114,000 in 24 months — purely from compounding.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
