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

let clientPromise: Promise<MongoClient>

if (!globalThis._mongoClientPromise) {
  const client = new MongoClient(uri)
  globalThis._mongoClientPromise = client.connect()
}
clientPromise = globalThis._mongoClientPromise

export async function getDb(): Promise<Db> {
  const client = await clientPromise
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
