# MaxTradeFlow v2.1 — Execution Plan

> **For Claude Code.** This file is the execution companion to `MaxTradeFlow_v2.1_Master_Build_Specification.docx` (the authoritative spec). Page mockups live in `docs/mockups/` — **open and view the relevant mockup before building any page.** Work spans two repos: the site (`~/maxtradeflow`, this repo) and the bot (`~/trading-app`). Tasks are tagged `[SITE]` or `[BOT]`.

**Workflow:** plan was done in Claude Chat; this file is for execution. Do not redesign — decisions here are locked. If something is impossible as specified, stop and flag it rather than silently improvising.

---

## 0. Ground Rules (binding for every task)

1. **Surgical changes.** Small, targeted diffs. No drive-by refactors of code unrelated to the task.
2. **Truth over decoration.** Every displayed number must come from real data (bot indicators, `signal_events`, computed stats). No hand-entered statistics, no invented social proof, no placeholder metrics shipped to production.
3. **Immutability.** Signals are never edited or deleted after publication. No `UPDATE` path on the `signals` table except denormalized status. Corrections happen only as `INVALIDATED` events with a reason.
4. **Conservative bias.** Where outcome detection is ambiguous (TP and SL both within one poll interval), record `SL_HIT`. The platform never errs in its own favor.
5. **No silent failures.** Every external call (bot→site, site→bot, third-party) logs failures and surfaces them. Catch blocks that swallow errors are bugs. (Root cause of both the 308-redirect incident and the API-URL bug.)
6. **Design tokens only.** No raw hex values in components. All colors/spacing/type come from the token layer (Task A-1).
7. **Exact URLs + `follow_redirects=True`** on every bot→site HTTP call.
8. **Compliance language.** Never "AI generated", never profit promises. Risk disclaimer component on every surface showing a signal, score, or performance stat.
9. **Mockup fidelity.** Match the mockup, not a memory of it. View the PNG first.

---

## 1. Reference Data

### URLs and infrastructure
- Site: maxtradeflow.com (Vercel) · repo `github.com/mhmugisha/maxtradeflow`
- Bot: Railway — **verify which is live before anything else:** `smart-asset-bot-production.up.railway.app` (in code) vs `smart-asset-bot-production-a8f3.up.railway.app` (reported live). Fix `lib/api.js` accordingly.
- Database: Neon PostgreSQL (site DB holds signals/articles/stats; bot keeps its own state).
- Telegram: @SmartAssetBot_bot.

### Environment variables (create/verify)
- `NEXT_PUBLIC_BOT_API_BASE` — bot base URL (replaces hardcoded constant in `lib/api.js`)
- `SIGNAL_API_TOKEN` — Bearer token for `publish-signal` and `signal-event` (existing pattern)
- `DATABASE_URL` — Neon
- GA4 measurement ID (Phase A)

### Design tokens
- Background `#080d14` · surface `#0f1722` · accent `#60c8d4` · bullish `#1D9E75` · bearish `#e05555` · gold/featured `#f59e0b` · platinum `#d8dbe2`
- Fonts: Sora or Plus Jakarta Sans (headlines) · Inter (body) · IBM Plex Mono (all prices/scores/trading data, tabular numerals)

### Instrument registry
Create `lib/instruments.js` — single source for all 21 instruments: symbol, full name, asset class, decimal formatting (FX 5dp, JPY pairs 3dp, indices 2dp, metals 2dp, crypto 2dp), slug, related instruments. Site components and bot config both derive from this shape. Adding instrument 22 = one-file change.

### Mockup map (`docs/mockups/`)
| Page | Route | Mockup | Phase |
|---|---|---|---|
| Home | / | L1_Home.png | A |
| Markets Hub | /markets | L2_Markets_Hub.png | A |
| Asset Class template | /markets/forex … | L3_Asset_Class.png | A |
| Instrument template | /markets/forex/eurusd … | L4_Instrument.png | A |
| AI Trading hub | /ai-trading | AI_Trading_Hub.png | A |
| Signal article | /ai-trading/[slug] | Signal_Article.png | A |
| Economic Calendar | /markets/economic-calendar | Economic_Calendar.png | A |
| Tools hub | /tools | Tools_Hub.png | B |
| Calculator pages | /tools/position-size … | Calculator_Expanded.png | B |
| Education article | /education/[slug] | Education_Article.png | B |
| News hub | /news | News_Hub.png | C |
| News article | /news/[slug] | News_Article.png | C |

---

## 2. Phase A0 — Data Foundation (no UI work until this is done)

