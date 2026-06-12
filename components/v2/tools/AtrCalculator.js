'use client';
// Math ported verbatim from app/tools/atr-volatility/page.js (battle-tested —
// do not reinvent): TR = max(H−L, |H−prevC|, |L−prevC|), ATR = mean(TR).
// Unlike legacy this computes live (no Calculate button) per Session 5 spec.
// TYPICAL_ATR is the legacy page's approximate daily reference table — it is
// labelled as approximate in the UI and exists nowhere else in the codebase.

import { useState } from 'react';
import { CALC_INSTRUMENTS, isJpyPair, isIndex, isMetal } from './instrumentKinds';
import { Field, NumberInput, Select, Card, Stat, HowItWorks } from './ui';

// Approximate typical daily ATR in pips, keyed by canonical symbol (ported
// from the legacy page's display-keyed table).
const TYPICAL_ATR = {
  EURUSD: 80, GBPUSD: 110, USDJPY: 70, GBPJPY: 150,
  AUDUSD: 70, USDCAD: 80, EURGBP: 55, AUDJPY: 90,
  CHFJPY: 100, GBPAUD: 130, NZDUSD: 65, XAUUSD: 200,
  US500: 50, NAS100: 200, US30: 300,
};

const PERIODS = ['7', '10', '14', '20'];

const pipDivisorFor = (inst) =>
  isJpyPair(inst) ? 0.01 : isIndex(inst) || isMetal(inst) ? 1 : 0.0001;

function volatilityFor(atrPips, typical) {
  if (atrPips > typical * 1.2) return 'High';
  if (atrPips < typical * 0.8) return 'Low';
  return 'Normal';
}

function computeManual(inst, period, highs, lows, closes) {
  const n = parseInt(period);
  const trueRanges = [];
  for (let i = 0; i < n; i++) {
    const h = parseFloat(highs[i]);
    const l = parseFloat(lows[i]);
    const prevC = i > 0 ? parseFloat(closes[i - 1]) : null;
    if (!h || !l) continue;
    const hl = h - l;
    const hc = prevC ? Math.abs(h - prevC) : 0;
    const lc = prevC ? Math.abs(l - prevC) : 0;
    trueRanges.push(Math.max(hl, hc, lc));
  }
  if (trueRanges.length < 2) return null;

  const atr = trueRanges.reduce((a, b) => a + b, 0) / trueRanges.length;
  const atrPips = atr / pipDivisorFor(inst);
  return {
    atr,
    atrPips,
    suggestedSL: atrPips * 1.5,
    suggestedTP: atrPips * 3,
    volatility: volatilityFor(atrPips, TYPICAL_ATR[inst.symbol]),
    isTypical: false,
  };
}

function computeTypical(inst) {
  const atrPips = TYPICAL_ATR[inst.symbol];
  return {
    atr: atrPips * pipDivisorFor(inst),
    atrPips,
    suggestedSL: atrPips * 1.5,
    suggestedTP: atrPips * 3,
    volatility: 'Normal',
    isTypical: true,
  };
}

