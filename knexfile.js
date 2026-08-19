import 'dotenv/config';

export default {
  development: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    migrations: {
      directory: './src/db/migrations',
      stub: './src/db/migration.stub',
    },
    seeds: {
      directory: './src/db/seeds',
      stub: './src/db/seed.stub',
    },
    pool: {
      min: 2,
      max: 10, // Keeps up to 10 active database connections open
    },
  },

  production: {
    client: 'pg',
    connection: {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required by most cloud Postgres providers (e.g., Render, Supabase, Railway)
    },
    migrations: {
      directory: './src/db/migrations',
    },
    pool: {
      min: 2,
      max: 20,
    },
  },
};