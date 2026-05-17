import Link from 'next/link';
import TradingViewCalendar from '../../components/TradingViewCalendar';
import { getArticlesByTag } from '../../lib/articles';

export const metadata = {
  title: 'Economic Calendar | High-Impact Events for Traders | MaxTradeFlow',
  description: 'Free economic calendar for forex, indices, gold, and crypto traders. Track CPI, NFP, FOMC, GDP, PMI and other high-impact events across major economies.',
};

export default async function EconomicCalendarPage() {
  // Pull all event explainers so we can list them below the calendar
  const explainers = await getArticlesByTag('event-explainer', '', 10);

  return (
    <div style={{ background: '#080d14', minHeight: '100vh', color: '#e2e8f0' }}>

      {/* Hero */}
      <div style={{
        background: 'linear-gradient(180deg, #0d1520 0%, #080d14 100%)',
        borderBottom: '1px solid #1a2535',
        padding: '48px 0 40px',
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}>
          <div style={{ fontSize: '13px', color: '#60c8d4', marginBottom: '12px', fontFamily: 'monospace', letterSpacing: '2px', textTransform: 'uppercase' }}>
            Free Tool
          </div>
          <h1 style={{
            fontSize: 'clamp(28px, 4vw, 48px)',
            fontWeight: '700',
            color: '#f1f5f9',
            margin: '0 0 12px',
            lineHeight: '1.15',
          }}>
            Economic Calendar
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '16px', maxWidth: '640px', margin: 0, lineHeight: '1.6' }}>
            High-impact economic events that move forex, indices, gold, and crypto. Filtered for major economies — US, EU, UK, Japan, Switzerland, Australia, Canada, New Zealand, and China.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 24px' }}>

        {/* Calendar widget */}
        <TradingViewCalendar height={600} />

        {/* Learn the events section */}
        <div style={{ marginTop: '48px' }}>
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '11px', color: '#60c8d4', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '4px' }}>Learn The Events</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: '#f1f5f9', margin: 0 }}>Understand What Moves Markets</h2>
            <p style={{ color: '#94a3b8', fontSize: '14px', marginTop: '8px', maxWidth: '640px' }}>
              Each major economic release has its own playbook. Read the explainers to understand what each event measures, how the market reacts, and what to look for as a trader.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
            {explainers.length > 0 ? explainers.map(art => (
              <Link key={art.slug} href={'/education/' + art.slug} style={{ textDecoration: 'none' }}>
                <div style={{
                  background: '#0d1520',
                  border: '1px solid #1a2535',
                  borderRadius: '10px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                  height: '100%',
                }}>
                  <div style={{ fontSize: '11px', color: '#60c8d4', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Event Explainer
                  </div>
                  <h3 style={{ fontSize: '15px', color: '#f1f5f9', fontWeight: '600', margin: '0 0 8px', lineHeight: '1.4' }}>
                    {art.title}
                  </h3>
                  <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.5', margin: '0 0 12px' }}>
                    {art.excerpt}
                  </p>
                  <div style={{ fontSize: '12px', color: '#60c8d4', fontWeight: '500' }}>
                    Read article →
                  </div>
                </div>
              </Link>
            )) : (
              <div style={{ gridColumn: '1/-1', color: '#64748b', fontSize: '14px', padding: '20px 0' }}>
                Event explainers coming soon.
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <div style={{
          marginTop: '48px',
          padding: '32px',
          background: 'linear-gradient(180deg, #0d1520 0%, #080d14 100%)',
          border: '1px solid #1a2535',
          borderRadius: '12px',
          textAlign: 'center',
        }}>
          <h3 style={{ fontSize: '18px', color: '#f1f5f9', fontWeight: '600', margin: '0 0 8px' }}>Want to learn more?</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: '0 0 16px' }}>
            Browse our full education library for trading strategies, market analysis, and risk management.
          </p>
          <Link href="/education" style={{
            display: 'inline-block',
            background: '#60c8d4',
            color: '#080d14',
            padding: '10px 24px',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '14px',
            textDecoration: 'none',
          }}>
            Browse Education
          </Link>
        </div>

      </div>
    </div>
  );
}
