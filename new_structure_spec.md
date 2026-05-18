# MaxTradeFlow Site Restructure — Specification v2.0 (Lean)

**Approved:** May 18, 2026
**Status:** Planned, not yet started
**Estimated effort:** ~25–30 hours focused work (4–5 productive days)
**Approach:** Lean skeleton first. Data-heavy features deferred until traffic justifies them.

---

## Why v2.0 — what changed from v1.0

v1.0 captured the full mockup vision: 4-level hierarchy with market heatmaps, top movers, sentiment cards, economic calendar widgets, correlation tools, multi-timeframe charts. Total estimated effort: 4–6 weeks + $50–200/month in market data API costs.

v2.0 strips the data infrastructure and ships only:
- The URL hierarchy itself (the SEO architecture benefit)
- Real L4 instrument pages using existing bot data
- Free TradingView chart widgets (no data API cost)
- AI-generated analysis text via Claude API (low cost)

The fancy widgets (heatmaps, etc.) remain a long-term vision but are NOT built in this phase. They're added later only if traffic + AdSense revenue justify them.

This is the patient version: build the skeleton, measure traffic, then decide whether to invest in data widgets.

---

## Branding

Brand name remains **MaxTradeFlow** throughout. The "TradeEdge" placeholder in the mockup was a tool artifact — never appears in implementation.

---

## Navigation

**5-item global nav** (simplified from current 7+):

| Item | Purpose |
|------|---------|
| Markets | Asset class hub — gateway to L2/L3/L4 |
| Education | SEO articles for beginner traders, links to calculators |
| Tools | Trading calculators (already exists, just under /tools) |
| AI Trading | Bot signals, performance, active signals feed |
| News | Market-moving news (deferred — see below) |

**Removed:** Dashboard (no user accounts yet), Pricing (no paid tier yet).

**Renamed:** "AI Signals" → "AI Trading" — stronger brand position.

**Deferred:** News page may launch with a simple curated feed or just point to external sources initially. News widget/API integration is NOT part of the lean phase.

---

## 4-Level Architecture (Lean)

### Level 1 — Home (`/`)

**Lean approach:** Keep current homepage mostly as-is. Update nav to point to new `/markets` URL. Maybe add a "Markets" entry to the existing nav. No major homepage redesign in this phase.

### Level 2 — Markets (`/markets`)

**Lean approach:** Simple landing page.
- "Markets" heading
- Brief intro paragraph
- Grid of asset class cards (Forex / Indices / Commodities / Crypto / Stocks) linking to L3 pages
- Active AI Signals strip at the bottom (reuses existing bot data)

**Not in lean phase:** Market heatmap, top movers, correlations, economic calendar widget.

### Level 3 — Asset Class (`/markets/forex`, `/markets/indices`, etc.)

**Lean approach:** Simple landing page per asset class.
- Asset class heading + brief intro
- Grid of instrument cards (each linking to L4 page)
- Recent signals filtered to this asset class

**Not in lean phase:** Asset-class heatmap, stat cards (Total Pairs, 24h Volume, etc.), session times widget, currency strength meter (currency strength meter remains a planned /tools page, just not embedded here).

### Level 4 — Instrument (`/markets/forex/eurusd`)

**This is the value page. Real content.**

- Breadcrumb: Markets › Forex › EURUSD
- Header: instrument name + current price + % change (from bot API) + Market Open/Closed status
- TradingView chart widget embedded (free tier, accept TradingView branding)
- Current AI Signal card (if signal exists for this instrument) — Entry/SL/TP/R:R/Score/ADX/RSI from bot
- Recent signal history for this instrument (last 5-10)
- AI-generated commentary section (Claude API call, fed the bot data, generates a paragraph of analysis text)
- Related instruments (other pairs in the same category)

**Not in lean phase:** Custom multi-timeframe chart with indicators (use TradingView widget instead), Performance/Technical/Fundamental/Sentiment cards (require external data feeds), Quick Stats panel (Day Range, 52W Range, Spread, etc. — require data feed).

---

## URL Pattern

**Short-form canonical:** `/markets/forex/eurusd`

The "Major Pairs" / "Minor Pairs" categorization is a UI element (sidebar, breadcrumb) but NOT a URL segment.

**Asset class slugs:** forex, indices, commodities, crypto, stocks

**Instrument slugs:** lowercased, no separator (eurusd, btcusd, nas100, xauusd, us500, etc.)

---

## Data Sources (Lean)

**Bot-provided (already have):**
- AI signals (per instrument, with entry/SL/TP/R:R/ADX/RSI/score)
- Signal history
- Current prices for instruments the bot trades

**TradingView free widgets (no cost):**
- Charts on L4 instrument pages
- Tradeoff: TradingView's branding on the widget, but they're high-quality and traders trust them

**Claude API (low cost):**
- AI-generated commentary on L4 pages (fed bot data, generates short analysis paragraphs)

