const express = require('express');
const { Pool } = require('pg');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads')); // Server Storage for Images

// PostgreSQL database Connection
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'jerome',
  port: 5432,
});

// This is Multer Setup for Local Image Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// 1. POST API for Creating New Hotel Records
app.post('/api/hotels', upload.single('image'), async (req, res) => {
  const { title, description, latitude, longitude, price } = req.body;
  const image_path = req.file ? req.file.path : null;

  try {
    const newHotel = await pool.query(
      'INSERT INTO hotels (title, description, latitude, longitude, price, image_path) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, latitude, longitude, price, image_path]
    );
    res.status(201).json(newHotel.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 2. PUT API for Editing hotels records
app.put('/api/hotels/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const { title, description, latitude, longitude, price } = req.body;
  const newImagePath = req.file ? req.file.path : null;

  try {
    let query = 'UPDATE hotels SET title = $1, description = $2, latitude = $3, longitude = $4, price = $5';
    let queryParams = [title, description, latitude, longitude, price];
    
    if (newImagePath) {
      query += ', image_path = 6 WHERE id = $7 RETURNING *';
      queryParams.push(newImagePath, id);
    } else {
      query += ' WHERE id = $6 RETURNING *';
      queryParams.push(id);
    }

    const updatedHotel = await pool.query(query, queryParams);
    res.json(updatedHotel.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DELETE the API for Deleting hotel records
app.delete('/api/hotels/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // First, get the image path and we can delete the file
    const hotel = await pool.query('SELECT image_path FROM hotels WHERE id = $1', [id]);
    
    if (hotel.rows.length > 0 && hotel.rows[0].image_path) {
      const imagePath = hotel.rows[0].image_path;
      // Delete from server storage
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await pool.query('DELETE FROM hotels WHERE id = $1', [id]);
    res.json({ message: 'Hotel deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// 4. GET the API for Fetching Hotels with Filters
app.get('/api/hotels', async (req, res) => {
  const { title, minPrice, maxPrice, limit = 10, offset = 0 } = req.query;
  
  let query = 'SELECT * FROM hotels WHERE 1=1';
  const queryParams = [];
  let paramIndex = 1;

  if (title) {
    query += ` AND title ILIKE $${paramIndex++}`;
    queryParams.push(`%${title}%`);
  }
  if (minPrice) {
    query += ` AND price >= $${paramIndex++}`;
    queryParams.push(minPrice);
  }
  if (maxPrice) {
    query += ` AND price <= $${paramIndex++}`;
    queryParams.push(maxPrice);
  }

  query += ` ORDER BY created_at DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`;
  queryParams.push(limit, offset);

  try {
    const hotels = await pool.query(query, queryParams);
    res.json(hotels.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. GET the API for Fetching a Single Hotel by id
app.get('/api/hotels/:id', async (req, res) => {
  try {
    const hotel = await pool.query('SELECT * FROM hotels WHERE id = $1', [req.params.id]);
    res.json(hotel.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Implement PUT /api/hotels/:id and DELETE /api/hotels/:id using similar native pool.query() structures.

app.listen(5000, () => console.log('Server running on port 5000'));