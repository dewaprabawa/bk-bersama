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

export const getOrCreateDeviceAccount = createServerFn({ method: 'POST' })
  .inputValidator(
    (data?: { deviceUserId?: string; initialRole?: 'siswa' | 'guru_bk'; initialName?: string }) =>
      data || {},
  )
  .handler(async ({ data }) => {
    const payload = data || {}
    const requestedId = payload.deviceUserId?.trim()

    // 1. If deviceUserId was provided and valid, check if that user already exists in DB
    if (requestedId && requestedId !== 'undefined' && requestedId !== 'null') {
      const existing = await db
        .select()
        .from(users)
        .where(eq(users.id, requestedId))
        .limit(1)

      if (existing.length > 0) {
        return { user: existing[0], isNew: false }
      }
    }

    // 2. Fresh visitor: create a unique single account for this device
    const allUsers = await db.select({ id: users.id }).from(users).limit(1)
    let role: string = payload.initialRole || 'siswa'
    let name = payload.initialName?.trim() || `Siswa #${Math.floor(1000 + Math.random() * 9000)}`
    let grade = 'Siswa'

    if (allUsers.length === 0) {
      name = 'Dewa Prabawa'
      role = 'guru_bk'
      grade = 'Guru Pembina BK'
    }

    const newId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const newUser = {
      id: newId,
      name,
      role,
      grade,
      address: '',
      phone: '',
      bio: role === 'guru_bk' ? 'Guru BK pendamping siswa.' : 'Siswa BK Bersama.',
      avatarUrl: null,
      joinedAt: new Date(),
    }

    await db.insert(users).values(newUser)
    return { user: newUser, isNew: true }
  })

