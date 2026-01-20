import pkg from 'pg';
const { Pool } = pkg;

let pool = null;

export async function initDatabase() {
  const isProduction = process.env.NODE_ENV === 'production';
  const hasDatabaseUrl = process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== '';

  // Try PostgreSQL if in production or if DATABASE_URL is set
  if (isProduction || hasDatabaseUrl) {
    try {
      // Use PostgreSQL (Supabase)
      console.log('🔄 Connecting to PostgreSQL database...');

      if (!hasDatabaseUrl) {
        throw new Error('DATABASE_URL is required in production mode');
      }

      pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false
        }
      });

      // Test connection
      const client = await pool.connect();
      console.log('✅ PostgreSQL database connected');
      client.release();

      return pool;
    } catch (error) {
      // In production, fail hard
      if (isProduction) {
        console.error('❌ Database initialization error:', error.message);
        console.error('   Error code:', error.code);
        console.error('   Severity:', error.severity);
        throw error;
      }
      
      // In development, fall back to SQLite
      console.warn('⚠️  PostgreSQL connection failed, falling back to SQLite...');
      console.warn('   Error:', error.message);
      console.warn('   Error code:', error.code);
      
      // Continue to SQLite initialization below
    }
  }

  // Fallback to SQLite for local development
  try {
    const initSqlJs = (await import('sql.js')).default;
    const fs = await import('fs');

    const SQL = await initSqlJs();
    const dbPath = process.env.DATABASE_PATH || './database/invoice.db';

    let db;
    if (fs.existsSync(dbPath)) {
      const buffer = fs.readFileSync(dbPath);
      db = new SQL.Database(buffer);
    } else {
      db = new SQL.Database();
      const schema = fs.readFileSync('./database/schema.sql', 'utf8');
      db.exec(schema);
      const data = db.export();
      fs.writeFileSync(dbPath, data);
    }

    console.log('✅ SQLite database initialized (local mode)');
    return db;
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    throw error;
  }
}

export async function getDb() {
  if (!pool) {
    await initDatabase();
  }
  return pool;
}

// PostgreSQL query wrapper to match SQLite interface
export class DatabaseWrapper {
  constructor(pool) {
    this.pool = pool;
  }

  async query(sql, params = []) {
    try {
      const result = await this.pool.query(sql, params);
      return result;
    } catch (error) {
      console.error('SQL Error:', error.message);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  }

  async get(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows[0] || null;
  }

  async all(sql, params = []) {
    const result = await this.query(sql, params);
    return result.rows;
  }

  async run(sql, params = []) {
    const result = await this.query(sql, params);
    return {
      changes: result.rowCount || 0,
      lastID: result.rows && result.rows.length > 0 ? result.rows[0].id : null
    };
  }

  prepare(sql) {
    const self = this;
    return {
      async get(...params) {
        return await self.get(sql, params);
      },
      async all(...params) {
        return await self.all(sql, params);
      },
      async run(...params) {
        return await self.run(sql, params);
      }
    };
  }
}

// Export wrapped database
export async function getWrappedDb() {
  const pool = await getDb();
  if (pool instanceof Pool) {
    return new DatabaseWrapper(pool);
  }
  return pool; // SQLite db
}
