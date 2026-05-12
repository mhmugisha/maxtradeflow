import { sql } from '@neondatabase/serverless';

// Initialize database connection
const connectionString = process.env.NEON_DATABASE_URL;

if (!connectionString) {
  throw new Error('NEON_DATABASE_URL is not defined in environment variables');
}

/**
 * Initialize database and create articles table if it doesn't exist
 */
export async function initializeDatabase() {
  try {
    const query = sql`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        slug VARCHAR(255) UNIQUE NOT NULL,
        title VARCHAR(500) NOT NULL,
        excerpt TEXT,
        content TEXT NOT NULL,
        ticker VARCHAR(20),
        category VARCHAR(50) NOT NULL,
        rating VARCHAR(20),
        score INTEGER,
        adx DECIMAL,
        rsi DECIMAL,
        direction VARCHAR(10),
        entry_mode VARCHAR(20),
        tags TEXT[],
        seo_title VARCHAR(500),
        seo_description TEXT,
        published BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `;
    
    console.log('Database table initialized');
    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

/**
 * Execute a database query
 */
export async function query(text, params = []) {
  try {
    const result = await sql(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Get database connection string
 */
export function getConnectionString() {
  return connectionString;
}

export default sql;
