/* Drizzle client over postgres.js. The connection is created lazily on first
   query so that importing this module during `next build` (which traces route
   modules) doesn't require DATABASE_URL to be present. Reused across hot
   reloads in dev so we don't exhaust the pool. Server-only — never import from
   the edge middleware, which must stay DB-free. */

import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
  drizzleDb?: PostgresJsDatabase<typeof schema>;
};

function init(): PostgresJsDatabase<typeof schema> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not set');

  // Serverless-friendly pool. prepare:false plays nicely with Neon's pooler.
  const client = globalForDb.pgClient ?? postgres(connectionString, { max: 5, prepare: false });
  if (process.env.NODE_ENV !== 'production') globalForDb.pgClient = client;

  const d = drizzle(client, { schema });
  if (process.env.NODE_ENV !== 'production') globalForDb.drizzleDb = d;
  return d;
}

// Proxy that initializes the real client on first property access, so the
// throw (if any) happens at query time, not at module import time.
export const db = new Proxy({} as PostgresJsDatabase<typeof schema>, {
  get(_t, prop) {
    const real = globalForDb.drizzleDb ?? init();
    const value = (real as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

export { schema };
