// app/api/articles/route.js
import { NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';

export const revalidate = 0;

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '10');

    const sql = neon(process.env.NEON_DATABASE_URL);

    let articles;
    if (category) {
      articles = await sql`
        SELECT id, slug, title, ticker, category, rating, score, excerpt, created_at
        FROM articles
        WHERE published = true AND category = ${category}
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    } else {
      articles = await sql`
        SELECT id, slug, title, ticker, category, rating, score, excerpt, created_at
        FROM articles
        WHERE published = true
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
    }

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('Error fetching articles:', error);
    return NextResponse.json({ articles: [], error: error.message }, { status: 500 });
  }
}
