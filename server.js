const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = new Pool({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

// Check PostgreSQL version compatibility
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error acquiring client', err.stack);
    return;
  }
  client.query('SHOW server_version', (err, result) => {
    release();
    if (err) {
      console.error('Error executing query', err.stack);
      return;
    }
    const serverVersion = result.rows[0].server_version;
    if (!serverVersion.startsWith('14')) {
      console.error(`Incompatible PostgreSQL version: ${serverVersion}. Expected version 14.`);
      process.exit(1);
    }
  });
});

// CRUD operations for users
app.get('/users', async (req, res) => {
  const result = await pool.query('SELECT * FROM "user"');
  res.json(result.rows);
});

app.post('/users', async (req, res) => {
  const { email, name, password } = req.body;
  const result = await pool.query(
    'INSERT INTO "user" (email, name, password) VALUES ($1, $2, $3) RETURNING *',
    [email, name, password]
  );
  res.json(result.rows[0]);
});

app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { email, name, password } = req.body;
  const result = await pool.query(
    'UPDATE "user" SET email = $1, name = $2, password = $3 WHERE id = $4 RETURNING *',
    [email, name, password, id]
  );
  res.json(result.rows[0]);
});

app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM "user" WHERE id = $1', [id]);
  res.sendStatus(204);
});

// CRUD operations for timesheets
app.get('/timesheets', async (req, res) => {
  const result = await pool.query('SELECT * FROM timesheet');
  res.json(result.rows);
});

app.post('/timesheets', async (req, res) => {
  const { user_id, task, project, hours_worked, description, status } = req.body;
  const result = await pool.query(
    'INSERT INTO timesheet (user_id, task, project, hours_worked, description, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [user_id, task, project, hours_worked, description, status]
  );
  res.json(result.rows[0]);
});

app.put('/timesheets/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, task, project, hours_worked, description, status } = req.body;
  const result = await pool.query(
    'UPDATE timesheet SET user_id = $1, task = $2, project = $3, hours_worked = $4, description = $5, status = $6 WHERE timesheet_id = $7 RETURNING *',
    [user_id, task, project, hours_worked, description, status, id]
  );
  res.json(result.rows[0]);
});

app.delete('/timesheets/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM timesheet WHERE timesheet_id = $1', [id]);
  res.sendStatus(204);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
