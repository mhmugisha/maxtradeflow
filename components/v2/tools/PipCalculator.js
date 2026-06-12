'use client';
// Math ported verbatim from app/tools/pip-calculator/page.js (battle-tested —
// do not reinvent), including the branch order: metal → JPY → */USD → USD/* →
// cross. Pair list and pip sizes derive from lib/instruments.js (gold pips at
// 0.01 as in the legacy pip calculator).

import { useState } from 'react';
import { FX_AND_METAL, isJpyPair, isMetal } from './instrumentKinds';
import { Field, NumberInput, Select, Card, BigResult, Stat, HowItWorks } from './ui';

const LOT_SIZES = [
  { label: 'Standard (1.0)', value: '100000' },
  { label: 'Mini (0.1)', value: '10000' },
  { label: 'Micro (0.01)', value: '1000' },
  { label: 'Nano (0.001)', value: '100' },
];

const pipSizeFor = (inst) => (isMetal(inst) || isJpyPair(inst) ? 0.01 : 0.0001);

function compute(inst, lotType, customLot, exchangeRate) {
  if (!inst) return null;
  const units = customLot ? parseFloat(customLot) * 100000 : parseFloat(lotType);
  const rate = parseFloat(exchangeRate) || 1;
  if (!units) return null;

  const pipSize = pipSizeFor(inst);
  const pair = inst.display;
  let pipValueUSD;
  if (isMetal(inst)) {
    pipValueUSD = units * pipSize;
  } else if (isJpyPair(inst)) {
    pipValueUSD = (pipSize / rate) * units;
  } else if (pair.endsWith('/USD')) {
    pipValueUSD = pipSize * units;
  } else if (pair.startsWith('USD/')) {
    pipValueUSD = (pipSize / rate) * units;
  } else {
    pipValueUSD = pipSize * units * rate;
  }

  const lotSize = customLot ? parseFloat(customLot) : units / 100000;
  return { pipValueUSD, lotSize, pipSize };
}

export default function PipCalculator() {
  const [symbol, setSymbol] = useState('EURUSD');
  const [lotType, setLotType] = useState('100000');
  const [customLot, setCustomLot] = useState('');
  const [exchangeRate, setExchangeRate] = useState('1');

  const inst = FX_AND_METAL.find((i) => i.symbol === symbol);
  const result = compute(inst, lotType, customLot, exchangeRate);

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <Card>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Currency Pair">
            <Select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
              {FX_AND_METAL.map((i) => (
                <option key={i.symbol} value={i.symbol}>{i.display}</option>
              ))}
            </Select>
          </Field>
          <Field label="Lot Size">
            <Select value={lotType} onChange={(e) => setLotType(e.target.value)}>
              {LOT_SIZES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </Select>
          </Field>
          <Field label="Custom Lots (optional)">
            <NumberInput value={customLot} onChange={(e) => setCustomLot(e.target.value)} placeholder="e.g. 0.5" />
          </Field>
          <Field label="Quote/Account Rate">
            <NumberInput value={exchangeRate} onChange={(e) => setExchangeRate(e.target.value)} placeholder="1.0" />
          </Field>
        </div>
      </Card>

      <div className="space-y-4">
        {result ? (
          <>
            <BigResult
              label={`Pip value for ${result.lotSize.toFixed(2)} lots on ${inst.display}`}
              value={`$${result.pipValueUSD.toFixed(2)}`}
              unit="per pip"
            />
            <div className="grid grid-cols-3 gap-3">
              <Stat label="10 pips" value={`$${(result.pipValueUSD * 10).toFixed(2)}`} />
              <Stat label="100 pips" value={`$${(result.pipValueUSD * 100).toFixed(2)}`} />
              <Stat label="Pip size" value={result.pipSize} tone="text-v2-accent" />
            </div>
          </>
        ) : (
          <Card>
            <p className="text-sm text-v2-text-muted">Enter a lot size to see the pip value.</p>
          </Card>
        )}
        <div className="rounded-md border border-v2-line bg-v2-surface p-4">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-v2-text-faint">Pip value by lot</div>
          <div className="v2-num space-y-1 text-xs text-v2-text-muted">
            <div>Standard (1.0) = $10/pip</div>
            <div>Mini (0.1) = $1/pip</div>
            <div>Micro (0.01) = $0.10/pip</div>
          </div>
          <div className="mt-1.5 text-[10px] text-v2-text-faint">For EUR/USD with USD as account currency</div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <HowItWorks
          title="What is a pip?"
          formula="Pip Value = Pip Size × Lot Size × Exchange Rate"
        >
          <p>
            A pip (Percentage in Point) is the smallest standard price move in a currency
            pair. For most pairs it&apos;s the 4th decimal place (0.0001); for JPY pairs
            it&apos;s the 2nd decimal place (0.01).
          </p>
        </HowItWorks>
      </div>
    </div>
  );
}
