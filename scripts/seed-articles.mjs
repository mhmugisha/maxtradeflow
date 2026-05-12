import Anthropic from '@anthropic-ai/sdk';
import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const sql = neon(process.env.NEON_DATABASE_URL);

const articles = [
  { title: "What is ADX and Why It Matters for Trading", slug: "what-is-adx-trading", category: "education", tags: ["ADX", "indicators", "trend"] },
  { title: "How to Read RSI Correctly", slug: "how-to-read-rsi", category: "education", tags: ["RSI", "momentum", "indicators"] },
  { title: "EMA Crossover Strategies Explained", slug: "ema-crossover-strategies", category: "education", tags: ["EMA", "moving averages", "strategy"] },
  { title: "London vs New York Session — Which is Better for Trading?", slug: "london-vs-new-york-session", category: "education", tags: ["sessions", "forex", "timing"] },
  { title: "What is a Liquidity Sweep?", slug: "what-is-liquidity-sweep", category: "education", tags: ["liquidity", "smart money", "price action"] },
  { title: "Risk Management — The 1% Rule", slug: "risk-management-1-percent-rule", category: "education", tags: ["risk management", "position sizing", "trading psychology"] },
  { title: "How to Set a Stop Loss Properly", slug: "how-to-set-stop-loss", category: "education", tags: ["stop loss", "risk management", "structure"] },
  { title: "Reading Multi-Timeframe Analysis", slug: "multi-timeframe-analysis", category: "education", tags: ["timeframes", "analysis", "confluence"] },
  { title: "What is a Signal Score?", slug: "what-is-signal-score", category: "guide", tags: ["signal score", "MaxTradeFlow", "how it works"] },
  { title: "Forex vs Indices — Which Should You Trade?", slug: "forex-vs-indices", category: "education", tags: ["forex", "indices", "asset classes"] },
];

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function extractText(content) {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content)) {
    return content[0]?.text ?? '';
  }
  return '';
}

async function seedArticles() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY in .env.local');
  }
  if (!process.env.NEON_DATABASE_URL) {
    throw new Error('Missing NEON_DATABASE_URL in .env.local');
  }

  for (const article of articles) {
    console.log(`Generating content for: ${article.title}`);

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `Write a comprehensive trading education article titled "${article.title}".

Requirements:
- 500-700 words
- Written for beginner to intermediate traders
- Practical and actionable advice
- Include real examples where relevant
- For "What is a Signal Score?" article, reference MaxTradeFlow's scoring system: 5 factors (trend alignment 2pts, ADX 3pts, RSI 2pts, EMA 2pts, price confirmation 1pt), trade triggers at 8/10
- Format as clean HTML with <h2> subheadings, <p> paragraphs
- No markdown, only HTML tags
- Do not include <html>, <head>, <body> tags
- Tone: professional but accessible`,
        },
      ],
    });

    const content = extractText(response.content);
    if (!content) {
      throw new Error(`No content returned for article: ${article.title}`);
    }

    const plainText = content.replace(/<[^>]*>/g, '');
    const wordCount = plainText.split(/\s+/).filter(Boolean).length;
    const readTime = Math.ceil(wordCount / 200);
    const excerpt = `${plainText.substring(0, 200)}...`;
    const seoTitle = `${article.title} | MaxTradeFlow`;
    const seoDescription = plainText.substring(0, 160);

    await sql`
      INSERT INTO articles (slug, title, excerpt, content, category, tags, seo_title, seo_description, published)
      VALUES (
        ${article.slug},
        ${article.title},
        ${excerpt},
        ${content},
        ${article.category},
        ${article.tags},
        ${seoTitle},
        ${seoDescription},
        true
      )
      ON CONFLICT (slug) DO UPDATE SET
        content = EXCLUDED.content,
        updated_at = NOW();
    `;

    console.log(`✅ Created: ${article.title} (${wordCount} words, ${readTime} min read)`);
    await delay(2000);
  }
}

seedArticles()
  .then(() => {
    console.log('Seeding complete.');
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