### A0-1 `[SITE]` Fix the API base URL — Day 1
- [ ] Verify which Railway URL serves the live bot (hit `/api/bot/status` on both).
- [ ] Replace the hardcoded constant in `lib/api.js` with `process.env.NEXT_PUBLIC_BOT_API_BASE`.
- [ ] Add error logging to the catch blocks that currently swallow fetch failures.
- [ ] Confirm prices/screener/status render on the live site.

### A0-2 `[SITE]` Instrument registry
- [ ] Create `lib/instruments.js` per Section 1 above; refactor existing pages/`lib/api.js` to consume it. No behavior change, pure consolidation.

### A0-3 `[SITE]` Database schema + migration
New tables (Neon, via migration script with `--dry-run` mode; **backup first**):
- [ ] `signals` — all payload-v2 fields (see §6 contract), `signal_uid` unique, immutable.
- [ ] `signal_events` — append-only: `signal_uid`, `event_type`, `price`, `occurred_at`; unique on (`signal_uid`,`event_type`).
- [ ] `price_snapshots` — `instrument`, `ts`, `open`, `high`, `low`, `close` (1h bars).
- [ ] `instrument_stats`, `platform_stats` — rolling last-30-closed aggregates: win_rate, avg_realized_rr, avg_hold_minutes, net_r, sample_size, computed_at.
- [ ] `market_pulse` — latest computed values + formulas version.
- [ ] `articles` gains `signal_uid` FK. Migration extracts signal fields from existing signal-category articles into `signals` rows (status backfilled as EXPIRED/INVALIDATED per existing `is_valid` data; outcomes unknown for historical rows — leave outcome NULL, never fabricate).

### A0-4 `[BOT]` Signal payload v2
- [ ] Compute and publish: `schema_version=2`, `signal_uid` (UUID), `asset_class`, `tradeflow_score` (0–100, weights: trend 25 / ADX momentum 20 / RSI 15 / structure 15 / session 15 / volatility 10; stamp `tfs_version`), `confidence` (factor-agreement composite — must not equal tradeflow_score by construction), `reasons[]` ({code,label} from: TREND_ALIGNED, EMA_STACK, ADX_THRESHOLD, RSI_FAVORABLE, LIQUIDITY_SWEEP, SESSION_MOMENTUM, STRUCTURE_ENTRY, VOLATILITY_OK), `market_condition` (trending/ranging/volatile/quiet), `session`, `expected_duration`, `generated_at`.
- [ ] `[SITE]` `publish-signal` route: accept v2, reject missing `schema_version` with 400, idempotent on `signal_uid`, write to `signals` table (articles keep getting created as today, now with FK).
- [ ] Publication gate alignment: bot publishes only `tradeflow_score ≥ 70` (v2 equivalent of legacy score ≥ 8). The displayed Score Guide must match this gate.

### A0-5 `[BOT]` Outcome tracking engine
- [ ] On each price poll, for every open signal: entry touch → `TRIGGERED`; for active signals, TP/SL touch → `TP_HIT`/`SL_HIT` (first touch; ambiguity → `SL_HIT`). Never-triggered after 7 days → `EXPIRED`. Existing invalidation logic emits `INVALIDATED` + reason.
- [ ] POST each event to `[SITE]` `/api/signal-event` (Bearer auth, idempotent, `follow_redirects=True`, exact URL). Payload: `signal_uid`, `event_type`, `price`, `occurred_at`.
- [ ] `[SITE]` stats job (cron or on-write): recompute `instrument_stats`/`platform_stats` over last 30 closed. Net result in R: TP = +rr_ratio, SL = −1.

### A0-6 `[BOT]` Price history + Market Pulse
- [ ] Persist 1h OHLC bars per instrument to `price_snapshots` from the existing poll loop.
- [ ] Compute pulse on each scan: dollar strength (synthetic from USD pairs, EUR/GBP/AUD inverted), gold sentiment (XAUUSD EMA/ADX state), volatility regime (avg ATR percentile → Low/Med/High), risk environment (indices + gold + volatility composite), active signal count. Push to `market_pulse`.

### A0-7 `[SITE]` Caching proxy (ship before redesign — immediate benefit)
- [ ] Route handlers `/api/live/prices`, `/api/live/screener`, `/api/live/pulse` proxying the bot with `s-maxage=5, stale-while-revalidate=60`.
- [ ] Switch existing pages to poll the proxy, never Railway directly.

### A0 acceptance
Every new signal carries v2 fields · a test signal's full lifecycle records automatically (verify one TP and one SL detection against the chart) · stats compute correctly · ≥7 days of OHLC accumulated · live site running on the proxy · **reality gate:** record the live last-30 win rate; if materially below 60%, stop and improve the bot before Phase A UI.
---

