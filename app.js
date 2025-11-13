const express = require('express');
const path = require('path');
const { Pool } = require('pg'); // Import the pg library

const app = express();
const PORT = 3000;

// --- Database Connection ---
// The Pool will automatically use environment variables
// (PGHOST, PGUSER, PGDATABASE, PGPASSWORD, PGPORT)
// This is the magic! We don't put secrets in our code.
const pool = new Pool({
  ssl: {
    rejectUnauthorized: false
  }
});

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// --- Database Setup Function ---
// This function will create our 'todos' table if it doesn't exist
async function setupDatabase() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS todos (
        id SERIAL PRIMARY KEY,
        task TEXT NOT NULL
      );
    `);
    console.log('Database table "todos" is ready.');
  } catch (err) {
    console.error('Error creating database table:', err);
  } finally {
    client.release();
  }
}

// --- API Routes (Now with SQL!) ---

// GET all todos
app.get('/todos', async (req, res) => {
  try {
    // Replaced the array with a SQL query
    const result = await pool.query('SELECT * FROM todos ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// POST a new todo
app.post('/todos', async (req, res) => {
  try {
    const { task } = req.body;
    if (!task) {
      return res.status(400).json({ error: 'Task is required' });
    }
    // Replaced .push() with an INSERT query
    const result = await pool.query(
      'INSERT INTO todos (task) VALUES ($1) RETURNING *',
      [task]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE a todo
app.delete('/todos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Replaced .filter() with a DELETE query
    const result = await pool.query('DELETE FROM todos WHERE id = $1', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(204).send(); // No content
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// --- Start the server ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${PORT}`);
  
  // Run the database setup function on start
  setupDatabase();
});
