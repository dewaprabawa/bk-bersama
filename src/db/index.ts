import * as nodeCrypto from 'node:crypto'
import { createRequire } from 'node:module'
import { MongoClient, type Db } from 'mongodb'
import dns from 'node:dns'
import type {
  UserDoc,
  StoryDoc,
  CommentDoc,
  LikeDoc,
  InspirationDoc,
  CounselingRequestDoc,
} from './schema'

// Polyfill global require for bundled ESM environments (e.g. Vercel serverless)
// where CJS dependencies like MongoDB driver's SCRAM-SHA-1 rely on dynamic require('crypto')
function setupCryptoRequire() {
  const req = typeof createRequire === 'function' ? createRequire(import.meta.url) : null
  const existingRequire = (globalThis as any).require
  const customRequire = (id: string) => {
    if (id === 'crypto' || id === 'node:crypto') {
      return nodeCrypto
    }
    if (existingRequire) {
      return existingRequire(id)
    }
    if (req) {
      return req(id)
    }
    throw new Error(`Cannot require "${id}" in ES module context`)
  }

  ;(globalThis as any).require = customRequire
  if (typeof global !== 'undefined') {
    ;(global as any).require = customRequire
  }
}

// Call immediately on module evaluation
setupCryptoRequire()

// Set DNS servers to Google / Cloudflare if local SRV resolution fails (especially on Windows)
try {
  dns.setServers(['8.8.8.8', '1.1.1.1'])
} catch {}

const DEFAULT_MONGO_URI =
  'mongodb+srv://pastikadewa6_db_user:qoHoN8pUb8RmtaU2@cluster0.isbkyud.mongodb.net/?appName=Cluster0'

function resolveMongoUri(): string {
  const envUri = process.env.MONGODB_URI?.trim()
  if (envUri && (envUri.startsWith('mongodb://') || envUri.startsWith('mongodb+srv://'))) {
    return envUri
  }

  const dbUrl = process.env.DATABASE_URL?.trim()
  if (dbUrl && (dbUrl.startsWith('mongodb://') || dbUrl.startsWith('mongodb+srv://'))) {
    return dbUrl
  }

  return DEFAULT_MONGO_URI
}

const uri = resolveMongoUri()

const dbName = 'bk_bersama'

// Cache client across serverless invocations and dev reloads
declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

export async function getDb(): Promise<Db> {
  setupCryptoRequire()
  if (!globalThis._mongoClientPromise) {
    const client = new MongoClient(uri)
    globalThis._mongoClientPromise = client.connect()
  }
  const client = await globalThis._mongoClientPromise
  return client.db(dbName)
}

export async function getUsersCollection() {
  const db = await getDb()
  return db.collection<UserDoc>('users')
}

export async function getStoriesCollection() {
  const db = await getDb()
  return db.collection<StoryDoc>('stories')
}

export async function getCommentsCollection() {
  const db = await getDb()
  return db.collection<CommentDoc>('comments')
}

export async function getLikesCollection() {
  const db = await getDb()
  return db.collection<LikeDoc>('likes')
}

export async function getInspirationsCollection() {
  const db = await getDb()
  return db.collection<InspirationDoc>('inspirations')
}

export async function getCounselingRequestsCollection() {
  const db = await getDb()
  return db.collection<CounselingRequestDoc>('counseling_requests')
}
