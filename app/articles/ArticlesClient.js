"use client";

import Link from 'next/link';

const PAGE_SIZE = 12;

function getSignalAge(createdAt) {
  const now = new Date();
  const created = new Date(createdAt);
  const diffMs = now - created;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  if (diffMins < 1) return { label: 'Just now', color: '#1D9E75' };
  if (diffMins < 30) return { label: `${diffMins}m ago`, color: '#1D9E75' };
  if (diffMins < 120) return { label: `${diffMins}m ago`, color: '#EF9F27' };
  if (diffHours < 24) return { label: `${diffHours}h ago`, color: '#e05555' };
  return { label: `${Math.floor(diffHours / 24)}d ago`, color: '#475569' };
}

export default function ArticlesClient({ articles, total, page, totalPages }) {
  return (
    <div style={{ minHeight: '100vh', background: '#080d14' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(180deg, #0d1f2d 0%, #080d14 100%)', borderBottom: '1px solid #1a2535', padding: '32px 24px' }}>
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
          <div style={{ fontSize: '11px', color: '#475569', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1.5px' }}>Smart Asset Bot</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#f1f5f9', margin: '0 0 4px' }}>Market Signals</h1>
              <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>AI-generated analysis for every signal fired by Smart Asset Bot</p>
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {[
                { label: 'Total Signals', value: total.toString(), color: '#60c8d4' },
                { label: 'This Page', value: articles.length.toString(), color: '#f1f5f9' },
              ].map(card => (
                <div key={card.label} style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '8px', padding: '10px 16px', textAlign: 'center', minWidth: '80px' }}>
                  <div style={{ fontSize: '10px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{card.label}</div>
                  <div style={{ fontSize: '20px', fontWeight: '700', color: card.color }}>{card.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '32px 24px' }}>
        {articles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#475569' }}>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>No signals published yet.</p>
            <p style={{ fontSize: '13px' }}>Articles are auto-generated when the bot fires a signal.</p>
          </div>
        ) : (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', marginBottom: '32px' }}>
              {articles.map(article => {
                const ratingColor = article.rating === 'TRADE' ? '#1D9E75' : article.rating === 'WATCH' ? '#EF9F27' : '#e05555';
                const ratingBg = article.rating === 'TRADE' ? '#1D9E7520' : article.rating === 'WATCH' ? '#EF9F2720' : '#e0555520';
                const ratingBorder = article.rating === 'TRADE' ? '#1D9E7540' : article.rating === 'WATCH' ? '#EF9F2740' : '#e0555540';
                const age = getSignalAge(article.created_at);
                const isIndex = ['US500', 'NAS100', 'US30'].includes(article.ticker);
                const isCrypto = ['BTCUSD', 'ETHUSD', 'XRPUSD', 'SOLUSD', 'BNBUSD', 'ADAUSD'].includes(article.ticker);
                const isJPY = article.ticker?.includes('JPY');
                const decimals = isIndex ? 2 : isCrypto ? 2 : isJPY ? 3 : 5;

                return (
                  <Link key={article.slug} href={'/articles/' + article.slug} style={{ textDecoration: 'none' }}>
                    <div style={{ background: '#0d1520', border: '1px solid #1a2535', borderRadius: '10px', padding: '18px', cursor: 'pointer', height: '100%', boxSizing: 'border-box' }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#60c8d4'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#1a2535'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#60c8d4' }}>{article.ticker}</span>
                        <span style={{ padding: '3px 10px', background: ratingBg, border: `1px solid ${ratingBorder}`, borderRadius: '4px', fontSize: '10px', color: ratingColor, fontWeight: '700' }}>{article.rating}</span>
                      </div>

                      <h3 style={{ fontSize: '13px', color: '#f1f5f9', fontWeight: '500', marginBottom: '10px', lineHeight: '1.4' }}>{article.title}</h3>

                      {article.entry_price && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '4px', marginBottom: '10px' }}>
                          {[
                            { label: 'Entry', value: parseFloat(article.entry_price).toFixed(decimals), color: '#60c8d4' },
                            { label: 'SL', value: parseFloat(article.stop_loss).toFixed(decimals), color: '#e05555' },
                            { label: 'TP', value: parseFloat(article.take_profit).toFixed(decimals), color: '#1D9E75' },
                            { label: 'R:R', value: `1:${parseFloat(article.rr_ratio).toFixed(1)}`, color: '#f1f5f9' },
                          ].map(item => (
                            <div key={item.label} style={{ background: '#060b11', borderRadius: '4px', padding: '4px 6px', textAlign: 'center' }}>
                              <div style={{ fontSize: '9px', color: '#475569', marginBottom: '2px' }}>{item.label}</div>
                              <div style={{ fontSize: '10px', fontWeight: '600', color: item.color, fontFamily: 'monospace' }}>{item.value}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                        <span style={{ color: age.color }}>{age.label}</span>
                        <span style={{ color: '#64748b' }}>{article.score}/10</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0', borderTop: '1px solid #1a2535' }}>
                <div style={{ fontSize: '13px', color: '#475569' }}>
                  Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, total)} of {total} signals
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {page > 1 && (
                    <Link href={`/articles?page=${page - 1}`} style={{ textDecoration: 'none' }}>
                      <span style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '13px', color: '#60c8d4', border: '1px solid #1a2535', cursor: 'pointer' }}>← Prev</span>
                    </Link>
                  )}
                  {Array.from({ length: totalPages }, (_, i) => (
                    <Link key={i} href={`/articles?page=${i + 1}`} style={{ textDecoration: 'none' }}>
                      <span style={{
                        padding: '6px 12px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
                        background: page === i + 1 ? '#60c8d4' : 'transparent',
                        color: page === i + 1 ? '#080d14' : '#64748b',
                        border: page === i + 1 ? 'none' : '1px solid #1a2535',
                        fontWeight: page === i + 1 ? '600' : '400',
                      }}>{i + 1}</span>
                    </Link>
                  ))}
                  {page < totalPages && (
                    <Link href={`/articles?page=${page + 1}`} style={{ textDecoration: 'none' }}>
                      <span style={{ padding: '6px 14px', borderRadius: '6px', fontSize: '13px', color: '#60c8d4', border: '1px solid #1a2535', cursor: 'pointer' }}>Next →</span>
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}