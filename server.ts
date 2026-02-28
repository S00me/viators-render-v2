import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import cookieParser from 'cookie-parser';
import { initDb } from './src/db/index.js';
import db from './src/db/index.js';

const app = express();
const PORT = 3000;

// Initialize Database
initDb();

// Ensure uploads directory exists
const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(uploadsDir));

// Multer Setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// Auth Middleware
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const token = req.cookies['admin-token'];
  if (token === 'secret-admin-token') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

// API Routes

// Login
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === 'Piliscsaba2123') {
    res.cookie('admin-token', 'secret-admin-token', { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ success: true });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

app.post('/api/logout', (req, res) => {
  res.clearCookie('admin-token');
  res.json({ success: true });
});

app.get('/api/check-auth', (req, res) => {
  const token = req.cookies['admin-token'];
  if (token === 'secret-admin-token') {
    res.json({ authenticated: true });
  } else {
    res.json({ authenticated: false });
  }
});

// Upcoming Expedition
app.get('/api/upcoming', (req, res) => {
  const row = db.prepare('SELECT * FROM upcoming_expedition WHERE id = 1').get();
  if (row) {
    // Parse highlights if it's a string
    try {
      // @ts-ignore
      row.highlights = JSON.parse(row.highlights);
    } catch (e) {
      // @ts-ignore
      row.highlights = [];
    }
    res.json(row);
  } else {
    res.status(404).json({ error: 'Not found' });
  }
});

app.post('/api/upcoming', requireAdmin, (req, res) => {
  const { title, description, elevation, distance, duration, shelter, region, highlights, route_gpx, center_lat, center_lng, zoom, image } = req.body;
  
  const stmt = db.prepare(`
    UPDATE upcoming_expedition 
    SET title = ?, description = ?, elevation = ?, distance = ?, duration = ?, shelter = ?, region = ?, highlights = ?, route_gpx = ?, center_lat = ?, center_lng = ?, zoom = ?, image = ?
    WHERE id = 1
  `);
  
  stmt.run(title, description, elevation, distance, duration, shelter, region, JSON.stringify(highlights), route_gpx, center_lat, center_lng, zoom, image);
  res.json({ success: true });
});

// Past Trips
app.get('/api/past-trips', (req, res) => {
  const trips = db.prepare('SELECT * FROM past_trips ORDER BY date DESC').all();
  // Get gallery images for each trip
  const tripsWithGallery = trips.map((trip: any) => {
    const gallery = db.prepare('SELECT image_url FROM past_trip_gallery WHERE trip_id = ?').all(trip.id);
    return { ...trip, gallery: gallery.map((g: any) => g.image_url) };
  });
  res.json(tripsWithGallery);
});

app.post('/api/past-trips', requireAdmin, (req, res) => {
  const { name, date, location, elevation, image, description, route_gpx, center_lat, center_lng, zoom, gallery } = req.body;
  
  const insert = db.prepare(`
    INSERT INTO past_trips (name, date, location, elevation, image, description, route_gpx, center_lat, center_lng, zoom)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  
  const info = insert.run(name, date, location, elevation, image, description, route_gpx, center_lat, center_lng, zoom);
  const tripId = info.lastInsertRowid;
  
  if (gallery && Array.isArray(gallery)) {
    const insertGallery = db.prepare('INSERT INTO past_trip_gallery (trip_id, image_url) VALUES (?, ?)');
    gallery.forEach((url: string) => insertGallery.run(tripId, url));
  }
  
  res.json({ success: true, id: tripId });
});

app.put('/api/past-trips/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { name, date, location, elevation, image, description, route_gpx, center_lat, center_lng, zoom, gallery } = req.body;
  
  const update = db.prepare(`
    UPDATE past_trips 
    SET name = ?, date = ?, location = ?, elevation = ?, image = ?, description = ?, route_gpx = ?, center_lat = ?, center_lng = ?, zoom = ?
    WHERE id = ?
  `);
  
  update.run(name, date, location, elevation, image, description, route_gpx, center_lat, center_lng, zoom, id);
  
  // Update gallery: delete old, insert new
  if (gallery && Array.isArray(gallery)) {
    db.prepare('DELETE FROM past_trip_gallery WHERE trip_id = ?').run(id);
    const insertGallery = db.prepare('INSERT INTO past_trip_gallery (trip_id, image_url) VALUES (?, ?)');
    gallery.forEach((url: string) => insertGallery.run(id, url));
  }
  
  res.json({ success: true });
});

app.delete('/api/past-trips/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM past_trip_gallery WHERE trip_id = ?').run(id);
  db.prepare('DELETE FROM past_trips WHERE id = ?').run(id);
  res.json({ success: true });
});

// File Upload
app.post('/api/upload', requireAdmin, upload.array('files'), (req, res) => {
  if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
    return res.status(400).json({ error: 'No files uploaded' });
  }
  
  const files = req.files as Express.Multer.File[];
  const urls = files.map(file => `/uploads/${file.filename}`);
  
  res.json({ urls });
});

// Site Settings (Profile Picture)
app.get('/api/settings/:key', (req, res) => {
  const { key } = req.params;
  const row = db.prepare('SELECT value FROM site_settings WHERE key = ?').get(key) as { value: string } | undefined;
  res.json({ value: row ? row.value : null });
});

app.post('/api/settings/:key', requireAdmin, (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  db.prepare('INSERT OR REPLACE INTO site_settings (key, value) VALUES (?, ?)').run(key, value);
  res.json({ success: true });
});

// Itinerary
app.get('/api/itinerary', (req, res) => {
  const days = db.prepare('SELECT * FROM itinerary_days ORDER BY day_number ASC').all();
  res.json(days);
});

app.post('/api/itinerary', requireAdmin, (req, res) => {
  const { day_number, title, description, km, elevation_gain, elevation_loss, shelter, water_source, food_source, difficulty, komoot_link, gpx_url, color } = req.body;
  const stmt = db.prepare(`
    INSERT INTO itinerary_days (day_number, title, description, km, elevation_gain, elevation_loss, shelter, water_source, food_source, difficulty, komoot_link, gpx_url, color)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(day_number, title, description, km, elevation_gain, elevation_loss, shelter, water_source ? 1 : 0, food_source ? 1 : 0, difficulty, komoot_link, gpx_url, color);
  res.json({ success: true, id: info.lastInsertRowid });
});

app.put('/api/itinerary/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  const { day_number, title, description, km, elevation_gain, elevation_loss, shelter, water_source, food_source, difficulty, komoot_link, gpx_url, color } = req.body;
  const stmt = db.prepare(`
    UPDATE itinerary_days 
    SET day_number = ?, title = ?, description = ?, km = ?, elevation_gain = ?, elevation_loss = ?, shelter = ?, water_source = ?, food_source = ?, difficulty = ?, komoot_link = ?, gpx_url = ?, color = ?
    WHERE id = ?
  `);
  stmt.run(day_number, title, description, km, elevation_gain, elevation_loss, shelter, water_source ? 1 : 0, food_source ? 1 : 0, difficulty, komoot_link, gpx_url, color, id);
  res.json({ success: true });
});

app.delete('/api/itinerary/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM itinerary_days WHERE id = ?').run(id);
  res.json({ success: true });
});