**NOT in lean phase:**
- Third-party market data API (deferred until traffic justifies $50–200/month cost)
- News API or widget
- Economic calendar data
- Heatmap data

---

## AI Trading Hub Structure

`/ai-trading` contains:
- All active signals (using is_valid filter shipped May 18, 2026)
- Recent signal history (chronological, last N invalidated)
- Bot performance stats (vague — no scoring threshold exposure)
- "How the bot works" overview page

`/ai-trading/[signal-slug]` — individual signal detail page (replaces current `/articles/[slug]`)

Per-instrument signals also appear on L4 right rail as "AI Signal" card showing current valid signal for that instrument if one exists.

---

## Build Order

### Phase A — Skeleton + first 3-5 instrument pages (3-5 days)

Build:
1. `/markets` — simple asset class listing
2. `/markets/forex`, `/markets/indices`, `/markets/commodities`, `/markets/crypto`, `/markets/stocks` — simple instrument listings (one template, parameterized)
3. `/markets/forex/eurusd`, `/markets/forex/gbpusd`, `/markets/forex/xauusd` — full L4 instrument pages (start with 3 to validate the template)
4. URL migration: 301 redirects from `/articles/[slug]` (signal articles) to `/ai-trading/[slug]`

That's it for Phase A. Hierarchy exists, three instruments have rich pages, redirects preserve SEO authority.

### Phase B — Expand instrument coverage (3-5 days, conditional)

Only after Phase A ships and Google indexes the pages:
- Add 5-10 more L4 instrument pages (BTCUSD, NAS100, US30, EURJPY, GBPJPY, USDJPY, etc.)
- Build the AI Trading hub `/ai-trading` chronological feed
- Build remaining Education and Tools section homepages

### Phase C — Data widgets (deferred, optional)

Only if Phases A and B show measurable traffic AND AdSense revenue can cover data feed costs:
- Market data API integration (TwelveData or similar)
- Heatmaps on L2/L3
- Top movers on L2
- Economic calendar widget on L2
- Sentiment cards on L4
- Quick Stats panel on L4

This phase may never happen if the lean version is sufficient. That's fine.

### Phase D — News (deferred indefinitely)

News integration requires a credible source. Defer until either:
- Free RSS aggregation is built, OR
- Revenue justifies a news API
- OR remove from nav entirely if News doesn't serve users

---

## URL Migration / Redirects

Critical for preserving SEO authority on existing signal articles:

| Old | New |
|-----|-----|
| `/articles/[slug]` (signal articles) | `/ai-trading/[slug]` |
| `/articles/[slug]` (education articles) | `/education/[slug]` |
| Direct old homepage anchor links | Redirect to relevant L1/L2 page |

301 redirects (permanent) for all migrations. Track bookmarked URLs that may exist in user clipboards. Test redirects after deploy.

---

## Empty Page Risk

The biggest restructure failure mode: empty Level 4 pages.

Lean approach mitigates this by **only building L4 pages for instruments the bot actively trades and has signal history for.** If the bot only generates signals for ~15 instruments, only build L4 pages for those 15. Don't generate URLs for instruments without content.

If the bot adds a new instrument later, the L4 page can be added then. The L3 listing pages dynamically list whatever instruments have pages.

---

## Long-term vision (preserved from v1.0)

The full mockup (v1.0 in this spec history) remains the long-term vision for what MaxTradeFlow could become:
- Market heatmaps showing % change across many instruments
- Top movers (gainers/losers/most active) panels
- Economic calendar widget on every page
- Correlation tools
- Sentiment cards using third-party sentiment data
- Multi-timeframe charts with custom indicators
- Per-instrument Quick Stats (Day Range, 52W Range, Spread, Session)
- News integration

These are NOT abandoned. They're deferred until:
1. The lean skeleton (Phase A) ships and Google indexes the new URLs
2. Traffic data proves the architecture is working
3. AdSense revenue + broker affiliate revenue can cover data infrastructure costs ($50–200/month)
4. There's clear user demand signaled through bounce rates, session duration, or direct feedback

The mockup is a north star, not a build plan. v2.0 (lean) is the build plan.

---

## Pre-Build Decisions Needed

Before Phase A starts:
1. **First 5 instruments for L4** — likely EURUSD, GBPUSD, XAUUSD, BTCUSD, NAS100 (highest interest, bot already trades them)
2. **TradingView widget config** — choose chart type, theme, default timeframe
3. **AI commentary prompt** — design the Claude API prompt that takes bot signal data and outputs a short analysis paragraph
4. **Branch strategy** — feature/restructure long-running branch with Vercel previews, OR main-line incremental commits

---

## Reference

Mockup: New_Structure.PNG (4 views — L1, L2, L3, L4)
Original spec: v1.0 (full vision), this is v2.0 (lean build plan)
Discussed and approved: May 18, 2026
Implementation timing: After current MaxTradeFlow polish work (signal invalidation Phase 4, AdSense settle period)
