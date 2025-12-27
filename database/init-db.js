#!/usr/bin/env node

require('dotenv').config();
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');

// Configuration
const DB_PATH = path.join(__dirname, 'database.db');
const SQL_FILE = path.join(__dirname, 'database.sql');
const DATA_SQL_FILE = path.join(__dirname, 'data.sql');

// Check for force flag
const forceReset = process.argv.includes('--force');


function callBcrypt(data) {
  const saltRounds = 10;
  return bcrypt.hashSync(data, saltRounds);
}

/**
 * Insert initial user data from environment variables
 * @param {sqlite3.Database} db - The database connection
 * @returns {Promise<void>}
 */
function insertUserData(db) {
  return new Promise((resolve, reject) => {
    const username = process.env.USERNAME;

    if (!username) {
      console.warn('⚠️  USERNAME not found in .env file. Skipping user creation.');
      resolve();
      return;
    }

    // Start a transaction
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        reject(err);
        return;
      }

      // Insert user
      db.run(
        'INSERT INTO users (username) VALUES (?)',
        [username],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }

          const userId = this.lastID;
          console.log(`   ✓ User "${username}" created with ID: ${userId}`);

          // Insert user attribute labels
          const labels = [
            { id: parseInt(process.env.USER_ATTRIBUTE_ID_12399), name: process.env.USER_ATTRIBUTE_NAME_12556 },
            { id: parseInt(process.env.USER_ATTRIBUTE_ID_12556), name: process.env.USER_ATTRIBUTE_NAME_12754 },
            { id: parseInt(process.env.USER_ATTRIBUTE_ID_12488), name: process.env.USER_ATTRIBUTE_NAME_12623 },
            { id: parseInt(process.env.USER_ATTRIBUTE_ID_12677), name: process.env.USER_ATTRIBUTE_NAME_12889 },
            { id: parseInt(process.env.USER_ATTRIBUTE_ID_12923), name: process.env.USER_ATTRIBUTE_NAME_13045 }
          ];

          let pendingLabels = labels.length;
          let labelError = false;

          labels.forEach(label => {
            db.run(
              'INSERT INTO user_attribute_label (id, name) VALUES (?, ?)',
              [label.id, label.name],
              function(err) {
                if (err && !labelError) {
                  labelError = true;
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }

                if (!labelError) {
                  pendingLabels--;

                  if (pendingLabels === 0) {
                    const USER_ATTRIBUTE_129994 = process.env.USER_ATTRIBUTE_129994;
                    const callBcryptResult = callBcrypt(USER_ATTRIBUTE_129994);

                    db.run(
                      'INSERT INTO user_attribute (user, user_attribute_label, value) VALUES (?, ?, ?)',
                      [userId, parseInt(process.env.USER_ATTRIBUTE_ID_12399), callBcryptResult],
                      function(err) {
                        if (err) {
                          db.run('ROLLBACK');
                          reject(err);
                          return;
                        }


                        // Commit the transaction
                        db.run('COMMIT', (err) => {
                          if (err) {
                            db.run('ROLLBACK');
                            reject(err);
                          } else {
                            resolve();
                          }
                        });
                      }
                    );
                  }
                }
              }
            );
          });
        }
      );
    });
  });
}

/**
 * Show final table status and close the database
 * @param {sqlite3.Database} db - The database connection
 * @param {Array} tables - Array of table objects
 * @returns {Promise<void>}
 */
function showFinalStatus(db, tables) {
  return new Promise((resolve) => {
    // Get table counts
    console.log('\n📈 Final table status:');
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
            resolve();
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
        resolve();
      });
    }
  });
}

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
      `, [], async (err, tables) => {
        if (err) {
          console.error('❌ Error verifying tables:', err.message);
          db.close();
          process.exit(1);
        }

        console.log('\n✅ Database schema initialized successfully!');
        console.log('\n📊 Created tables:');
        tables.forEach(table => {
          if (table.name !== 'sqlite_sequence') {
            console.log(`   - ${table.name}`);
          }
        });

        // Execute data.sql if it exists
        if (fs.existsSync(DATA_SQL_FILE)) {
          console.log('\n📝 Loading initial data from data.sql...');
          try {
            const dataSqlContent = fs.readFileSync(DATA_SQL_FILE, 'utf8');
            db.exec(dataSqlContent, async (err) => {
              if (err) {
                console.error('❌ Error executing data.sql:', err.message);
                db.close();
                process.exit(1);
              }

              console.log('✅ Initial data loaded successfully!');

              // Insert user data from environment variables
              try {
                await insertUserData(db);
              } catch (error) {
                console.error('❌ Error inserting user data:', error.message);
                db.close();
                process.exit(1);
              }

              // Continue to final table status...
              await showFinalStatus(db, tables);
            });
          } catch (error) {
            console.error('❌ Error reading data.sql:', error.message);
            db.close();
            process.exit(1);
          }
        } else {
          console.log('\n⚠️  data.sql file not found, skipping initial data load');
          
          // Insert user data from environment variables
          try {
            await insertUserData(db);
          } catch (error) {
            console.error('❌ Error inserting user data:', error.message);
            db.close();
            process.exit(1);
          }

          // Continue to final table status...
          await showFinalStatus(db, tables);
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