import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve('database.db');
const db = new Database(dbPath);

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS upcoming_expedition (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      title TEXT,
      description TEXT,
      elevation TEXT,
      distance TEXT,
      duration TEXT,
      shelter TEXT,
      region TEXT,
      highlights TEXT,
      route_gpx TEXT,
      center_lat REAL,
      center_lng REAL,
      zoom INTEGER,
      image TEXT
    );

    CREATE TABLE IF NOT EXISTS past_trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      date TEXT,
      location TEXT,
      elevation TEXT,
      image TEXT,
      description TEXT,
      route_gpx TEXT,
      center_lat REAL,
      center_lng REAL,
      zoom INTEGER
    );

    CREATE TABLE IF NOT EXISTS past_trip_gallery (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER,
      image_url TEXT,
      FOREIGN KEY(trip_id) REFERENCES past_trips(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS itinerary_days (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      day_number INTEGER,
      title TEXT,
      description TEXT,
      km TEXT,
      elevation_gain TEXT,
      elevation_loss TEXT,
      shelter TEXT,
      water_source BOOLEAN,
      food_source BOOLEAN,
      store_source BOOLEAN,
      difficulty TEXT,
      komoot_link TEXT,
      gpx_url TEXT,
      color TEXT
    );

    CREATE TABLE IF NOT EXISTS gear_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT
    );

    CREATE TABLE IF NOT EXISTS gear_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER,
      name TEXT,
      FOREIGN KEY(category_id) REFERENCES gear_categories(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS site_settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  try {
    db.exec("ALTER TABLE upcoming_expedition ADD COLUMN image TEXT");
  } catch (e) {
    // Column likely already exists
  }

  try {
    db.exec("ALTER TABLE itinerary_days ADD COLUMN store_source BOOLEAN");
  } catch (e) {
    // Column likely already exists
  }

  db.exec(`
    INSERT OR IGNORE INTO upcoming_expedition (id, title, description, elevation, distance, duration, shelter, region, highlights, route_gpx, center_lat, center_lng, zoom, image)
    VALUES (
      1,
      'MATTERHORN ASCENT',
      'A technical climb via the Hörnli Ridge. High altitude exposure and mixed terrain.',
      '4,478m',
      '18km',
      '2 Days',
      'Hörnlihütte',
      'Valais, CH',
      '["Glacier Crossing", "Ridge Scramble", "Technical Rock", "Exposed"]',
      NULL,
      46.0000,
      7.7300,
      13,
      NULL
    );
  `);

  // Check if past_trips is empty, if so, seed it
  const count = db.prepare('SELECT count(*) as count FROM past_trips').get() as { count: number };
  if (count.count === 0) {
    const insertTrip = db.prepare(`
      INSERT INTO past_trips (name, date, location, elevation, image, description, route_gpx, center_lat, center_lng, zoom)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const trips = [
      {
        name: 'Monte Rosa Massif',
        date: 'Aug 2025',
        location: 'Italy/Switzerland',
        elevation: '4,634m',
        image: '',
        description: 'A multi-day traverse across the second highest massif in the Alps. Challenging glacier travel and high altitude camps.',
        route_gpx: null,
        center_lat: 45.9369,
        center_lng: 7.8668,
        zoom: 12
      },
      {
        name: 'Gran Paradiso',
        date: 'Jul 2025',
        location: 'Aosta Valley',
        elevation: '4,061m',
        image: '',
        description: 'The only 4000m peak entirely within Italy. A classic snow climb with a rocky summit block.',
        route_gpx: null,
        center_lat: 45.5203,
        center_lng: 7.2656,
        zoom: 12
      },
      {
        name: 'Weissmies Traverse',
        date: 'Jun 2025',
        location: 'Saas-Fee',
        elevation: '4,017m',
        image: '',
        description: 'A beautiful traverse ascending the SE ridge and descending the normal route. Spectacular views of the Mischabel group.',
        route_gpx: null,
        center_lat: 46.1283,
        center_lng: 8.0125,
        zoom: 12
      },
      {
        name: 'Dom des Mischabel',
        date: 'Sep 2024',
        location: 'Randa',
        elevation: '4,545m',
        image: '',
        description: 'The highest mountain entirely in Switzerland. A long, demanding ascent requiring excellent fitness.',
        route_gpx: null,
        center_lat: 46.0942,
        center_lng: 7.8586,
        zoom: 12
      },
      {
        name: 'Piz Bernina',
        date: 'Aug 2024',
        location: 'Engadin',
        elevation: '4,049m',
        image: '',
        description: 'The most easterly 4000er in the Alps. Famous for the Biancograt, a stunning white ridge.',
        route_gpx: null,
        center_lat: 46.3822,
        center_lng: 9.9081,
        zoom: 12
      },
      {
        name: 'Dent Blanche',
        date: 'Jul 2024',
        location: "Val d'Hérens",
        elevation: '4,357m',
        image: '',
        description: 'A perfect pyramid of rock and ice. One of the most difficult 4000m peaks in the Alps.',
        route_gpx: null,
        center_lat: 46.0306,
        center_lng: 7.6086,
        zoom: 12
      }
    ];

    trips.forEach(trip => {
      const info = insertTrip.run(
        trip.name, trip.date, trip.location, trip.elevation, trip.image, trip.description,
        trip.route_gpx, trip.center_lat, trip.center_lng, trip.zoom
      );
      
      // Add some gallery images for each trip
      // const insertGallery = db.prepare('INSERT INTO past_trip_gallery (trip_id, image_url) VALUES (?, ?)');
      // for (let i = 1; i <= 4; i++) {
      //   insertGallery.run(info.lastInsertRowid, `https://picsum.photos/seed/${info.lastInsertRowid}-${i}/400/400`);
      // }
    });
  }
}

export default db;
