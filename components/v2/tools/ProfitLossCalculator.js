'use client';
// Math ported verbatim from app/tools/profit-loss/page.js (battle-tested —
// do not reinvent), including the JPY conversion through the exit price
// (pips × lots × 1000 ÷ exit).

import { useState } from 'react';
import { CALC_INSTRUMENTS, isJpyPair, isIndex, isMetal } from './instrumentKinds';
import { Field, NumberInput, Select, Card, HowItWorks, DirectionToggle } from './ui';

function compute(inst, direction, entryPrice, exitPrice, lotSize) {
  const entry = parseFloat(entryPrice);
  const exit = parseFloat(exitPrice);
  const lots = parseFloat(lotSize);
  if (!inst || !entry || !exit || !lots) return null;

  const jpy = isJpyPair(inst);
  const index = isIndex(inst);
  const metal = isMetal(inst);

  const priceDiff = direction === 'LONG' ? exit - entry : entry - exit;
  let pnl;
  if (index) {
    pnl = priceDiff * lots;
  } else if (metal) {
    pnl = priceDiff * lots * 100;
  } else if (jpy) {
    pnl = (priceDiff / 0.01) * lots * 1000 / exit;
  } else {
    pnl = (priceDiff / 0.0001) * lots * 10;
  }

  const pips = jpy ? priceDiff / 0.01 : index ? priceDiff : priceDiff / 0.0001;
  return {
    pnl,
    pips: Math.abs(pips),
    isProfit: pnl > 0,
    priceDiff: Math.abs(priceDiff).toFixed(jpy ? 3 : 5),
  };
}

export default function ProfitLossCalculator() {
  const [symbol, setSymbol] = useState('EURUSD');
  const [direction, setDirection] = useState('LONG');
  const [entryPrice, setEntryPrice] = useState('1.35000');
  const [exitPrice, setExitPrice] = useState('1.36000');
  const [lotSize, setLotSize] = useState('0.1');

  const inst = CALC_INSTRUMENTS.find((i) => i.symbol === symbol);
  const result = compute(inst, direction, entryPrice, exitPrice, lotSize);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <DirectionToggle value={direction} onChange={setDirection} />
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instrument">
              <Select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                {CALC_INSTRUMENTS.map((i) => (
                  <option key={i.symbol} value={i.symbol}>{i.display}</option>
                ))}
              </Select>
            </Field>
            <Field label="Lot Size">
              <NumberInput value={lotSize} onChange={(e) => setLotSize(e.target.value)} step="0.01" />
            </Field>
            <Field label="Entry Price">
              <NumberInput value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} step="0.00001" />
            </Field>
            <Field label="Exit Price">
              <NumberInput value={exitPrice} onChange={(e) => setExitPrice(e.target.value)} step="0.00001" />
            </Field>
          </div>
        </Card>
      </div>

      <div>
        {result ? (
          <div
            className={`rounded-md border p-6 text-center ${
              result.isProfit
                ? 'border-v2-bullish bg-v2-bullish-soft'
                : 'border-v2-bearish bg-v2-bearish-soft'
            }`}
          >
            <div className="text-[10px] uppercase tracking-widest text-v2-text-faint">
              {result.isProfit ? 'Profit' : 'Loss'}
            </div>
            <div className={`v2-num mt-1 text-5xl font-bold ${result.isProfit ? 'text-v2-bullish' : 'text-v2-bearish'}`}>
              {result.isProfit ? '+' : '−'}${Math.abs(result.pnl).toFixed(2)}
            </div>
            <div className="v2-num mt-2 text-xs text-v2-text-muted">
              {result.pips.toFixed(1)} pips · {result.priceDiff} price move
            </div>
          </div>
        ) : (
          <Card>
            <p className="text-sm text-v2-text-muted">Enter entry, exit and lot size to see the P&amp;L.</p>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2">
        <HowItWorks
          title="How P&L is calculated"
          formula={'Long P&L = (Exit − Entry) × Lot Size × Contract Size\nShort P&L = (Entry − Exit) × Lot Size × Contract Size'}
        >
          <p>
            Profit or loss is the price distance between entry and exit, converted to
            account currency through the instrument&apos;s contract size. JPY-pair results
            are converted through the exit price; index results are per point per contract.
          </p>
        </HowItWorks>
      </div>
    </div>
  );
}
