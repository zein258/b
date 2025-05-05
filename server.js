const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Connect to SQLite
const db = require('./sqlite');

// Create table if not exists
db.run(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    name TEXT,
    type TEXT,
    status TEXT
  )
`);

// POST /signup
app.post('/signup', (req, res) => {
  const { user_id, name, type, status } = req.body;
  db.get(`SELECT * FROM users WHERE user_id = ?`, [user_id], (err, row) => {
    if (err) return res.json({ status: 'failed' });
    if (row) return res.json({ status: 'duplicate' });

    const sql = `INSERT INTO users (user_id, name, type, status) VALUES (?, ?, ?, ?)`;
    db.run(sql, [user_id, name, type, status], (err) => {
      if (err) return res.json({ status: 'failed' });
      res.json({ status: 'success' });
    });
  });
});

// GET /users
app.get('/users', (req, res) => {
  db.all(`SELECT * FROM users`, [], (err, rows) => {
    if (err) return res.json({ status: 'failed' });
    res.json({ status: 'success', data: rows });
  });
});

// GET /user/:user_id
app.get('/user/:user_id', (req, res) => {
  const { user_id } = req.params;
  db.get(`SELECT * FROM users WHERE user_id = ?`, [user_id], (err, row) => {
    if (err) return res.json({ status: 'failed' });
    if (!row) return res.json({ status: 'undefined' });
    res.json({ status: 'success', data: row });
  });
});

// GET /user/:user_id/field/:fields
app.get('/user/:user_id/field/:fields', (req, res) => {
  const { user_id, fields } = req.params;
  const fieldArray = fields.split('&');
  const sql = `SELECT ${fieldArray.join(', ')} FROM users WHERE user_id = ?`;
  db.get(sql, [user_id], (err, row) => {
    if (err) return res.json({ status: 'failed' });
    if (!row) return res.json({ status: 'undefined' });
    res.json({ status: 'success', data: row });
  });
});

// PUT /activate/:user_id
app.put('/activate/:user_id', (req, res) => {
  const { user_id } = req.params;
  db.get(`SELECT * FROM users WHERE user_id = ?`, [user_id], (err, row) => {
    if (err) return res.json({ status: 'failed' });
    if (!row) return res.json({ status: 'undefined' });
    if (row.status === 'blocked') return res.json({ status: 'blocked' });
    if (row.status === 'active') return res.json({ status: 'duplicate' });

    if (row.status === 'not active' && row.type === 'none') {
      db.run(`UPDATE users SET status = 'active' WHERE user_id = ?`, [user_id], (err) => {
        if (err) return res.json({ status: 'failed' });
        res.json({ status: 'success' });
      });
    } else {
      res.json({ status: 'failed' });
    }
  });
});

// PUT /update/:user_id
app.put('/update/:user_id', (req, res) => {
  const { user_id } = req.params;
  const { name, type, status } = req.body;
  db.get(`SELECT * FROM users WHERE user_id = ?`, [user_id], (err, row) => {
    if (err) return res.json({ status: 'failed' });
    if (!row) return res.json({ status: 'undefined' });
    db.run(`UPDATE users SET name = ?, type = ?, status = ? WHERE user_id = ?`, [name, type, status, user_id], (err) => {
      if (err) return res.json({ status: 'failed' });
      res.json({ status: 'success' });
    });
  });
});

// PUT /block/:user_id
app.put('/block/:user_id', (req, res) => {
  const { user_id } = req.params;
  db.get(`SELECT * FROM users WHERE user_id = ?`, [user_id], (err, row) => {
    if (err) return res.json({ status: 'failed' });
    if (!row) return res.json({ status: 'undefined' });
    db.run(`UPDATE users SET status = 'blocked' WHERE user_id = ?`, [user_id], (err) => {
      if (err) return res.json({ status: 'failed' });
      res.json({ status: 'success' });
    });
  });
});

// PUT /unblock/:user_id
app.put('/unblock/:user_id', (req, res) => {
  const { user_id } = req.params;
  db.get(`SELECT * FROM users WHERE user_id = ?`, [user_id], (err, row) => {
    if (err) return res.json({ status: 'failed' });
    if (!row) return res.json({ status: 'undefined' });
    db.run(`UPDATE users SET status = 'not active' WHERE user_id = ?`, [user_id], (err) => {
      if (err) return res.json({ status: 'failed' });
      res.json({ status: 'success' });
    });
  });
});

// DELETE /user/:user_id
app.delete('/user/:user_id', (req, res) => {
  const { user_id } = req.params;
  db.get(`SELECT * FROM users WHERE user_id = ?`, [user_id], (err, row) => {
    if (err) return res.json({ status: 'failed' });
    if (!row) return res.json({ status: 'undefined' });
    db.run(`DELETE FROM users WHERE user_id = ?`, [user_id], (err) => {
      if (err) return res.json({ status: 'failed' });
      res.json({ status: 'success' });
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
