import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'api', 'db.json');

export function readDB() {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return {
      users: [],
      avito_settings: {},
      bookings: [],
      resources: []
    };
  }
}

export function writeDB(data) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('DB write error:', error);
    return false;
  }
}