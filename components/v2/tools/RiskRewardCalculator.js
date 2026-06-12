'use client';
// Math ported verbatim from app/tools/risk-reward/page.js (battle-tested — do
// not reinvent). Like the legacy page, dollar amounts assume a 4-decimal
// (non-JPY) pair at $10 per pip per standard lot; the ratio itself is
// price-based and instrument-independent. Direction is a visual aid — the
// math uses absolute distances, as in legacy.

import { useState } from 'react';
import { Field, NumberInput, Card, Stat, HowItWorks, DirectionToggle } from './ui';

function compute(entryPrice, stopLoss, takeProfit, lotSize) {
  const entry = parseFloat(entryPrice);
  const sl = parseFloat(stopLoss);
  const tp = parseFloat(takeProfit);
  const lots = parseFloat(lotSize);
  if (!entry || !sl || !tp || !lots) return null;

  const riskPips = Math.abs(entry - sl) / 0.0001;
  const rewardPips = Math.abs(tp - entry) / 0.0001;
  const rrRatio = rewardPips / riskPips;
  const pipValue = lots * 10;
  const riskAmount = riskPips * pipValue;
  const rewardAmount = rewardPips * pipValue;
  const winRateNeeded = (1 / (1 + rrRatio)) * 100;

  return { riskPips, rewardPips, rrRatio, riskAmount, rewardAmount, winRateNeeded, isGood: rrRatio >= 1.5 };
}

export default function RiskRewardCalculator() {
  const [entryPrice, setEntryPrice] = useState('1.35000');
  const [stopLoss, setStopLoss] = useState('1.34500');
  const [takeProfit, setTakeProfit] = useState('1.36000');
  const [lotSize, setLotSize] = useState('0.1');
  const [direction, setDirection] = useState('LONG');

  const result = compute(entryPrice, stopLoss, takeProfit, lotSize);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <DirectionToggle value={direction} onChange={setDirection} />
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Entry Price">
              <NumberInput value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)} step="0.00001" />
            </Field>
            <Field label="Lot Size">
              <NumberInput value={lotSize} onChange={(e) => setLotSize(e.target.value)} step="0.01" />
            </Field>
            <Field label="Stop Loss Price" tone="text-v2-bearish">
              <NumberInput value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} step="0.00001" />
            </Field>
            <Field label="Take Profit Price" tone="text-v2-bullish">
              <NumberInput value={takeProfit} onChange={(e) => setTakeProfit(e.target.value)} step="0.00001" />
            </Field>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        {result ? (
          <>
            <div
              className={`rounded-md border p-4 text-center ${
                result.isGood
                  ? 'border-v2-bullish bg-v2-bullish-soft'
                  : 'border-v2-bearish bg-v2-bearish-soft'
              }`}
            >
              <div className="text-[10px] uppercase tracking-widest text-v2-text-faint">Risk/Reward Ratio</div>
              <div className={`v2-num mt-1 text-5xl font-bold ${result.isGood ? 'text-v2-bullish' : 'text-v2-bearish'}`}>
                1:{result.rrRatio.toFixed(2)}
              </div>
              <div className={`mt-2 text-xs ${result.isGood ? 'text-v2-bullish' : 'text-v2-bearish'}`}>
                {result.isGood ? '✓ Good setup — reward exceeds risk' : '⚠ Poor setup — risk exceeds reward'}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Stat label="Risk (pips)" value={result.riskPips.toFixed(1)} tone="text-v2-bearish" />
              <Stat label="Reward (pips)" value={result.rewardPips.toFixed(1)} tone="text-v2-bullish" />
              <Stat label="Win rate needed" value={`${result.winRateNeeded.toFixed(1)}%`} tone="text-v2-accent" />
              <Stat label="Risk amount" value={`$${result.riskAmount.toFixed(2)}`} tone="text-v2-bearish" />
              <Stat label="Reward amount" value={`$${result.rewardAmount.toFixed(2)}`} tone="text-v2-bullish" />
              <Stat label="Net if won" value={`+$${result.rewardAmount.toFixed(2)}`} tone="text-v2-bullish" />
            </div>
          </>
        ) : (
          <Card>
            <p className="text-sm text-v2-text-muted">Enter entry, stop loss and take profit to see the ratio.</p>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2">
        <HowItWorks
          title="Why the R:R ratio matters"
          formula={'RR Ratio = (Take Profit − Entry) ÷ (Entry − Stop Loss)\nWin Rate Needed = 1 ÷ (1 + RR Ratio) × 100'}
        >
          <p>
            A minimum 1:2 risk-reward means you only need to win 33% of trades to break
            even; at 1:3 you only need 25%. Dollar amounts here assume a 4-decimal
            (non-JPY) pair at $10 per pip per standard lot — the ratio itself holds for
            any instrument.
          </p>
        </HowItWorks>
      </div>
    </div>
  );
}
