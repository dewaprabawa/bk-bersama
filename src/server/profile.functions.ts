import { createServerFn } from '@tanstack/react-start'
import { eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { users, stories, likes } from '@/db/schema'

export const getProfile = createServerFn({ method: 'GET' })
  .inputValidator((data?: { userId?: string }) => data)
  .handler(async ({ data }) => {
    let user = null

    if (data?.userId && data.userId.trim()) {
      const userList = await db
        .select()
        .from(users)
        .where(eq(users.id, data.userId.trim()))
        .limit(1)
      user = userList[0] || null
    }

    // Fallback to first user in database if target not found
    if (!user) {
      const allUsers = await db.select().from(users).limit(1)
      user = allUsers[0] || null
    }

    if (!user) {
      return {
        user: null,
        storiesCount: 0,
        likesReceived: 0,
        joinedLabel: 'Belum ada akun terdaftar',
      }
    }

    // Get user's stories count
    const myStories = await db
      .select({ id: stories.id })
      .from(stories)
      .where(eq(stories.authorId, user.id))

    const myStoryIds = myStories.map((s) => s.id)

    let likesReceived = 0
    if (myStoryIds.length > 0) {
      const myLikes = await db
        .select({ id: likes.id })
        .from(likes)
        .where(inArray(likes.storyId, myStoryIds))
      likesReceived = myLikes.length
    }

    return {
      user,
      storiesCount: myStories.length,
      likesReceived,
      joinedLabel: `Bergabung ${user.joinedAt.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`,
    }
  })

export const updateProfile = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      userId: string
      name: string
      grade: string
      address: string
      phone: string
      bio: string
      avatarUrl?: string | null
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!data.userId || !data.userId.trim()) {
      throw new Error('User ID wajib disertakan.')
    }

    await db
      .update(users)
      .set({
        name: data.name,
        grade: data.grade,
        address: data.address,
        phone: data.phone,
        bio: data.bio,
        ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
      })
      .where(eq(users.id, data.userId.trim()))

    return { success: true }
  })
