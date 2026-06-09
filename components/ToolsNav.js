"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";

export default function ToolsNav() {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef(null);

  const cancelClose = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  // Open immediately on enter; cancel any pending close so moving the cursor
  // across the gap from the button to the panel does not close the menu.
  const handleEnter = () => {
    cancelClose();
    setOpen(true);
  };

  // Close after a short delay so a brief excursion off the menu (e.g. crossing
  // the gap) doesn't snap it shut; re-entering cancels the timer.
  const handleLeave = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => setOpen(false), 200);
  };

  // Clean up any pending timer on unmount.
  useEffect(() => cancelClose, []);

  return (
    <div
      className="relative tools-dropdown-container"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <button className="text-[#c8dce8] hover:text-[#60c8d4] transition-colors px-3 py-2">Tools</button>
      <div
        className="tools-dropdown absolute top-full left-0 bg-[#111e2e] border border-[#1a2e42] rounded-lg py-3 z-100 w-64"
        style={{ display: open ? "block" : "none" }}
      >
        <div className="px-4">
          <div className="mb-4">
            <p className="text-xs uppercase text-[#3a6070] font-semibold mb-2">Trading Calculators</p>
            <Link href="/tools/position-size" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Position Size</Link>
            <Link href="/tools/risk-reward" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Risk:Reward</Link>
            <Link href="/tools/pip-calculator" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Pip Calculator</Link>
            <Link href="/tools/margin-calculator" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Margin Calculator</Link>
            <Link href="/tools/atr-volatility" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">ATR Volatility</Link>
            <Link href="/tools/compound-interest" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Compound Interest</Link>
            <Link href="/tools/profit-loss" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Profit/Loss</Link>
          </div>
          <div className="border-t border-[#1a2e42] pt-3">
            <p className="text-xs uppercase text-[#3a6070] font-semibold mb-2">Market Utilities</p>
            <Link href="/tools/session-converter" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Session Time Converter</Link>
            <Link href="/economic-calendar" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Economic Calendar</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
