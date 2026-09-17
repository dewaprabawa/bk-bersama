import 'dotenv/config'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString =
  process.env.DATABASE_URL ||
  process.env.NETLIFY_DATABASE_URL ||
  'postgresql://netlifydb_owner:npg_0LKqZwDcl8pt@ep-hidden-bonus-b5zc724b.c-7.us-east-2.db.netlify.com/netlifydb?sslmode=require'

const client = postgres(connectionString, { prepare: false })

export const db = drizzle(client, { schema })
