// backend/utils/sqlLoader.js
// Utility to load SQL files for migrations
// Demonstrates: Dynamic SQL file execution

const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/db');

/**
 * Load and execute a SQL file
 * @param {string} filename - Name of the SQL file in /db directory
 * @returns {Promise} - Execution result
 */
const loadSQLFile = async (filename) => {
  try {
    const filePath = path.join(__dirname, '../../db', filename);
    const sql = await fs.readFile(filePath, 'utf8');
    
    console.log(`Executing SQL file: ${filename}`);
    const result = await pool.query(sql);
    console.log(`✓ ${filename} executed successfully`);
    
    return result;
  } catch (error) {
    console.error(`Error executing ${filename}:`, error.message);
    throw error;
  }
};

/**
 * Run all migration files in order
 */
const runMigrations = async () => {
  const files = [
    'schema.sql',
    'functions.sql',
    'triggers.sql',
    'indexes_and_views.sql',
    'seed.sql'
  ];
  
  console.log('Starting database migrations...');
  
  for (const file of files) {
    await loadSQLFile(file);
  }
  
  console.log('✓ All migrations completed successfully');
};

module.exports = {
  loadSQLFile,
  runMigrations
};
