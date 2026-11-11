import app from '../src/app.js';
import { initDatabase } from '../src/config/db.js';

let initialized = false;

export default async function handler(req, res) {
  if (!initialized) {
    try {
      await initDatabase();
      initialized = true;
    } catch (e) {
      console.warn('Vercel initialization notice:', e.message);
    }
  }
  return app(req, res);
}
