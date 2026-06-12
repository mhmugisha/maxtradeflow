// components/v2/JsonLd.js — JSON-LD structured-data helpers (Task 5b).
// Shipped now while /v2 is still noindex; harmless pre-cutover, ready after.
// NOTE: URLs are built from current /v2/* paths — the cutover session strips
// the /v2 prefix when links move to their final paths.

export const SITE_URL = 'https://maxtradeflow.com';

export function JsonLd({ data }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'MaxTradeFlow',
        url: SITE_URL,
        description:
          'AI-powered market signals and analysis from Smart Asset Bot. Signals are informational, not financial advice.',
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }) {
  const withHrefs = items.filter((i) => i.href || i === items[items.length - 1]);
  if (withHrefs.length < 2) return null;
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.label,
          ...(item.href ? { item: `${SITE_URL}${item.href}` } : {}),
        })),
      }}
    />
  );
}

export function ArticleJsonLd({ signal, path }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: `${signal.ticker} ${signal.direction} — Smart Asset Bot Signal`,
        datePublished: signal.generated_at,
        author: { '@type': 'Organization', name: 'MaxTradeFlow — Smart Asset Bot' },
        publisher: { '@type': 'Organization', name: 'MaxTradeFlow', url: SITE_URL },
        mainEntityOfPage: `${SITE_URL}${path}`,
      }}
    />
  );
}
