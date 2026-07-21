const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 3003;
const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

function readDB() {
  if (!fs.existsSync(DB_PATH)) {
    const initial = { movies: [] };
    fs.writeFileSync(DB_PATH, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// Seed data if empty
function seedIfEmpty() {
  const db = readDB();
  if (db.movies.length === 0) {
    db.movies = [
    {
        "id": "seed-1",
        "title": "The Dark Knight",
        "description": "Sample description for The Dark Knight. This is test data for the flaky test detection research study.",
        "category": "Action",
        "createdAt": "2026-07-21T00:21:18.564Z",
        "status": "watched",
        "rating": "3",
        "year": "2010"
    },
    {
        "id": "seed-2",
        "title": "Inception",
        "description": "Sample description for Inception. This is test data for the flaky test detection research study.",
        "category": "Comedy",
        "createdAt": "2026-07-20T00:21:18.564Z",
        "status": "watchlist",
        "rating": "4",
        "year": "2011"
    },
    {
        "id": "seed-3",
        "title": "Pulp Fiction",
        "description": "Sample description for Pulp Fiction. This is test data for the flaky test detection research study.",
        "category": "Drama",
        "createdAt": "2026-07-19T00:21:18.564Z",
        "status": "watching",
        "rating": "5",
        "year": "2012"
    },
    {
        "id": "seed-4",
        "title": "The Matrix",
        "description": "Sample description for The Matrix. This is test data for the flaky test detection research study.",
        "category": "Sci-Fi",
        "createdAt": "2026-07-18T00:21:18.564Z",
        "status": "watched",
        "rating": "1",
        "year": "2013"
    },
    {
        "id": "seed-5",
        "title": "Interstellar",
        "description": "Sample description for Interstellar. This is test data for the flaky test detection research study.",
        "category": "Horror",
        "createdAt": "2026-07-17T00:21:18.564Z",
        "status": "watchlist",
        "rating": "3",
        "year": "2014"
    },
    {
        "id": "seed-6",
        "title": "Parasite",
        "description": "Sample description for Parasite. This is test data for the flaky test detection research study.",
        "category": "Action",
        "createdAt": "2026-07-16T00:21:18.564Z",
        "status": "watching",
        "rating": "4",
        "year": "2015"
    },
    {
        "id": "seed-7",
        "title": "The Godfather",
        "description": "Sample description for The Godfather. This is test data for the flaky test detection research study.",
        "category": "Comedy",
        "createdAt": "2026-07-15T00:21:18.564Z",
        "status": "watched",
        "rating": "2",
        "year": "2016"
    },
    {
        "id": "seed-8",
        "title": "Blade Runner 2049",
        "description": "Sample description for Blade Runner 2049. This is test data for the flaky test detection research study.",
        "category": "Drama",
        "createdAt": "2026-07-14T00:21:18.564Z",
        "status": "watchlist",
        "rating": "4",
        "year": "2017"
    }
];
    writeDB(db);
  }
}
seedIfEmpty();

// GET all
app.get('/api/movies', (req, res) => {
  const db = readDB();
  let items = db.movies;
  if (req.query.search) {
    const q = req.query.search.toLowerCase();
    items = items.filter(i => i.title && i.title.toLowerCase().includes(q) || (i.name && i.name.toLowerCase().includes(q)));
  }
  if (req.query.category) {
    items = items.filter(i => i.category === req.query.category);
  }
  res.json(items);
});

// GET one
app.get('/api/movies/:id', (req, res) => {
  const db = readDB();
  const item = db.movies.find(i => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// POST create
app.post('/api/movies', (req, res) => {
  const db = readDB();
  const item = { id: uuidv4(), ...req.body, createdAt: new Date().toISOString() };
  db.movies.push(item);
  writeDB(db);
  res.status(201).json(item);
});

// PUT update
app.put('/api/movies/:id', (req, res) => {
  const db = readDB();
  const idx = db.movies.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.movies[idx] = { ...db.movies[idx], ...req.body, updatedAt: new Date().toISOString() };
  writeDB(db);
  res.json(db.movies[idx]);
});

// DELETE
app.delete('/api/movies/:id', (req, res) => {
  const db = readDB();
  const idx = db.movies.findIndex(i => i.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.movies.splice(idx, 1);
  writeDB(db);
  res.json({ message: 'Deleted successfully' });
});

// Reset endpoint for testing
app.post('/api/reset', (req, res) => {
  const initial = { movies: [] };
  writeDB(initial);
  seedIfEmpty();
  res.json({ message: 'Database reset' });
});

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok', project: 'Movie Reviews' }));

// Serve frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

app.listen(PORT, () => console.log('Movie Reviews server running on http://localhost:3003'));