export default function AtrCalculator() {
  const [symbol, setSymbol] = useState('EURUSD');
  const [period, setPeriod] = useState('14');
  const [useManual, setUseManual] = useState(false);
  const [highs, setHighs] = useState(Array(14).fill(''));
  const [lows, setLows] = useState(Array(14).fill(''));
  const [closes, setCloses] = useState(Array(14).fill(''));

  const inst = CALC_INSTRUMENTS.find((i) => i.symbol === symbol);
  const result = useManual
    ? computeManual(inst, period, highs, lows, closes)
    : computeTypical(inst);

  const setRow = (setter, list, i, value) => {
    const next = [...list];
    next[i] = value;
    setter(next);
  };
  const changePeriod = (p) => {
    const n = parseInt(p);
    setHighs(Array(n).fill(''));
    setLows(Array(n).fill(''));
    setCloses(Array(n).fill(''));
    setPeriod(p);
  };

  const volatilityTone =
    result?.volatility === 'High'
      ? 'text-v2-bearish'
      : result?.volatility === 'Low'
        ? 'text-v2-accent'
        : 'text-v2-bullish';

  return (
    <div className="grid items-start gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div className="flex gap-2">
          {[
            { manual: false, label: 'Use Typical ATR' },
            { manual: true, label: 'Enter Price Data' },
          ].map((mode) => (
            <button
              key={mode.label}
              type="button"
              onClick={() => setUseManual(mode.manual)}
              className={`min-h-11 rounded-md border px-4 text-sm font-medium transition-colors ${
                useManual === mode.manual
                  ? 'border-v2-accent bg-v2-accent-soft text-v2-accent'
                  : 'border-v2-line bg-v2-surface text-v2-text-muted hover:text-v2-text'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instrument">
              <Select value={symbol} onChange={(e) => setSymbol(e.target.value)}>
                {CALC_INSTRUMENTS.map((i) => (
                  <option key={i.symbol} value={i.symbol}>{i.display}</option>
                ))}
              </Select>
            </Field>
            {useManual && (
              <Field label="ATR Period">
                <Select value={period} onChange={(e) => changePeriod(e.target.value)}>
                  {PERIODS.map((p) => (
                    <option key={p} value={p}>Period {p}</option>
                  ))}
                </Select>
              </Field>
            )}
          </div>

          {useManual && (
            <div className="mt-4">
              <div className="mb-2 text-xs text-v2-text-muted">
                Enter High, Low, Close for each of the last {period} candles (oldest first) —
                the ATR updates as you type:
              </div>
              <div className="mb-1.5 grid grid-cols-[2rem_1fr_1fr_1fr] gap-1.5 text-center text-[10px] text-v2-text-faint">
                <div />
                <div>High</div>
                <div>Low</div>
                <div>Close</div>
              </div>
              <div className="max-h-72 space-y-1.5 overflow-y-auto">
                {highs.map((_, i) => (
                  <div key={i} className="grid grid-cols-[2rem_1fr_1fr_1fr] items-center gap-1.5">
                    <div className="v2-num text-center text-xs text-v2-text-faint">{i + 1}</div>
                    <NumberInput value={highs[i]} placeholder="High" step="0.00001"
                      onChange={(e) => setRow(setHighs, highs, i, e.target.value)} />
                    <NumberInput value={lows[i]} placeholder="Low" step="0.00001"
                      onChange={(e) => setRow(setLows, lows, i, e.target.value)} />
                    <NumberInput value={closes[i]} placeholder="Close" step="0.00001"
                      onChange={(e) => setRow(setCloses, closes, i, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      </div>

      <div className="space-y-4">
        {result ? (
          <>
            {result.isTypical && (
              <p className="text-xs text-v2-text-faint">
                Using the approximate typical 14-period daily ATR for {inst.display} — a
                reference value, not live market data.
              </p>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-md border border-v2-line bg-v2-bg p-4">
                <div className="text-[10px] uppercase tracking-wide text-v2-text-faint">ATR Value</div>
                <div className="v2-num mt-1 text-2xl font-bold text-v2-accent">{result.atrPips.toFixed(1)}</div>
                <div className="text-[10px] text-v2-text-faint">pips</div>
              </div>
              <div className="rounded-md border border-v2-line bg-v2-bg p-4">
                <div className="text-[10px] uppercase tracking-wide text-v2-text-faint">Volatility</div>
                <div className={`mt-1 text-2xl font-bold ${volatilityTone}`}>{result.volatility}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Suggested SL (1.5× ATR)" value={`${result.suggestedSL.toFixed(1)} pips`} tone="text-v2-bearish" />
              <Stat label="Suggested TP (3× ATR)" value={`${result.suggestedTP.toFixed(1)} pips`} tone="text-v2-bullish" />
            </div>
          </>
        ) : (
          <Card>
            <p className="text-sm text-v2-text-muted">
              Enter at least two complete High/Low rows to compute the ATR.
            </p>
          </Card>
        )}

        <div className="rounded-md border border-v2-line bg-v2-surface p-4">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-v2-text-faint">
            Typical daily ATR (approximate)
          </div>
          <div className="grid grid-cols-2 gap-x-4">
            {CALC_INSTRUMENTS.map((i) => (
              <div key={i.symbol} className="flex justify-between border-b border-v2-line py-1 text-xs last:border-0">
                <span className="text-v2-text-muted">{i.display}</span>
                <span className="v2-num text-v2-accent">~{TYPICAL_ATR[i.symbol]} pips</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <HowItWorks
          title="What is ATR?"
          formula={'True Range = Max(High−Low, |High−PrevClose|, |Low−PrevClose|)\nATR = Average of True Range over N periods'}
        >
          <p>
            Average True Range measures volatility by averaging the True Range over a set
            period. It helps set stop losses that respect current market conditions rather
            than arbitrary pip amounts — a common approach is a stop at 1.5–2× ATR from
            entry so normal volatility doesn&apos;t stop you out.
          </p>
        </HowItWorks>
      </div>
    </div>
  );
}
