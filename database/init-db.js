#!/usr/bin/env node

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Configuration
const DB_PATH = path.join(__dirname, 'database.db');
const SQL_FILE = path.join(__dirname, 'database.sql');

// Check for force flag
const forceReset = process.argv.includes('--force');

/**
 * Initialize the database by reading and executing the SQL file
 */
async function initializeDatabase() {
  console.log('🚀 Starting database initialization for Jennifer\'s Closet...\n');

  // Check if database already exists
  if (fs.existsSync(DB_PATH) && !forceReset) {
    console.log('⚠️  Database already exists at:', DB_PATH);
    console.log('💡 Use "npm run reset" or "node init-db.js --force" to recreate the database.\n');
    process.exit(0);
  }

  // Remove existing database if force flag is set
  if (fs.existsSync(DB_PATH) && forceReset) {
    console.log('🗑️  Removing existing database...');
    fs.unlinkSync(DB_PATH);
  }

  // Check if SQL file exists
  if (!fs.existsSync(SQL_FILE)) {
    console.error('❌ Error: database.sql file not found at:', SQL_FILE);
    process.exit(1);
  }

  try {
    // Read the SQL file
    console.log('📖 Reading SQL schema from:', SQL_FILE);
    const sqlContent = fs.readFileSync(SQL_FILE, 'utf8');

    // Create database connection
    console.log('🔨 Creating database at:', DB_PATH);
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) {
        console.error('❌ Error creating database:', err.message);
        process.exit(1);
      }
    });

    // Execute the SQL commands
    console.log('⚙️  Executing SQL commands...');

    db.exec(sqlContent, (err) => {
      if (err) {
        console.error('❌ Error executing SQL:', err.message);
        db.close();
        process.exit(1);
      }

      // Verify tables were created
      db.all(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name
      `, [], (err, tables) => {
        if (err) {
          console.error('❌ Error verifying tables:', err.message);
          db.close();
          process.exit(1);
        }

        console.log('\n✅ Database initialized successfully!');
        console.log('\n📊 Created tables:');
        tables.forEach(table => {
          if (table.name !== 'sqlite_sequence') {
            console.log(`   - ${table.name}`);
          }
        });

        // Get table counts
        console.log('\n📈 Table status:');
        let pending = 0;
        const validTables = tables.filter(t => t.name !== 'sqlite_sequence');

        validTables.forEach(table => {
          pending++;
          db.get(`SELECT COUNT(*) as count FROM ${table.name}`, [], (err, row) => {
            if (!err) {
              console.log(`   - ${table.name}: ${row.count} records`);
            }
            pending--;
            if (pending === 0) {
              // Close the database after all queries complete
              db.close((err) => {
                if (err) {
                  console.error('❌ Error closing database:', err.message);
                } else {
                  console.log('\n✨ Database is ready to use!\n');
                }
              });
            }
          });
        });

        // Handle case where there are no valid tables
        if (validTables.length === 0) {
          db.close((err) => {
            if (err) {
              console.error('❌ Error closing database:', err.message);
            } else {
              console.log('\n✨ Database is ready to use!\n');
            }
          });
        }
      });
    });

  } catch (error) {
    console.error('\n❌ Error initializing database:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the initialization
initializeDatabase();