// Gear
app.get('/api/gear', (req, res) => {
  const categories = db.prepare('SELECT * FROM gear_categories').all();
  const items = db.prepare('SELECT * FROM gear_items').all();
  
  const gear = categories.map((cat: any) => ({
    ...cat,
    items: items.filter((item: any) => item.category_id === cat.id)
  }));
  
  res.json(gear);
});

app.post('/api/gear/categories', requireAdmin, (req, res) => {
  const { name } = req.body;
  const info = db.prepare('INSERT INTO gear_categories (name) VALUES (?)').run(name);
  res.json({ success: true, id: info.lastInsertRowid });
});

app.delete('/api/gear/categories/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM gear_categories WHERE id = ?').run(id);
  res.json({ success: true });
});

app.post('/api/gear/items', requireAdmin, (req, res) => {
  const { category_id, name } = req.body;
  const info = db.prepare('INSERT INTO gear_items (category_id, name) VALUES (?, ?)').run(category_id, name);
  res.json({ success: true, id: info.lastInsertRowid });
});

app.delete('/api/gear/items/:id', requireAdmin, (req, res) => {
  const { id } = req.params;
  db.prepare('DELETE FROM gear_items WHERE id = ?').run(id);
  res.json({ success: true });
});


// Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serving (if needed, but dev is priority)
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
