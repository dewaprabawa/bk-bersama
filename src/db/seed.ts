import { db } from './index'
import { users, stories, comments, likes, inspirations } from './schema'

export async function clearAllDatabaseData() {
  console.log('Clearing all tables: likes, comments, stories, inspirations, and users...')
  await db.delete(likes)
  await db.delete(comments)
  await db.delete(stories)
  await db.delete(inspirations)
  await db.delete(users)
  console.log('All tables are now completely empty. No default users exist.')
}

if (process.argv[1]?.includes('seed')) {
  clearAllDatabaseData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
