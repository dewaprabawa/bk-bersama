import {
  getLikesCollection,
  getCommentsCollection,
  getStoriesCollection,
  getInspirationsCollection,
  getUsersCollection,
  getCounselingRequestsCollection,
} from './index'

export async function clearAllDatabaseData() {
  console.log('Clearing all collections: likes, comments, stories, inspirations, users, counseling_requests...')
  const [likes, comments, stories, inspirations, users, counseling] = await Promise.all([
    getLikesCollection(),
    getCommentsCollection(),
    getStoriesCollection(),
    getInspirationsCollection(),
    getUsersCollection(),
    getCounselingRequestsCollection(),
  ])

  await Promise.all([
    likes.deleteMany({}),
    comments.deleteMany({}),
    stories.deleteMany({}),
    inspirations.deleteMany({}),
    users.deleteMany({}),
    counseling.deleteMany({}),
  ])
  console.log('All collections are now completely empty.')
}

if (process.argv[1]?.includes('seed')) {
  clearAllDatabaseData()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
