import { createServerFn } from '@tanstack/react-start'
import { eq, sql } from 'drizzle-orm'
import { db } from '@/db'
import { users } from '@/db/schema'

export function hashPin(pin: string): string {
  let h1 = 0xdeadbeef ^ 0
  let h2 = 0x41c64e6d ^ 0
  const str = `bk_salt_pin_${pin.trim()}`
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i)
    h1 = Math.imul(h1 ^ ch, 2654435761)
    h2 = Math.imul(h2 ^ ch, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16)
}

export const registerUser = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      name: string
      grade: string
      role: 'siswa' | 'guru_bk'
      pin: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const name = data.name.trim()
    const grade = data.grade.trim()
    const pin = data.pin.trim()
    const role = data.role

    if (!name) throw new Error('Nama lengkap wajib diisi.')
    if (!grade) throw new Error(role === 'guru_bk' ? 'Jabatan/Bidang wajib diisi.' : 'Kelas wajib diisi.')
    if (!pin || pin.length < 4) throw new Error('PIN minimal 4 digit.')

    // Check if name already exists (case-insensitive)
    const existing = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.name}) = LOWER(${name})`)
      .limit(1)

    if (existing.length > 0) {
      throw new Error('Nama ini sudah terdaftar. Silakan login atau gunakan nama lain.')
    }

    const newId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const newUser = {
      id: newId,
      name,
      role,
      grade,
      pin: hashPin(pin),
      address: '',
      phone: '',
      bio: role === 'guru_bk' ? 'Guru BK pendamping siswa.' : 'Siswa BK Bersama.',
      avatarUrl: null,
      joinedAt: new Date(),
    }

    await db.insert(users).values(newUser)

    return {
      user: {
        id: newUser.id,
        name: newUser.name,
        role: newUser.role,
        grade: newUser.grade,
        address: newUser.address,
        phone: newUser.phone,
        bio: newUser.bio,
        avatarUrl: newUser.avatarUrl,
      },
    }
  })

export const loginUser = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      name: string
      pin: string
    }) => data,
  )
  .handler(async ({ data }) => {
    const name = data.name.trim()
    const pin = data.pin.trim()

    if (!name) throw new Error('Nama lengkap wajib diisi.')
    if (!pin) throw new Error('PIN wajib diisi.')

    const matching = await db
      .select()
      .from(users)
      .where(sql`LOWER(${users.name}) = LOWER(${name})`)
      .limit(1)

    if (matching.length === 0) {
      throw new Error('Akun dengan nama tersebut tidak ditemukan. Silakan periksa kembali atau buat akun baru.')
    }

    const user = matching[0]

    // If user has an existing PIN, verify it
    if (user.pin && user.pin !== '') {
      const hashed = hashPin(pin)
      if (user.pin !== hashed && user.pin !== pin) {
        throw new Error('PIN yang Anda masukkan salah. Silakan coba lagi.')
      }
    } else {
      // Legacy user without PIN: set their PIN now
      await db
        .update(users)
        .set({ pin: hashPin(pin) })
        .where(eq(users.id, user.id))
    }

    return {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        grade: user.grade,
        address: user.address,
        phone: user.phone,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      },
    }
  })

export const getCurrentUser = createServerFn({ method: 'POST' })
  .inputValidator((data?: { userId?: string }) => data || {})
  .handler(async ({ data }) => {
    const userId = data?.userId?.trim()
    if (!userId) return { user: null }

    const found = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (found.length === 0) return { user: null }

    const user = found[0]
    return {
      user: {
        id: user.id,
        name: user.name,
        role: user.role,
        grade: user.grade,
        address: user.address,
        phone: user.phone,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
      },
    }
  })
