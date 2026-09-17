import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url:
      process.env.DATABASE_URL ||
      process.env.NETLIFY_DATABASE_URL ||
      'postgresql://netlifydb_owner:npg_0LKqZwDcl8pt@ep-hidden-bonus-b5zc724b.c-7.us-east-2.db.netlify.com/netlifydb?sslmode=require',
  },
})

