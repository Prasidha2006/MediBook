import { PrismaClient } from '@prisma/client';
import { localStore } from '../services/localStore.js';
import { config } from './index.js';

let prismaInstance = null;
let isPostgresConnected = false;

// Initialize Prisma if DATABASE_URL is configured
if (config.databaseUrl && !config.databaseUrl.includes('localhost:5432')) {
  try {
    prismaInstance = new PrismaClient({
      log: config.env === 'development' ? ['warn', 'error'] : ['error'],
    });
  } catch (err) {
    console.warn('[DB] Prisma initialization deferred:', err.message);
  }
}

export async function initDatabase() {
  if (config.databaseUrl) {
    try {
      if (!prismaInstance) {
        prismaInstance = new PrismaClient();
      }
      await prismaInstance.$connect();
      isPostgresConnected = true;
      console.log('✅ [DB] Connected successfully to PostgreSQL via Prisma ORM.');
    } catch (err) {
      console.warn(`⚠️  [DB] PostgreSQL connection attempt failed (${err.message}).`);
      console.log('ℹ️  [DB] Operating in high-fidelity local persistent store mode.');
      isPostgresConnected = false;
    }
  } else {
    console.log('ℹ️  [DB] No DATABASE_URL set. Operating in high-fidelity local persistent store mode.');
    isPostgresConnected = false;
  }
}

export const getPrisma = () => prismaInstance;
export const isPrismaActive = () => isPostgresConnected;

export { localStore };
