import { defineConfig } from 'drizzle-kit';
declare const process: any;

export default defineConfig({
  schema: './src/db/schema/index.ts',
  out: './src/db/migrations',
  dialect: 'mysql',
  dbCredentials: {
    host: process.env.DATABASE_HOST || 'localhost',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || 'password',
    database: process.env.DATABASE_NAME || 'fashion_db',
    port: Number(process.env.DATABASE_PORT) || 3306,
  },
});
