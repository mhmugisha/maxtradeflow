'use client';
// Math ported verbatim from app/tools/compound-interest/page.js
// (battle-tested — do not reinvent): balanceₙ = balanceₙ₋₁ × (1 + r) +
// monthly deposit, iterated. The breakdown table and bar chart show the
// same series the legacy page computed.

import { useState } from 'react';
import { Field, NumberInput, Card, Stat, HowItWorks } from './ui';

function compute(startBalance, monthlyReturn, months, monthlyDeposit) {
  const balance = parseFloat(startBalance);
  const rate = parseFloat(monthlyReturn) / 100;
  const m = parseInt(months);
  const deposit = parseFloat(monthlyDeposit) || 0;
  if (!balance || !rate || !m) return null;

  const data = [];
  let current = balance;
  for (let i = 1; i <= m; i++) {
    current = current * (1 + rate) + deposit;
    data.push({ month: i, balance: parseFloat(current.toFixed(2)) });
  }

  const finalBalance = data[data.length - 1].balance;
  const totalDeposited = balance + deposit * m;
  return {
    finalBalance,
    totalProfit: finalBalance - totalDeposited,
    totalDeposited,
    returnMultiple: finalBalance / balance,
    data,
  };
}

export default function CompoundInterestCalculator() {
  const [startBalance, setStartBalance] = useState('10000');
  const [monthlyReturn, setMonthlyReturn] = useState('5');
  const [months, setMonths] = useState('12');
  const [monthlyDeposit, setMonthlyDeposit] = useState('0');

  const result = compute(startBalance, monthlyReturn, months, monthlyDeposit);
  const maxBalance = result ? Math.max(...result.data.map((d) => d.balance)) : 0;

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Starting Balance ($)">
              <NumberInput value={startBalance} onChange={(e) => setStartBalance(e.target.value)} />
            </Field>
            <Field label="Monthly Return (%)">
              <NumberInput value={monthlyReturn} onChange={(e) => setMonthlyReturn(e.target.value)} step="0.1" />
            </Field>
            <Field label="Number of Months">
              <NumberInput value={months} onChange={(e) => setMonths(e.target.value)} min="1" max="120" />
            </Field>
            <Field label="Monthly Deposit ($)">
              <NumberInput value={monthlyDeposit} onChange={(e) => setMonthlyDeposit(e.target.value)} />
            </Field>
          </div>
        </Card>

        <div className="space-y-4">
          {result ? (
            <>
              <div className="grid grid-cols-3 gap-3">
                <Stat
                  label="Final Balance"
                  value={`$${result.finalBalance.toLocaleString()}`}
                  tone="text-v2-bullish"
                />
                <Stat
                  label="Total Profit"
                  value={`$${parseFloat(result.totalProfit.toFixed(2)).toLocaleString()}`}
                  tone="text-v2-accent"
                />
                <Stat label="Return Multiple" value={`${result.returnMultiple.toFixed(2)}x`} />
              </div>
              <div className="rounded-md border border-v2-line bg-v2-bg p-4">
                <div className="mb-3 text-[10px] uppercase tracking-widest text-v2-text-faint">Monthly growth</div>
                <div className="flex h-20 items-end gap-px">
                  {result.data.map((d, i) => (
                    <div
                      key={i}
                      className="min-w-0.5 flex-1 rounded-t-sm bg-v2-bullish"
                      style={{
                        height: `${(d.balance / maxBalance) * 100}%`,
                        opacity: 0.4 + (i / result.data.length) * 0.6,
                      }}
                      title={`Month ${d.month}: $${d.balance.toLocaleString()}`}
                    />
                  ))}
                </div>
                <div className="mt-1 flex justify-between text-[10px] text-v2-text-faint">
                  <span>Month 1</span>
                  <span>Month {months}</span>
                </div>
              </div>
            </>
          ) : (
            <Card>
              <p className="text-sm text-v2-text-muted">
                Enter a starting balance, monthly return and duration to see the projection.
              </p>
            </Card>
          )}
        </div>
      </div>

      {result && (
        <Card>
          <h2 className="mb-3 font-v2-display text-base font-semibold text-v2-text">Monthly breakdown</h2>
          <div className="max-h-72 overflow-y-auto rounded-md border border-v2-line">
            <table className="w-full text-left text-xs">
              <thead className="sticky top-0 bg-v2-bg">
                <tr className="border-b border-v2-line">
                  {['Month', 'Balance', 'Profit This Month', 'Total Profit'].map((h) => (
                    <th key={h} className="px-3 py-2 font-medium text-v2-text-faint">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {result.data.map((d, i) => {
                  const prev = i === 0 ? parseFloat(startBalance) : result.data[i - 1].balance;
                  const deposit = parseFloat(monthlyDeposit) || 0;
                  const monthProfit = d.balance - prev - deposit;
                  const totalProfit = d.balance - parseFloat(startBalance) - deposit * (i + 1);
                  return (
                    <tr key={i} className="border-b border-v2-line last:border-0">
                      <td className="v2-num px-3 py-1.5 text-v2-text-faint">{i + 1}</td>
                      <td className="v2-num px-3 py-1.5 font-medium text-v2-text">${d.balance.toLocaleString()}</td>
                      <td className="v2-num px-3 py-1.5 text-v2-bullish">+${monthProfit.toFixed(2)}</td>
                      <td className="v2-num px-3 py-1.5 text-v2-accent">+${totalProfit.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <HowItWorks
        title="How compounding is calculated"
        formula="Balanceₙ = Balanceₙ₋₁ × (1 + Monthly Return) + Monthly Deposit"
      >
        <p>
          Each month&apos;s return is applied to the running balance — including all
          previously earned profit — then any deposit is added. The projection assumes the
          same return every month; real trading returns vary and can be negative.
        </p>
      </HowItWorks>
    </div>
  );
}