## 3. Phase A — Core Pages

Build order is deliberate: shared shell → hub → one L3 → five L4s → home → content surfaces. Each step validates the templates the next one reuses.

### A-1 `[SITE]` Design system + global components
- [ ] Token layer (CSS custom properties + Tailwind config) for the §1 palette/typography. Migrate off inline style objects as components are touched.
- [ ] Global components: Nav (Markets · Education · Tools · AI Trading · News · Pro Trader Workspace button — renders "Sign in" until Phase B), persistent sidebar shell, price ticker (**isolated client component** — previous layout.js attempts broke client-state components twice; it must not re-render page state), `RiskDisclaimer`, `LastUpdated` + degraded-state primitives ("Live data delayed" pill at >60s staleness; keep last values, never blank; "reconnecting" at >5min).
- [ ] Session bar with **real session hours per market center** (current code applies one 9–17 rule to all four — fix).

### A-2 `[SITE]` Pages (server-rendered, ISR revalidate 60s, on-demand revalidate on publish-signal/signal-event)
- [ ] `/markets` per **L2_Markets_Hub.png** — opportunity map, Gold spotlight (amber #f59e0b40 border, links to /markets/commodities/xauusd), class cards, sessions, active signals strip.
- [ ] `/markets/forex` per **L3_Asset_Class.png** — validates the L3 template (8 cards, % change + sparklines from `price_snapshots`, filters *below* the grid, Market DNA radar, class signals, class events).
- [ ] L4 per **L4_Instrument.png** for EURUSD, GBPUSD, XAUUSD, NAS100, US500 — TradeFlow Score hero, three cards, chart with SL/TP lines, active signal box, analysis excerpt + "Read full analysis →", Why This Signal Exists from `reasons[]`, Signal Journey from `signal_events`, Signal History (last 5+, wins AND losses), stats block labeled "last 30 signals".
- [ ] `/` per **L1_Home.png** — Market Pulse bar, hero + calendar card, Opportunity Board (4 cards), Live Activity Feed from `signal_events` (SL hits shown identically to TP hits), markets preview, trust strip (renders only when `platform_stats.sample_size ≥ 30`), ticker.
- [ ] `/ai-trading` per **AI_Trading_Hub.png** — status strip, 5 stat cards, filter chips, signal table with outcome badges, How It Works panel, Score Guide (90–100 Exceptional / 80–89 Strong / 70–79 Moderate / below 70 not published).
- [ ] `/ai-trading/[slug]` per **Signal_Article.png** — the canonical immutable signal page: hero strip, data grid, chart-at-signal, Why generated, Signal Journey, ANALYSIS, sidebar. Outcome badge appears on close; page otherwise never changes.
- [ ] `/markets/economic-calendar` per **Economic_Calendar.png** — next-event strip, impact/currency filters, day tabs, affected-instrument tags linking to L4s.
- [ ] `/signals` — public immutable archive, all signals ever, outcome badges, nothing curated out.

### A-3 `[SITE]` Migration, SEO, compliance, analytics
- [ ] Full 301 map in `next.config.mjs` (see §7) — same release as new routes.
- [ ] Per-instrument metadata templates, OpenGraph/Twitter cards, `sitemap.xml` (new URLs only), canonicals.
- [ ] JSON-LD: Article on signal/analysis pages, BreadcrumbList on L2–L4.
- [ ] Internal linking: every L4 → its L3, hub, 4 related instruments, its articles; every article → its L4.
- [ ] `/risk-disclosure` page; `RiskDisclaimer` on every signal/score/stat surface; footer link site-wide.
- [ ] GA4 + custom events: signal_view, instrument_view, article_read, calculator_use, archive_view, alert_signup, workspace_signup, subscribe_click, checkout_start, checkout_complete.
- [ ] Mobile per spec §22: sidebar → drawer, card carousels with snap, stacked L4, ticker retained, tap targets ≥44px. **Budget: L4 mobile LCP < 2.5s on 4G.**

### A-4 Research gate (no code)
- [ ] Payment provider evaluation from Uganda: Paddle / Lemon Squeezy (merchant-of-record) → Flutterwave → Stripe-via-entity. Output: a decision doc. Blocks Phase B payments.
- [ ] AdSense reapplication once Phase A is live with the compliance layer.

### Phase A acceptance
Search Console: new pages indexed, all old URLs 301 clean · one signal traceable end-to-end on an L4 and its signal article · no console errors · LCP budget met · disclaimers render on every signal surface.

---

## 4. Phase B — Expand and Monetize (after A indexing confirmed)

1. Remaining L4 pages for all 21 instruments.
2. Tools hub re-skin per **Tools_Hub.png**; standalone calculator pages per **Calculator_Expanded.png** (formula-transparency "How this is calculated" block with the user's numbers; risk-% chips; cross-links). Education article template per **Education_Article.png** (Key Takeaways, See This In Action live-signal embed, series progress, calculator links).
3. Accounts: NextAuth (email + Google), `/workspace` (watchlist, active signals on watched instruments, relevant events, recent activity).
4. Alerts: per-user prefs (instruments, min score, event types) → Resend email + Telegram (linking flow: one-time code in /workspace → user sends to @SmartAssetBot_bot → store chat-id) → PWA push later.
5. `/performance` — automated monthly reports from the outcome engine, worst calls included by name.
6. Payments + Premium tier — **only after** provider gate closed AND ≥60–90 days public track record. Free tier stays genuinely valuable. Ads (if AdSense approved): education/news surfaces only, never signal areas or checkout.

## 5. Phase C — Intelligence and Scale

News hub + article per **News_Hub.png** / **News_Article.png** (requires news data source; active-signal callout in articles is mandatory) · third-party market data (heatmaps, top movers) only if traffic justifies cost · per-instrument performance charts · AI Copilot (grounded exclusively in platform data; refuses outside it; caps: Premium 20/day, Elite 100/day; monthly spend ceiling in code; disclaimer on every answer) · Elite tier · third-party track-record verification (Myfxbook/FXBlue-class link to the executing cTrader account).

---

## 6. Data Contracts

### POST /api/publish-signal (v2)
```json
{
  "schema_version": 2,
  "signal_uid": "uuid",
  "ticker": "EURUSD",
  "asset_class": "forex",
  "direction": "LONG",
  "entry_price": 1.0876,
  "stop_loss": 1.0820,
  "take_profit": 1.0980,
  "rr_ratio": 2.5,
  "score": 9,
  "tradeflow_score": 90,
  "tfs_version": 1,
  "confidence": 86,
  "adx": 31.2,
  "rsi": 58.4,
  "entry_mode": "STANDARD",
  "sl_reason": "below structural low",
  "reasons": [{"code": "ADX_THRESHOLD", "label": "ADX 31.2 confirms strong directional momentum"}],
  "market_condition": "trending",
  "session": "overlap",
  "expected_duration": "4-12h",
  "generated_at": "2026-06-11T02:14:00Z"
}
```
Rules: 400 on missing `schema_version` · idempotent on `signal_uid` · Bearer auth.

### POST /api/signal-event
```json
{ "signal_uid": "uuid", "event_type": "TP_HIT", "price": 1.0980, "occurred_at": "2026-06-11T09:40:00Z" }
```
`event_type` ∈ GENERATED · TRIGGERED · TP_HIT · SL_HIT · EXPIRED · INVALIDATED (+`reason`). Idempotent on (`signal_uid`,`event_type`) · Bearer auth.

### Lifecycle
GENERATED → TRIGGERED → ACTIVE → TP_HIT | SL_HIT. Untriggered 7 days → EXPIRED. Withdrawn → INVALIDATED. Append-only; closed never changes.

---

## 7. 301 Redirect Map (next.config.mjs, permanent)

| From | To |
|---|---|
| /forex, /forex/:symbol | /markets/forex, /markets/forex/:symbol |
| /indices, /indices/:symbol | /markets/indices, /markets/indices/:symbol |
| /commodities, /commodities/:symbol | /markets/commodities, /markets/commodities/:symbol |
| /crypto, /crypto/:symbol | /markets/crypto, /markets/crypto/:symbol |
| /stocks, /stocks/:symbol | /markets/stocks, /markets/stocks/:symbol |
| /articles, /articles/:slug | /ai-trading, /ai-trading/:slug |
| /analysis/:slug | /ai-trading/:slug |
| /economic-calendar | /markets/economic-calendar |

---

## 8. Definition of Done (every PR)

- Matches the mockup (viewed, not recalled).
- Tokens only; no raw hex.
- Server-rendered where specified; live elements show `LastUpdated`; degraded states implemented.
- Disclaimers present where required; no banned language.
- All displayed numbers traceable to a table or computation — name the source in the PR description.
- No swallowed errors; new external calls log failures.
- Mobile behavior verified at 380px.

**Quality bar:** a platform a trader opens every morning — premium enough to justify a subscription, honest enough to survive an external audit of every number it displays. When design and truth conflict, truth wins.
