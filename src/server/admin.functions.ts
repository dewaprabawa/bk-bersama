import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { users, stories } from '@/db/schema'

export const getUsersList = createServerFn({ method: 'GET' }).handler(async () => {
  const allUsers = await db.select().from(users).orderBy(desc(users.joinedAt))

  // Compute story count for each user
  const allStories = await db.select({ authorId: stories.authorId }).from(stories)
  const countByUserId = new Map<string, number>()
  for (const s of allStories) {
    if (s.authorId) {
      countByUserId.set(s.authorId, (countByUserId.get(s.authorId) || 0) + 1)
    }
  }

  return allUsers.map((u) => ({
    ...u,
    storiesCount: countByUserId.get(u.id) || 0,
  }))
})

export const createMember = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      name: string
      role: 'siswa' | 'guru_bk'
      grade: string
      phone?: string
      bio?: string
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!data.name.trim() || !data.grade.trim()) {
      throw new Error('Nama dan Kelas/Jabatan wajib diisi.')
    }

    const newId = `user-${Date.now()}`
    const newUser = {
      id: newId,
      name: data.name.trim(),
      role: data.role,
      grade: data.grade.trim(),
      phone: data.phone?.trim() || '',
      bio: data.bio?.trim() || '',
      avatarUrl: null,
      joinedAt: new Date(),
    }

    await db.insert(users).values(newUser)
    return newUser
  })

export const deleteMember = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    await db.delete(users).where(eq(users.id, data.userId))
    return { success: true }
  })
