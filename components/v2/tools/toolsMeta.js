// components/v2/tools/toolsMeta.js — registry for the 8 v2 trading calculators
// (Phase A Session 5, Tools_Hub.png / Calculator_Expanded.png). Slugs are
// IDENTICAL to the legacy /tools/<slug> pages so cutover replaces them in
// place with zero redirects. Names/descriptions ported from the legacy index.

export const TOOLS = [
  {
    slug: 'position-size',
    name: 'Position Size Calculator',
    sidebarLabel: 'Position Size',
    icon: '⚖️',
    category: 'Risk Management',
    short: 'Calculate the ideal position size based on your account balance, risk percentage and stop loss distance.',
    related: ['risk-reward', 'pip-calculator', 'margin-calculator'],
  },
  {
    slug: 'pip-calculator',
    name: 'Pip Calculator',
    sidebarLabel: 'Pip Calc',
    icon: '📐',
    category: 'Forex',
    short: 'Calculate the pip value for any currency pair, lot size and account currency instantly.',
    related: ['position-size', 'risk-reward', 'margin-calculator'],
  },
  {
    slug: 'risk-reward',
    name: 'Risk/Reward Calculator',
    sidebarLabel: 'Risk/Reward',
    icon: '🎯',
    category: 'Risk Management',
    short: 'Determine your risk-reward ratio and potential profit or loss before entering a trade.',
    related: ['position-size', 'pip-calculator', 'profit-loss'],
  },
  {
    slug: 'margin-calculator',
    name: 'Margin Calculator',
    sidebarLabel: 'Margin Calc',
    icon: '🏦',
    category: 'Risk Management',
    short: 'Calculate required margin, free margin and margin level for any trade size and leverage.',
    related: ['position-size', 'risk-reward', 'profit-loss'],
  },
  {
    slug: 'profit-loss',
    name: 'P&L Calculator',
    sidebarLabel: 'P&L Calc',
    icon: '💰',
    category: 'Calculators',
    short: 'Calculate your profit or loss on any trade based on entry, exit price and lot size.',
    related: ['position-size', 'risk-reward', 'pip-calculator'],
  },
  {
    slug: 'compound-interest',
    name: 'Compound Interest',
    sidebarLabel: 'Compounding',
    icon: '📈',
    category: 'Calculators',
    short: 'See how your trading account grows over time with consistent monthly returns compounded.',
    related: ['position-size', 'profit-loss', 'risk-reward'],
  },
  {
    slug: 'atr-volatility',
    name: 'ATR Volatility Calculator',
    sidebarLabel: 'ATR Volatility',
    icon: '📊',
    category: 'Market Analysis',
    short: 'Calculate Average True Range to measure market volatility and set dynamic stop losses.',
    related: ['position-size', 'risk-reward', 'pip-calculator'],
  },
  {
    slug: 'session-converter',
    name: 'Session Time Converter',
    sidebarLabel: 'Session Times',
    icon: '🕐',
    category: 'Tools',
    short: 'Convert trading session times (London, New York, Tokyo, Sydney) to your local timezone.',
    related: ['atr-volatility', 'position-size', 'pip-calculator'],
  },
];

export const toolBySlug = (slug) => TOOLS.find((t) => t.slug === slug) ?? null;
