'use client'
// app/tools/session-converter/page.js

import { useState, useEffect } from 'react'
import Link from 'next/link'

const SESSIONS = [
  {
    name: 'Sydney',
    open: 22, close: 7, // UTC hours
    color: '#60c8d4',
    pairs: ['AUD/USD', 'AUD/JPY', 'NZD/USD'],
    description: 'Low volatility, Australian and NZD pairs active',
  },
  {
    name: 'Tokyo',
    open: 0, close: 9,
    color: '#f59e0b',
    pairs: ['USD/JPY', 'GBP/JPY', 'AUD/JPY'],
    description: 'JPY pairs most active, moderate volatility',
  },
  {
    name: 'London',
    open: 8, close: 17,
    color: '#1D9E75',
    pairs: ['EUR/USD', 'GBP/USD', 'EUR/GBP'],
    description: 'Highest volume session, EUR and GBP pairs',
  },
  {
    name: 'New York',
    open: 13, close: 22,
    color: '#e05555',
    pairs: ['EUR/USD', 'GBP/USD', 'USD/CAD'],
    description: 'High volatility, overlaps with London 13-17 UTC',
  },
]

const TIMEZONES = [
  { label: 'UTC', offset: 0 },
  { label: 'Kampala / Nairobi (EAT)', offset: 3 },
  { label: 'London (GMT/BST)', offset: 1 },
  { label: 'New York (EST/EDT)', offset: -4 },
  { label: 'Dubai (GST)', offset: 4 },
  { label: 'Mumbai (IST)', offset: 5.5 },
  { label: 'Singapore (SGT)', offset: 8 },
  { label: 'Tokyo (JST)', offset: 9 },
  { label: 'Sydney (AEST)', offset: 10 },
  { label: 'Los Angeles (PST/PDT)', offset: -7 },
]

function formatHour(utcHour, offset) {
  let local = (utcHour + offset + 24) % 24
  const h = Math.floor(local)
  const m = (local % 1) * 60
  const hStr = h.toString().padStart(2, '0')
  const mStr = m === 0 ? '00' : '30'
  const ampm = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${mStr} ${ampm}`
}

function isSessionOpen(session, utcHour) {
  if (session.open < session.close) {
    return utcHour >= session.open && utcHour < session.close
  } else {
    return utcHour >= session.open || utcHour < session.close
  }
}

export default function SessionConverter() {
  const [timezone, setTimezone] = useState('3')
  const [currentUTC, setCurrentUTC] = useState(new Date().getUTCHours())

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentUTC(new Date().getUTCHours())
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const offset = parseFloat(timezone)

  return (
    <div style={{ background: '#080d14', minHeight: '100vh', color: '#e2e8f0' }}>
      <div style={{ background: '#0d1520', borderBottom: '1px solid #1a2535', padding: '16px 0' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: '13px', color: '#64748b' }}>
            <Link href="/tools" style={{ color: '#60c8d4', textDecoration: 'none' }}>Tools</Link>
            {' › '} Session Time Converter
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 8px' }}>
          Trading Session Converter
        </h1>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 32px', lineHeight: '1.6' }}>
          Convert forex trading session times to your local timezone. Know exactly when each session opens and closes.
        </p>

        {/* Timezone selector */}
        <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
          <label style={{ color: '#94a3b8', fontSize: '13px', marginBottom: '8px', display: 'block' }}>Your Timezone</label>
          <select
            value={timezone}
            onChange={e => setTimezone(e.target.value)}
            style={{
              padding: '12px 14px', background: '#060b11', border: '1px solid #1a2535',
              borderRadius: '8px', color: '#f1f5f9', fontSize: '15px', width: '100%', maxWidth: '360px',
            }}
          >
            {TIMEZONES.map(tz => (
              <option key={tz.label} value={tz.offset}>{tz.label} (UTC{tz.offset >= 0 ? '+' : ''}{tz.offset})</option>
            ))}
          </select>
        </div>

        {/* Session Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          {SESSIONS.map(session => {
            const open = isSessionOpen(session, currentUTC)
            return (
              <div key={session.name} style={{
                background: '#0d1520',
                border: `1px solid ${open ? session.color + '40' : '#1a2535'}`,
                borderRadius: '12px', padding: '24px',
                position: 'relative', overflow: 'hidden',
              }}>
                {open && (
                  <div style={{
                    position: 'absolute', top: '12px', right: '12px',
                    background: session.color + '20', border: `1px solid ${session.color}40`,
                    borderRadius: '20px', padding: '2px 10px',
                    fontSize: '11px', color: session.color, fontWeight: '600',
                  }}>
                    OPEN
                  </div>
                )}
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>
                  {session.name === 'Sydney' ? '🇦🇺' : session.name === 'Tokyo' ? '🇯🇵' : session.name === 'London' ? '🇬🇧' : '🇺🇸'}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '700', color: session.color, margin: '8px 0 4px' }}>
                  {session.name}
                </h3>
                <div style={{ color: '#f1f5f9', fontSize: '20px', fontWeight: '600', marginBottom: '4px' }}>
                  {formatHour(session.open, offset)} – {formatHour(session.close, offset)}
                </div>
                <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px' }}>
                  UTC {session.open}:00 – {session.close}:00
                </div>
                <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '12px', lineHeight: '1.5' }}>
                  {session.description}
                </div>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {session.pairs.map(p => (
                    <span key={p} style={{
                      background: '#060b11', border: '1px solid #1a2535',
                      borderRadius: '4px', padding: '2px 8px',
                      fontSize: '11px', color: '#94a3b8',
                    }}>{p}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Overlap section */}
        <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '12px', padding: '28px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: '#f1f5f9', margin: '0 0 16px' }}>
            Best Trading Times — Session Overlaps
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            {[
              {
                name: 'Tokyo + London Overlap',
                utc: '08:00 – 09:00 UTC',
                local: `${formatHour(8, offset)} – ${formatHour(9, offset)}`,
                desc: 'EUR/JPY, GBP/JPY most active',
                color: '#f59e0b',
              },
              {
                name: 'London + New York Overlap',
                utc: '13:00 – 17:00 UTC',
                local: `${formatHour(13, offset)} – ${formatHour(17, offset)}`,
                desc: 'Highest volume of the day. EUR/USD, GBP/USD',
                color: '#1D9E75',
              },
            ].map(overlap => (
              <div key={overlap.name} style={{
                background: '#060b11', border: `1px solid ${overlap.color}30`,
                borderRadius: '10px', padding: '16px',
              }}>
                <div style={{ color: overlap.color, fontWeight: '600', fontSize: '14px', marginBottom: '6px' }}>
                  ⚡ {overlap.name}
                </div>
                <div style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '600', marginBottom: '2px' }}>
                  {overlap.local}
                </div>
                <div style={{ color: '#64748b', fontSize: '12px', marginBottom: '6px' }}>{overlap.utc}</div>
                <div style={{ color: '#94a3b8', fontSize: '13px' }}>{overlap.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
