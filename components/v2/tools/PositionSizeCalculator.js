'use client';
// Math ported verbatim from app/tools/position-size/page.js (battle-tested —
// do not reinvent): risk amount = balance × risk%, lots = risk ÷ (SL × pip
// value per lot), with the legacy per-kind pip values (FX $10, JPY 1000,
// gold $100 at 0.1 pip, indices $1/point).

import { useState } from 'react';
import { CALC_INSTRUMENTS, isJpyPair, isIndex, isMetal } from './instrumentKinds';
import { Field, NumberInput, Select, Card, BigResult, Stat, HowItWorks } from './ui';

const RISK_CHIPS = ['0.5', '1', '1.5', '2'];

function compute(balance, risk, stopLoss, inst) {
  const b = parseFloat(balance);
  const r = parseFloat(risk);
  const sl = parseFloat(stopLoss);
  if (!b || !r || !sl || !inst) return null;

  const riskAmount = (b * r) / 100;
  let lotSize, units, pipLabel, divisorLine;
  if (isIndex(inst)) {
    lotSize = riskAmount / sl;
    units = lotSize;
    pipLabel = '1 point';
    divisorLine = `${sl} points × $1/point`;
  } else if (isMetal(inst)) {
    lotSize = riskAmount / (sl * 100);
    units = lotSize * 100;
    pipLabel = '0.1';
    divisorLine = `${sl} pips × $100/pip`;
  } else if (isJpyPair(inst)) {
    lotSize = riskAmount / (sl * 1000);
    units = lotSize * 100000;
    pipLabel = '0.01';
    divisorLine = `${sl} pips × 1000/pip`;
  } else {
    lotSize = riskAmount / (sl * 10);
    units = lotSize * 100000;
    pipLabel = '0.0001';
    divisorLine = `${sl} pips × $10/pip`;
  }
  return { lotSize, units, riskAmount, pipLabel, divisorLine };
}

export default function PositionSizeCalculator() {
  const [balance, setBalance] = useState('10000');
  const [risk, setRisk] = useState('1');
  const [stopLoss, setStopLoss] = useState('50');
  const [symbol, setSymbol] = useState('EURUSD');

  const inst = CALC_INSTRUMENTS.find((i) => i.symbol === symbol);
  const result = compute(balance, risk, stopLoss, inst);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Account Balance (USD)">
            <NumberInput value={balance} onChange={(e) => setBalance(e.target.value)} placeholder="10000" />
          </Field>
          <Field label="Risk Percentage (%)">
            <NumberInput value={risk} onChange={(e) => setRisk(e.target.value)} placeholder="1" step="0.1" />
          </Field>
          <Field label="Stop Loss (pips)">
            <NumberInput value={stopLoss} onChange={(e) => setStopLoss(e.target.value)} placeholder="50" />
          </Field>
          <Field label="Instrument">
            <Select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
              {CALC_INSTRUMENTS.map((i) => (
                <option key={i.symbol} value={i.symbol}>{i.display}</option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] uppercase tracking-wide text-v2-text-faint">Quick risk</span>
          {RISK_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => setRisk(chip)}
              className={`min-h-11 rounded-md border px-3 text-xs transition-colors md:min-h-8 ${
                risk === chip
                  ? 'border-v2-accent bg-v2-accent-soft text-v2-accent'
                  : 'border-v2-line text-v2-text-muted hover:text-v2-text'
              }`}
            >
              {chip}%
            </button>
          ))}
        </div>
      </Card>

      <div className="space-y-4">
        {result ? (
          <>
            <BigResult
              label="Recommended Position Size"
              value={result.lotSize.toFixed(2)}
              unit="lots"
              sub={`${Math.round(result.units).toLocaleString()} units`}
              tone="text-v2-bullish"
            />
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Risk Amount" value={`$${result.riskAmount.toFixed(2)}`} tone="text-v2-bearish" />
              <Stat label="Pip Size" value={result.pipLabel} tone="text-v2-accent" />
            </div>
            <div className="rounded-md border border-v2-line bg-v2-surface p-4">
              <div className="mb-2 text-[10px] uppercase tracking-widest text-v2-text-faint">
                How this is calculated
              </div>
              <div className="v2-num space-y-1 text-xs leading-relaxed text-v2-text-muted">
                <div>Risk amount = ${parseFloat(balance).toLocaleString()} × {risk}% = ${result.riskAmount.toFixed(2)}</div>
                <div>Lot size = ${result.riskAmount.toFixed(2)} ÷ ({result.divisorLine}) = {result.lotSize.toFixed(2)} lots</div>
              </div>
            </div>
          </>
        ) : (
          <Card>
            <p className="text-sm text-v2-text-muted">Enter your balance, risk and stop loss to see the recommended size.</p>
          </Card>
        )}
      </div>

      <div className="lg:col-span-2">
        <HowItWorks
          title="How position size is calculated"
          formula={'Risk Amount = Account Balance × (Risk % / 100)\nLot Size = Risk Amount ÷ (Stop Loss Pips × Pip Value)'}
        >
          <p>
            The position size formula ensures you never risk more than your chosen percentage
            on any single trade. Professional traders typically risk no more than 1–2% of
            their account per trade, so a losing streak cannot wipe out the account.
          </p>
          <p>
            Example: a $10,000 account at 1% risk with a 50 pip stop loss on EUR/USD risks
            $100, giving $100 ÷ (50 × $10) = 0.20 lots.
          </p>
        </HowItWorks>
      </div>
    </div>
  );
}
