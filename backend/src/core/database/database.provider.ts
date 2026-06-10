import { Provider } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/mysql2';
import * as mysql from 'mysql2/promise';
import * as schema from '../../db/schema';

export const DRIZZLE_PROVIDER = 'DRIZZLE_PROVIDER';

export const DatabaseProvider: Provider = {
  provide: DRIZZLE_PROVIDER,
  useFactory: async () => {
    // Read config directly from env variables (populated via .env configuration)
    const host = process.env.DATABASE_HOST || 'localhost';
    const port = Number(process.env.DATABASE_PORT) || 3306;
    const user = process.env.DATABASE_USER || 'root';
    const password = process.env.DATABASE_PASSWORD || '';
    const database = process.env.DATABASE_NAME || 'achi_db';

    const connectionPool = mysql.createPool({
      host,
      port,
      user,
      password,
      database,
      connectionLimit: 10, // Pool size for database efficiency
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    return drizzle(connectionPool, { schema, mode: 'default' });
  },
};
