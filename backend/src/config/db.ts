import { Pool, QueryResult } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL must be defined in environment variables');
  process.exit(1);
}

/**
 * PostgreSQL connection pool.
 */
export const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false, // Required for Supabase SSL connection
  },
});

/**
 * Helper query function to execute queries on the pool.
 */
export const query = (text: string, params?: any[]): Promise<QueryResult> => {
  return pool.query(text, params);
};

/**
 * Verifies database connectivity on startup.
 */
export const verifyConnection = async (): Promise<void> => {
  try {
    const res = await query('SELECT 1');
    if (!res || res.rows.length === 0) {
      throw new Error('No response from database');
    }
    console.log('✅ PostgreSQL database connected successfully');
  } catch (error) {
    const err = error as Error;
    console.error(`❌ PostgreSQL connection check failed: ${err.message}`);
    process.exit(1);
  }
};

export default {
  pool,
  query,
  verifyConnection,
};
