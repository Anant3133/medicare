// backend/scripts/migrate.js
// Automated Database Migration & Seeding Script for Medicare
// Reads and executes schema, functions, triggers, indexes, and seed data sequentially

const fs = require('fs');
const path = require('path');
const { pool } = require('../config/db');

const SQL_FILES = [
  { name: 'schema.sql', desc: 'Creating tables, schemas, and primary/foreign key constraints' },
  { name: 'functions.sql', desc: 'Creating stored functions and procedures' },
  { name: 'triggers.sql', desc: 'Creating triggers and audit log handlers' },
  { name: 'indexes_and_views.sql', desc: 'Creating indexes, standard views, and materialized views' },
  { name: 'seed.sql', desc: 'Seeding initial data (departments, doctors, rooms, beds, services, users)' }
];

async function runMigrations() {
  console.log('================================================');
  console.log('🚀 Starting Medicare Database Migration & Seed');
  console.log('================================================\n');

  const dbDir = path.resolve(__dirname, '../../db');

  try {
    // 1. Test database connection
    console.log('📡 Testing connection to database...');
    const res = await pool.query('SELECT current_database(), current_user, version()');
    console.log(`✓ Connected to DB: "${res.rows[0].current_database}" as user "${res.rows[0].current_user}"`);
    console.log(`  Engine: ${res.rows[0].version.split(',')[0]}\n`);

    // 2. Execute SQL scripts sequentially
    for (let i = 0; i < SQL_FILES.length; i++) {
      const fileInfo = SQL_FILES[i];
      const filePath = path.join(dbDir, fileInfo.name);

      if (!fs.existsSync(filePath)) {
        throw new Error(`Migration file not found: ${filePath}`);
      }

      console.log(`[${i + 1}/${SQL_FILES.length}] Executing ${fileInfo.name}...`);
      console.log(`    ↳ Info: ${fileInfo.desc}`);

      const sqlContent = fs.readFileSync(filePath, 'utf8');

      // Execute SQL batch
      await pool.query(sqlContent);
      console.log(`    ✓ ${fileInfo.name} applied successfully.\n`);
    }

    console.log('================================================');
    console.log('🎉 Database migration & seed completed successfully!');
    console.log('================================================\n');
  } catch (error) {
    console.error('\n❌ MIGRATION FAILED!');
    console.error('Error Details:', error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
    console.log('Connection pool closed.');
  }
}

runMigrations();
