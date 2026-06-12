'use client';
// Math ported verbatim from app/tools/margin-calculator/page.js
// (battle-tested — do not reinvent): notional = lots × contract size × price,
// margin = notional ÷ leverage. Contract sizes: FX 100,000 · gold 100 ·
// indices 1, derived per instrument kind from lib/instruments.js.

import { useState } from 'react';
import { CALC_INSTRUMENTS, isIndex, isMetal } from './instrumentKinds';
import { Field, NumberInput, Select, Card, Stat, HowItWorks } from './ui';

const LEVERAGES = ['1:10', '1:20', '1:30', '1:50', '1:100', '1:200', '1:500'];

const contractSizeFor = (inst) => (isIndex(inst) ? 1 : isMetal(inst) ? 100 : 100000);

function compute(inst, lotSize, leverage, price, accountBalance) {
  const lots = parseFloat(lotSize);
  const p = parseFloat(price);
  const balance = parseFloat(accountBalance);
  const lev = parseFloat(leverage.split(':')[1]);
  if (!inst || !lots || !p || !lev) return null;

  const notionalValue = lots * contractSizeFor(inst) * p;
  const requiredMargin = notionalValue / lev;
  const freeMargin = balance ? balance - requiredMargin : null;
  const marginLevel = balance ? (balance / requiredMargin) * 100 : null;

  return {
    notionalValue,
    requiredMargin,
    freeMargin,
    marginLevel,
    marginPercent: (requiredMargin / (balance || requiredMargin)) * 100,
    isSafe: marginLevel ? marginLevel > 200 : true,
  };
}

export default function MarginCalculator() {
  const [symbol, setSymbol] = useState('EURUSD');
  const [lotSize, setLotSize] = useState('1');
  const [leverage, setLeverage] = useState('1:100');
  const [price, setPrice] = useState('1.35000');
  const [accountBalance, setAccountBalance] = useState('10000');

  const inst = CALC_INSTRUMENTS.find((i) => i.symbol === symbol);
  const result = compute(inst, lotSize, leverage, price, accountBalance);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Instrument">
            <Select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
              {CALC_INSTRUMENTS.map((i) => (
                <option key={i.symbol} value={i.symbol}>{i.display}</option>
              ))}
            </Select>
          </Field>
          <Field label="Leverage">
            <Select value={leverage} onChange={(e) => setLeverage(e.target.value)}>
              {LEVERAGES.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </Select>
          </Field>
          <Field label="Lot Size">
            <NumberInput value={lotSize} onChange={(e) => setLotSize(e.target.value)} step="0.01" />
          </Field>
          <Field label="Current Price">
            <NumberInput value={price} onChange={(e) => setPrice(e.target.value)} step="0.00001" />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Account Balance (USD) — for margin level">
              <NumberInput value={accountBalance} onChange={(e) => setAccountBalance(e.target.value)} />
            </Field>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {result ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-v2-line bg-v2-bg p-4">
                <div className="text-[10px] uppercase tracking-wide text-v2-text-faint">Required Margin</div>
                <div className="v2-num mt-1 text-2xl font-bold text-v2-accent">
                  ${result.requiredMargin.toFixed(2)}
                </div>
              </div>
              <div className="rounded-md border border-v2-line bg-v2-bg p-4">
                <div className="text-[10px] uppercase tracking-wide text-v2-text-faint">Notional Value</div>
                <div className="v2-num mt-1 text-2xl font-bold text-v2-text">
                  ${parseFloat(result.notionalValue.toFixed(2)).toLocaleString()}
                </div>
              </div>
            </div>
            {result.freeMargin != null && result.marginLevel != null && (
              <div className="grid grid-cols-3 gap-3">
                <Stat
                  label="Free Margin"
                  value={`$${result.freeMargin.toFixed(2)}`}
                  tone={result.freeMargin > 0 ? 'text-v2-bullish' : 'text-v2-bearish'}
                />
                <Stat
                  label="Margin Level"
                  value={`${result.marginLevel.toFixed(0)}%`}
                  tone={result.isSafe ? 'text-v2-bullish' : 'text-v2-bearish'}
                />
                <Stat label="Margin Used" value={`${result.marginPercent.toFixed(1)}%`} />
              </div>
            )}
            {result.marginLevel != null && !result.isSafe && (
              <div className="rounded-md border border-v2-bearish bg-v2-bearish-soft p-3 text-xs text-v2-bearish">
                ⚠ Margin level below 200% — consider reducing position size or adding funds.
              </div>
            )}
            <div className="rounded-md border border-v2-line bg-v2-surface p-4">
              <div className="mb-2 text-[10px] uppercase tracking-widest text-v2-text-faint">Margin call levels</div>
              <div className="space-y-1 text-xs">
                <div className="text-v2-bullish">&gt; 200% — Safe zone</div>
                <div className="text-v2-gold">100–200% — Caution</div>
                <div className="text-v2-bearish">50–100% — Margin call risk</div>
                <div className="text-v2-bearish">&lt; 50% — Stop out risk</div>
              </div>
            </div>
          </>
        ) : (
          <Card>
            <p className="text-sm text-v2-text-muted">Enter a lot size, price and leverage to see the margin.</p>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2">
        <HowItWorks
          title="Understanding margin"
          formula={'Required Margin = (Lot Size × Contract Size × Price) ÷ Leverage\nMargin Level = (Equity ÷ Used Margin) × 100'}
        >
          <p>
            Margin is the collateral required to open a leveraged position. It&apos;s not a
            fee — it&apos;s a deposit held while the trade is open. Contract sizes here:
            100,000 units per FX lot, 100 oz per gold lot, 1 contract per index lot.
          </p>
        </HowItWorks>
      </div>
    </div>
  );
}
