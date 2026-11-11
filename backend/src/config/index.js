import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    secret: process.env.JWT_SECRET || 'medibook_super_secret_jwt_access_token_key_2026_xyz',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'medibook_super_secret_refresh_token_key_2026_abc',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    cookieName: 'medibook_token',
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  isProd: process.env.NODE_ENV === 'production',
};
