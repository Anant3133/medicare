// backend/config/db.js
// PostgreSQL database connection configuration
// Demonstrates: Connection pooling, transaction helpers, parameterized queries

const { Pool } = require('pg');
require('dotenv').config();

// Dynamic Pool configuration supporting local DB and cloud DB (Neon, Render, Supabase, Railway, etc.)
const isCloudDb = Boolean(process.env.DATABASE_URL || process.env.DB_SSL === 'true');

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
    }
  : {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      database: process.env.DB_NAME || 'medicare',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD,
      ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };

const pool = new Pool({
  ...poolConfig,
  max: parseInt(process.env.DB_MAX_POOL, 10) || 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
});

// Test database connection
pool.on('connect', () => {
  console.log('✓ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
  process.exit(-1);
});

/**
 * Execute a SQL query with parameters
 * @param {string} text - SQL query with $1, $2 placeholders
 * @param {Array} params - Array of parameter values
 * @returns {Promise} - Query result
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log query in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Executed query:', {
        text: text.substring(0, 100) + '...',
        duration: duration + 'ms',
        rows: result.rowCount
      });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error.message);
    throw error;
  }
};

/**
 * Get a client from the pool for transactions
 * Demonstrates: Transaction management with connection pooling
 */
const getClient = async () => {
  const client = await pool.connect();
  
  // Add transaction helper methods to client
  const query = client.query.bind(client);
  const release = client.release.bind(client);
  
  // Set a timeout to prevent abandoned transactions
  const timeout = setTimeout(() => {
    console.error('WARNING: Client has been checked out for more than 5 seconds!');
  }, 5000);
  
  // Override release to clear timeout
  client.release = () => {
    clearTimeout(timeout);
    client.release = release;
    return release();
  };
  
  return client;
};

/**
 * Execute a function within a transaction
 * Demonstrates: ACID transactions with automatic rollback on error
 * 
 * @param {Function} callback - Async function that receives a client
 * @returns {Promise} - Result of the callback
 */
const transaction = async (callback) => {
  const client = await getClient();
  
  try {
    await client.query('BEGIN'); // Start transaction
    console.log('Transaction started');
    
    const result = await callback(client);
    
    await client.query('COMMIT'); // Commit transaction
    console.log('Transaction committed');
    
    return result;
  } catch (error) {
    await client.query('ROLLBACK'); // Rollback on error
    console.error('Transaction rolled back:', error.message);
    throw error;
  } finally {
    client.release(); // Always release the client back to pool
  }
};

/**
 * Execute multiple queries in a transaction
 * Useful for batch operations
 */
const batchQuery = async (queries) => {
  return transaction(async (client) => {
    const results = [];
    
    for (const { text, params } of queries) {
      const result = await client.query(text, params);
      results.push(result);
    }
    
    return results;
  });
};

module.exports = {
  pool,
  query,
  getClient,
  transaction,
  batchQuery
};
