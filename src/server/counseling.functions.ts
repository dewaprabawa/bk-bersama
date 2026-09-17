import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { counselingRequests, users } from '@/db/schema'

export const getCounselingRequests = createServerFn({ method: 'GET' })
  .inputValidator((data?: { userId?: string; role?: string }) => data || {})
  .handler(async ({ data }) => {
    const payload = data || {}

    if (payload.role === 'guru_bk') {
      // Guru BK sees all requests
      const rows = await db
        .select()
        .from(counselingRequests)
        .orderBy(desc(counselingRequests.createdAt))
      return rows
    }

    if (payload.userId) {
      // Student sees only their own requests
      const rows = await db
        .select()
        .from(counselingRequests)
        .where(eq(counselingRequests.studentId, payload.userId))
        .orderBy(desc(counselingRequests.createdAt))
      return rows
    }

    return []
  })

export const createCounselingRequest = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      studentId: string
      studentName: string
      topic: string
      message: string
      preferredDate: string
      preferredTime: string
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!data.studentId || !data.topic.trim() || !data.message.trim()) {
      throw new Error('Topik dan pesan wajib diisi.')
    }
    if (!data.preferredDate || !data.preferredTime) {
      throw new Error('Tanggal dan jam konseling wajib dipilih.')
    }

    // Find a counselor (guru_bk) to assign
    const counselors = await db
      .select()
      .from(users)
      .where(eq(users.role, 'guru_bk'))
      .limit(1)

    const counselor = counselors[0] || null

    const id = `cr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const now = new Date()

    const newRequest = {
      id,
      studentId: data.studentId,
      studentName: data.studentName,
      counselorId: counselor?.id || null,
      counselorName: counselor?.name || null,
      topic: data.topic.trim(),
      message: data.message.trim(),
      preferredDate: data.preferredDate,
      preferredTime: data.preferredTime,
      status: 'pending',
      counselorNote: null,
      createdAt: now,
      updatedAt: now,
    }

    await db.insert(counselingRequests).values(newRequest)
    return newRequest
  })

export const updateCounselingStatus = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      requestId: string
      status: 'accepted' | 'rejected'
      counselorNote?: string
      counselorId: string
      counselorName: string
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!data.requestId || !data.status) {
      throw new Error('Request ID dan status wajib diisi.')
    }

    await db
      .update(counselingRequests)
      .set({
        status: data.status,
        counselorNote: data.counselorNote?.trim() || null,
        counselorId: data.counselorId,
        counselorName: data.counselorName,
        updatedAt: new Date(),
      })
      .where(eq(counselingRequests.id, data.requestId))

    return { success: true, status: data.status }
  })
