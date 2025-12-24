# Jennifer's Closet - Database

This directory contains the database schema and initialization scripts for Jennifer's Closet.

## Files

- `database.sql` - SQLite schema definition
- `init-db.js` - Node.js script to initialize the database
- `package.json` - Dependencies and scripts
- `database.db` - SQLite database file (created after initialization)

## Database Schema

The database contains the following tables:

- **active** - Current active content (about, donate, volunteer information)
- **backups** - Historical backups of content with timestamps
- **users** - User accounts with hashed passwords
- **wishlist** - Items needed for the clothing closet

## Setup & Usage

### First Time Setup

1. Install dependencies:
   ```bash
   cd database
   npm install
   ```

2. Initialize the database:
   ```bash
   npm run init
   ```
   
   Or directly:
   ```bash
   node init-db.js
   ```

### Reset Database

If you need to recreate the database from scratch:

```bash
npm run reset
```

Or directly:
```bash
node init-db.js --force
```

⚠️ **Warning**: This will delete all existing data in the database!

## Features

- ✅ Automatic table creation from SQL schema
- ✅ Safety check to prevent accidental overwrites
- ✅ Force reset option for development
- ✅ Verification of created tables
- ✅ Detailed console output with status information
- ✅ Compatible with all Node.js versions (uses `sqlite3` package)

## Node.js Compatibility

This project uses the `sqlite3` package which is compatible with all Node.js versions, including the latest v25+. The package handles native compilation automatically and has prebuilt binaries for most platforms.

If you encounter installation issues:
- Make sure you have the latest version of npm: `npm install -g npm@latest`
- On macOS, ensure you have Xcode Command Line Tools: `xcode-select --install`
- On Linux, install build essentials: `sudo apt-get install build-essential`

## Development

The database uses SQLite3 with the standard `sqlite3` npm package.

To modify the schema:
1. Update `database.sql`
2. Run `npm run reset` to recreate the database with the new schema

## Connection

The database file will be created at: `./database.db`

You can connect to it from your backend using the `sqlite3` package:

```javascript
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database/database.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
});

// Query example
db.all('SELECT * FROM users', [], (err, rows) => {
  if (err) {
    throw err;
  }
  rows.forEach((row) => {
    console.log(row);
  });
});

// Remember to close when done
db.close();
```

### Using Promises (Recommended)

For cleaner async/await syntax, you can promisify the sqlite3 methods:

```javascript
const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');

const db = new sqlite3.Database('./database/database.db');
const dbAll = promisify(db.all.bind(db));
const dbRun = promisify(db.run.bind(db));

async function getUsers() {
  const users = await dbAll('SELECT * FROM users');
  console.log(users);
}

getUsers();
```

Or use the `sqlite` wrapper package for promise-based API:
```bash
npm install sqlite sqlite3
```

```javascript
const sqlite = require('sqlite');
const sqlite3 = require('sqlite3');

async function openDB() {
  return await sqlite.open({
    filename: './database/database.db',
    driver: sqlite3.Database
  });
}

async function getUsers() {
  const db = await openDB();
  const users = await db.all('SELECT * FROM users');
  console.log(users);
  await db.close();
}

getUsers();
```