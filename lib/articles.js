import { neon } from '@neondatabase/serverless';

function getDb() {
  const sql = neon(process.env.NEON_DATABASE_URL);
  return sql;
}

export async function getArticleBySlug(slug) {
  try {
    const sql = getDb();
    const result = await sql`
      SELECT * FROM articles WHERE slug = ${slug} AND published = true LIMIT 1
    `;
    return result[0] || null;
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    return null;
  }
}

export async function getAllArticles() {
  try {
    const sql = getDb();
    const result = await sql`
      SELECT * FROM articles WHERE published = true ORDER BY created_at DESC
    `;
    return result;
  } catch (error) {
    console.error('Error fetching all articles:', error);
    return [];
  }
}

export async function getArticlesByCategory(category, limit = 10) {
  try {
    const sql = getDb();
    const result = await sql`
      SELECT * FROM articles 
      WHERE category = ${category} AND published = true 
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    return result;
  } catch (error) {
    console.error('Error fetching articles by category:', error);
    return [];
  }
}

export async function getRecentArticles(limit = 5) {
  try {
    const sql = getDb();
    const result = await sql`
      SELECT * FROM articles WHERE published = true 
      ORDER BY created_at DESC LIMIT ${limit}
    `;
    return result;
  } catch (error) {
    console.error('Error fetching recent articles:', error);
    return [];
  }
}

export async function getRelatedArticles(ticker, currentSlug, limit = 3) {
  try {
    const sql = getDb();
    const result = await sql`
      SELECT * FROM articles 
      WHERE published = true 
      AND slug != ${currentSlug}
      AND (ticker = ${ticker} OR category = 'education')
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `;
    return result;
  } catch (error) {
    console.error('Error fetching related articles:', error);
    return [];
  }
}
