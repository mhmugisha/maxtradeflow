'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchPrices, fetchScreener } from '../lib/api';

export default function Home() {
  const [prices, setPrices] = useState([]);
  const [screener, setScreener] = useState([]);

  useEffect(() => {
    // Initial fetch
    fetchPrices().then(setPrices);
    fetchScreener().then(setScreener);

    // Set up intervals
    const pricesInterval = setInterval(() => {
      fetchPrices().then(setPrices);
    }, 5000);

    return () => clearInterval(pricesInterval);
  }, []);

  const getMarketStatus = (timezone) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (timezone * 3600000));

    const hour = localTime.getHours();
    const day = localTime.getDay();

    // Weekend check
    if (day === 0 || day === 6) return 'Closed';

    // Market hours (simplified)
    if (hour >= 9 && hour < 17) return 'Open';
    return 'Closed';
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-linear-to-b from-[#111e2e] to-[#080d14] py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-linear-to-r from-[#60c8d4] to-[#4da8b3] bg-clip-text text-transparent">
            AI-Powered Market Analysis
          </h1>
          <p className="text-xl md:text-2xl text-[#3a6070] mb-8">
            Real signals from Smart Asset Bot. Live screener across 15 instruments. No opinion — just data.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-[#60c8d4] text-[#080d14] px-8 py-3 rounded-lg font-semibold hover:bg-[#4da8b3] transition-colors">
              View Screener
            </button>
            <button className="border border-[#60c8d4] text-[#60c8d4] px-8 py-3 rounded-lg font-semibold hover:bg-[#60c8d4] hover:text-[#080d14] transition-colors">
              Live Bot Signals
            </button>
          </div>
        </div>
      </section>

      {/* Live Price Ticker */}
      <section className="bg-[#111e2e] py-4 border-y border-[#1a2e42]">
        <div className="overflow-hidden">
          <div className="animate-scroll flex space-x-8 whitespace-nowrap">
            {prices.slice(0, 20).map((price, index) => (
              <div key={index} className="flex items-center space-x-4 text-sm">
                <span className="font-medium">{price.symbol}</span>
                <span className="text-[#60c8d4]">{price.bid}</span>
                <span className="text-[#3a6070]">Spread: {price.spread}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Asset Class Cards */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Market Coverage</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-5 gap-6">
            <div className="bg-[#111e2e] border border-[#1a2e42] rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-[#60c8d4] mb-2">Forex</h3>
              <p className="text-[#3a6070] mb-4">Major & minor currency pairs</p>
              <div className="text-sm text-[#c8dce8]">EUR/USD, GBP/USD, USD/JPY, etc.</div>
            </div>
            <div className="bg-[#111e2e] border border-[#1a2e42] rounded-lg p-6 text-center">
              <h3 className="text-xl font-semibold text-[#60c8d4] mb-2">Indices</h3>
              <p className="text-[#3a6070] mb-4">Global stock indices</p>
              <div className="text-sm text-[#c8dce8]">US500, NAS100, US30</div>
            </div>
            <div className="bg-[#111e2e] border border-[#1a2e42] rounded-lg p-6 text-center opacity-50">
              <h3 className="text-xl font-semibold text-[#3a6070] mb-2">Commodities</h3>
              <p className="text-[#3a6070] mb-4">Coming soon</p>
            </div>
            <div className="bg-[#111e2e] border border-[#1a2e42] rounded-lg p-6 text-center opacity-50">
              <h3 className="text-xl font-semibold text-[#3a6070] mb-2">Crypto</h3>
              <p className="text-[#3a6070] mb-4">Coming soon</p>
            </div>
            <div className="bg-[#111e2e] border border-[#1a2e42] rounded-lg p-6 text-center opacity-50">
              <h3 className="text-xl font-semibold text-[#3a6070] mb-2">Stocks</h3>
              <p className="text-[#3a6070] mb-4">Coming soon</p>
            </div>
          </div>
        </div>
      </section>

      {/* Signal Scores Section */}
      <section className="py-16 px-4 bg-[#111e2e]">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Live Signal Scores</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {screener.map((signal, index) => (
              <div key={index} className="bg-[#080d14] border border-[#1a2e42] rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{signal.symbol}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    signal.action === 'TRADE' ? 'bg-[#1D9E75] text-white' :
                    signal.action === 'WATCH' ? 'bg-[#EF9F27] text-white' :
                    'bg-[#e05555] text-white'
                  }`}>
                    {signal.action}
                  </span>
                </div>
                <div className="text-sm text-[#3a6070]">
                  Score: {signal.score} | ADX: {signal.adx} | {signal.direction}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Market Sessions */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Market Sessions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Sydney</h3>
              <div className={`text-lg ${getMarketStatus(10) === 'Open' ? 'text-[#1D9E75]' : 'text-[#e05555]'}`}>
                {getMarketStatus(10)}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">Tokyo</h3>
              <div className={`text-lg ${getMarketStatus(9) === 'Open' ? 'text-[#1D9E75]' : 'text-[#e05555]'}`}>
                {getMarketStatus(9)}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">London</h3>
              <div className={`text-lg ${getMarketStatus(1) === 'Open' ? 'text-[#1D9E75]' : 'text-[#e05555]'}`}>
                {getMarketStatus(1)}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">New York</h3>
              <div className={`text-lg ${getMarketStatus(-4) === 'Open' ? 'text-[#1D9E75]' : 'text-[#e05555]'}`}>
                {getMarketStatus(-4)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111e2e] border-t border-[#1a2e42] py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex flex-wrap justify-center gap-6 mb-4">
            <Link href="/" className="text-[#c8dce8] hover:text-[#60c8d4]">Home</Link>
            <Link href="/forex" className="text-[#c8dce8] hover:text-[#60c8d4]">Forex</Link>
            <Link href="/indices" className="text-[#c8dce8] hover:text-[#60c8d4]">Indices</Link>
            <Link href="/subscribe" className="text-[#c8dce8] hover:text-[#60c8d4]">Subscribe</Link>
          </div>
          <p className="text-[#3a6070] text-sm">
            Data powered by cTrader/Pepperstone. Analysis generated by AI.
          </p>
        </div>
      </footer>
    </div>
  );
}
