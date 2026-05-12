import { sql } from '@neondatabase/serverless';

const connectionString = process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error('NEON_DATABASE_URL is not defined');
}

/**
 * Get a single article by slug
 */
export async function getArticleBySlug(slug) {
  try {
    const result = await sql`
      SELECT * FROM articles 
      WHERE slug = ${slug} AND published = true
      LIMIT 1
    `;
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    return null;
  }
}

/**
 * Get all articles by category
 */
export async function getArticlesByCategory(category, limit = 10) {
  try {
    const result = await sql`
      SELECT * FROM articles 
      WHERE category = ${category} AND published = true
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return [];
  }
}

/**
 * Get recent articles
 */
export async function getRecentArticles(limit = 5) {
  try {
    const result = await sql`
      SELECT * FROM articles 
      WHERE published = true
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    return [];
  }
}

/**
 * Get related articles by ticker or category
 */
export async function getRelatedArticles(ticker, currentSlug, limit = 3) {
  try {
    let result;
    
    if (ticker) {
      result = await sql`
        SELECT * FROM articles 
        WHERE (ticker = ${ticker} OR category = 'signal') 
        AND slug != ${currentSlug}
        AND published = true
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      result = await sql`
        SELECT * FROM articles 
        WHERE slug != ${currentSlug}
        AND published = true
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }
    
    return result.rows;
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}

/**
 * Get all published articles
 */
export async function getAllArticles() {
  try {
    const result = await sql`
      SELECT * FROM articles 
      WHERE published = true
      ORDER BY created_at DESC
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching all articles:', error);
    return [];
  }
}

/**
 * Create a new article
 */
export async function createArticle(data) {
  const {
    slug,
    title,
    excerpt,
    content,
    ticker,
    category,
    rating,
    score,
    adx,
    rsi,
    direction,
    entry_mode,
    tags = [],
    seo_title,
    seo_description,
    published = true,
  } = data;

  try {
    const result = await sql`
      INSERT INTO articles (
        slug, title, excerpt, content, ticker, category, rating,
        score, adx, rsi, direction, entry_mode, tags, seo_title,
        seo_description, published
      ) VALUES (
        ${slug}, ${title}, ${excerpt}, ${content}, ${ticker}, 
        ${category}, ${rating}, ${score}, ${adx}, ${rsi}, 
        ${direction}, ${entry_mode}, ${tags}, ${seo_title},
        ${seo_description}, ${published}
      )
      RETURNING *
    `;
    
    return result.rows[0];
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
}

/**
 * Get articles by tag
 */
export async function getArticlesByTag(tag, limit = 10) {
  try {
    const result = await sql`
      SELECT * FROM articles 
      WHERE ${tag} = ANY(tags) AND published = true
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return result.rows;
  } catch (error) {
    console.error('Error fetching articles by tag:', error);
    return [];
  }
}

/**
 * Get all unique tags
 */
export async function getAllTags() {
  try {
    const result = await sql`
      SELECT DISTINCT UNNEST(tags) as tag 
      FROM articles 
      WHERE published = true
      ORDER BY tag
    `;
    return result.rows.map(row => row.tag);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}

/**
 * Calculate read time in minutes based on word count
 */
export function calculateReadTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  return Math.max(1, readTime);
}

/**
 * Format tags for display
 */
export function formatTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.filter(tag => tag && typeof tag === 'string');
}

/**
 * Parse HTML content and extract H2 headings for TOC
 */
export function extractHeadingsFromHTML(html) {
  const headings = [];
  const headingRegex = /<h2[^>]*>([^<]+)<\/h2>/gi;
  let match;
  
  while ((match = headingRegex.exec(html)) !== null) {
    const heading = match[1].trim();
    const id = heading
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]/g, '');
    
    headings.push({
      text: heading,
      id: id,
    });
  }
  
  return headings;
}
