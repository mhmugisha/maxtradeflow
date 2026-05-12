import { Inter } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "MaxTradeFlow - AI-Powered Market Analysis",
  description: "Real trading signals from Smart Asset Bot API. Updated every hour.",
};

function SessionBar() {
  const sessions = [
    { name: 'Sydney', timezone: 10 },
    { name: 'Tokyo', timezone: 9 },
    { name: 'London', timezone: 0 },
    { name: 'New York', timezone: -5 }
  ];

  const getSessionStatus = (timezone) => {
    const now = new Date();
    const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
    const localTime = new Date(utc + (timezone * 3600000));
    const hour = localTime.getHours();
    const day = localTime.getDay();

    if (day === 0 || day === 6) return 'closed';
    if (hour >= 9 && hour < 17) return 'open';
    return 'closed';
  };

  return (
    <div style={{ position: 'sticky', top: '56px', zIndex: 99, backgroundColor: '#111e2e', borderBottom: '1px solid #1a2e42', padding: '8px 16px' }}>
      <div className="max-w-7xl mx-auto flex justify-center gap-8">
        {sessions.map((session) => {
          const status = getSessionStatus(session.timezone);
          const dotColor = status === 'open' ? '#1D9E75' : '#3a6070';
          return (
            <div key={session.name} className="flex items-center gap-2">
              <span className="session-dot" style={{ backgroundColor: dotColor }}></span>
              <span className="text-[11px] text-[#c8dce8]">{session.name}</span>
              <span className="text-[11px] text-[#3a6070]">
                {status === 'open' ? 'Open' : 'Closed'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ToolsDropdown() {
  return (
    <div className="tools-dropdown hidden absolute top-full left-0 bg-[#111e2e] border border-[#1a2e42] rounded-lg py-3 z-100 w-64">
      <div className="px-4">
        <div className="mb-4">
          <p className="text-xs uppercase text-[#3a6070] font-semibold mb-2">Trading Calculators</p>
          <Link href="#" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Position Size</Link>
          <Link href="#" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Risk:Reward</Link>
          <Link href="#" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Pip Calculator</Link>
          <Link href="#" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Margin Calculator</Link>
          <Link href="#" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">ATR Volatility</Link>
        </div>
        <div className="border-t border-[#1a2e42] pt-3 mb-4">
          <p className="text-xs uppercase text-[#3a6070] font-semibold mb-2">Market Utilities</p>
          <Link href="#" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Session Time Converter</Link>
          <Link href="#" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Currency Strength</Link>
          <Link href="#" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">ORB Range Calculator</Link>
        </div>
        <div className="border-t border-[#1a2e42] pt-3">
          <p className="text-xs uppercase text-[#3a6070] font-semibold mb-2">Guides</p>
          <Link href="#" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Scoring System</Link>
          <Link href="#" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Sweep vs Standard</Link>
          <Link href="#" className="block text-sm text-[#c8dce8] hover:text-[#60c8d4] py-1">Stop Loss Logic</Link>
        </div>
      </div>
    </div>
  );
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#080d14] text-[#c8dce8]">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111e2e] border-b border-[#1a2e42] px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="text-[#60c8d4] font-bold text-xl">MaxTradeFlow</div>
            </div>
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/forex" className="text-[#c8dce8] hover:text-[#60c8d4] transition-colors px-3 py-2">Forex</Link>
              <span className="text-[#3a6070]">·</span>
              <Link href="/indices" className="text-[#c8dce8] hover:text-[#60c8d4] transition-colors px-3 py-2">Indices</Link>
              <span className="text-[#3a6070]">·</span>
              <Link href="/commodities" className="text-[#c8dce8] hover:text-[#60c8d4] transition-colors px-3 py-2">Commodities</Link>
              <span className="text-[#3a6070]">·</span>
              <Link href="/crypto" className="text-[#c8dce8] hover:text-[#60c8d4] transition-colors px-3 py-2">Crypto</Link>
              <span className="text-[#3a6070]">·</span>
              <Link href="/stocks" className="text-[#c8dce8] hover:text-[#60c8d4] transition-colors px-3 py-2">Stocks</Link>
              <span className="text-[#1a2e42] px-2">|</span>
              <div className="relative tools-dropdown-container">
                <button className="text-[#c8dce8] hover:text-[#60c8d4] transition-colors px-3 py-2">Tools</button>
                <ToolsDropdown />
              </div>
              <span className="text-[#3a6070]">·</span>
              <Link href="/education" className="text-[#c8dce8] hover:text-[#60c8d4] transition-colors px-3 py-2">Education</Link>
              <span className="text-[#3a6070]">·</span>
              <Link href="/guides" className="text-[#c8dce8] hover:text-[#60c8d4] transition-colors px-3 py-2">Guides</Link>
            </div>
            <button className="text-[#c8dce8] hover:text-[#60c8d4] transition-colors font-medium">
              Sign in
            </button>
          </div>
        </nav>
        <SessionBar />
        <main style={{ flex: 1, paddingTop: '92px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
