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

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#080d14] text-[#c8dce8]">
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#111e2e] border-b border-[#1a2e42] px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="text-[#60c8d4] font-bold text-xl">MaxTradeFlow</div>
              <div className="hidden md:flex space-x-6">
              <Link href="/" className="text-[#c8dce8] hover:text-[#60c8d4] transition-colors">Home</Link>
              <Link href="/forex" className="text-[#c8dce8] hover:text-[#60c8d4] transition-colors">Forex</Link>
              <Link href="/indices" className="text-[#c8dce8] hover:text-[#60c8d4] transition-colors">Indices</Link>
                <span className="text-[#3a6070]">Commodities soon</span>
                <span className="text-[#3a6070]">Crypto soon</span>
                <span className="text-[#3a6070]">Stocks soon</span>
              </div>
            </div>
            <button className="bg-[#60c8d4] text-[#080d14] px-4 py-2 rounded hover:bg-[#4da8b3] transition-colors font-medium">
              Subscribe
            </button>
          </div>
        </nav>
        <main className="flex-1 pt-16">
          {children}
        </main>
      </body>
    </html>
  );
}
