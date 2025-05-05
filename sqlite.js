const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./users.db', (err) => {
  if (err) console.error(err.message);
  console.log('Connected to the SQLite database.');
});

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    status TEXT
  )
`);

module.exports = db;
