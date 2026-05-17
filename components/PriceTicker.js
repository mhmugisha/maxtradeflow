"use client";
import { useState, useEffect } from 'react';
import { fetchPrices } from '../lib/api';

export default function PriceTicker() {
  const [prices, setPrices] = useState([]);

  useEffect(() => {
    let cancelled = false;
    function load() {
      fetchPrices().then(data => {
        if (!cancelled) setPrices(data || []);
      }).catch(() => {});
    }
    load();
    const interval = setInterval(load, 30000); // refresh every 30s
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Show nothing if no prices have loaded yet — avoids empty bar flash
  if (!prices || prices.length === 0) return null;

  return (
    <section style={{
      background: '#0d1520',
      padding: '6px 0',
      borderBottom: '1px solid #1a2535',
      overflow: 'hidden',
    }}>
      <div className="animate-scroll" style={{ display: 'flex', gap: '24px', whiteSpace: 'nowrap' }}>
        {[...prices, ...prices].slice(0, 30).map((price, index) => (
          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
            <span style={{ color: '#94a3b8', fontWeight: '600' }}>{price.symbol}</span>
            <span style={{ color: '#60c8d4', fontFamily: 'monospace' }}>{price.bid}</span>
            <span style={{ color: '#1a2535' }}>|</span>
          </div>
        ))}
      </div>
    </section>
  );
}
