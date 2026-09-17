import { createServerFn } from '@tanstack/react-start'
import { getCounselingRequestsCollection, getUsersCollection } from '@/db'
import type { CounselingRequestDoc } from '@/db/schema'

export const getCounselingRequests = createServerFn({ method: 'GET' })
  .inputValidator((data?: { userId?: string; role?: string }) => data || {})
  .handler(async ({ data }) => {
    const payload = data || {}
    const crCol = await getCounselingRequestsCollection()

    const formatRequest = (r: CounselingRequestDoc): CounselingRequestDoc => ({
      id: r.id,
      studentId: r.studentId,
      studentName: r.studentName,
      counselorId: r.counselorId,
      counselorName: r.counselorName,
      topic: r.topic,
      message: r.message,
      preferredDate: r.preferredDate,
      preferredTime: r.preferredTime,
      status: r.status,
      counselorNote: r.counselorNote,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    })

    if (payload.role === 'guru_bk') {
      // Guru BK sees all requests
      const rows = await crCol.find({}).sort({ createdAt: -1 }).toArray()
      return rows.map(formatRequest)
    }

    if (payload.userId) {
      // Student sees only their own requests
      const rows = await crCol
        .find({ studentId: payload.userId })
        .sort({ createdAt: -1 })
        .toArray()
      return rows.map(formatRequest)
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

    const users = await getUsersCollection()
    const crCol = await getCounselingRequestsCollection()

    // Find a counselor (guru_bk) to assign
    const counselor = await users.findOne({ role: 'guru_bk' })

    const id = `cr-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const now = new Date()

    const newRequest: CounselingRequestDoc = {
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

    await crCol.insertOne(newRequest)
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

    const crCol = await getCounselingRequestsCollection()

    await crCol.updateOne(
      { id: data.requestId },
      {
        $set: {
          status: data.status,
          counselorNote: data.counselorNote?.trim() || null,
          counselorId: data.counselorId,
          counselorName: data.counselorName,
          updatedAt: new Date(),
        },
      },
    )

    return { success: true, status: data.status }
  })
