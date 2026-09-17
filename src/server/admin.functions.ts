import { createServerFn } from '@tanstack/react-start'
import { getUsersCollection, getStoriesCollection } from '@/db'
import type { UserDoc } from '@/db/schema'

export const getUsersList = createServerFn({ method: 'GET' }).handler(async () => {
  const users = await getUsersCollection()
  const stories = await getStoriesCollection()

  const allUsers = await users.find({}).sort({ joinedAt: -1 }).toArray()

  // Compute story count for each user
  const allStories = await stories.find({}, { projection: { authorId: 1 } }).toArray()
  const countByUserId = new Map<string, number>()
  for (const s of allStories) {
    if (s.authorId) {
      countByUserId.set(s.authorId, (countByUserId.get(s.authorId) || 0) + 1)
    }
  }

  return allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role,
    grade: u.grade,
    address: u.address,
    phone: u.phone,
    bio: u.bio,
    avatarUrl: u.avatarUrl,
    joinedAt: u.joinedAt,
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

    const users = await getUsersCollection()
    const newId = `user-${Date.now()}`
    const newUser: UserDoc = {
      id: newId,
      name: data.name.trim(),
      role: data.role,
      grade: data.grade.trim(),
      phone: data.phone?.trim() || '',
      bio: data.bio?.trim() || '',
      address: '',
      pin: '',
      avatarUrl: null,
      joinedAt: new Date(),
    }

    await users.insertOne(newUser)
    return newUser
  })

export const deleteMember = createServerFn({ method: 'POST' })
  .inputValidator((data: { userId: string }) => data)
  .handler(async ({ data }) => {
    const users = await getUsersCollection()
    await users.deleteOne({ id: data.userId })
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
    const users = await getUsersCollection()

    // 1. Check if user already exists
    if (requestedId && requestedId !== 'undefined' && requestedId !== 'null') {
      const existing = await users.findOne({ id: requestedId })
      if (existing) {
        return {
          user: {
            id: existing.id,
            name: existing.name,
            role: existing.role,
            grade: existing.grade,
            address: existing.address,
            phone: existing.phone,
            bio: existing.bio,
            pin: existing.pin,
            avatarUrl: existing.avatarUrl,
            joinedAt: existing.joinedAt,
          },
          isNew: false,
        }
      }
    }

    // 2. Fresh visitor account fallback
    const allUsers = await users.find({}, { projection: { id: 1 } }).limit(1).toArray()
    let role: string = payload.initialRole || 'siswa'
    let name = payload.initialName?.trim() || `Siswa #${Math.floor(1000 + Math.random() * 9000)}`
    let grade = 'Siswa'

    if (allUsers.length === 0) {
      name = 'Dewa Prabawa'
      role = 'guru_bk'
      grade = 'Guru Pembina BK'
    }

    const newId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const newUser: UserDoc = {
      id: newId,
      name,
      role,
      grade,
      address: '',
      phone: '',
      bio: role === 'guru_bk' ? 'Guru BK pendamping siswa.' : 'Siswa BK Bersama.',
      pin: '',
      avatarUrl: null,
      joinedAt: new Date(),
    }

    await users.insertOne(newUser)
    return { user: newUser, isNew: true }
  })
