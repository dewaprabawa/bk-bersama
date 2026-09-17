import { createServerFn } from '@tanstack/react-start'
import { desc, eq, inArray } from 'drizzle-orm'
import { db } from '@/db'
import { stories, comments, likes, users } from '@/db/schema'
import type { Category, Story, Comment } from '@/lib/fixtures'

export function formatTimeAgo(date: Date | string | number): string {
  const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date
  const now = new Date()
  const seconds = Math.max(0, Math.floor((now.getTime() - d.getTime()) / 1000))

  if (seconds < 60) return 'Baru saja'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days} hari lalu`
  const months = Math.floor(days / 30)
  return `${months} bulan lalu`
}

export const getStories = createServerFn({ method: 'GET' })
  .inputValidator((data?: { userId?: string }) => data)
  .handler(async ({ data }): Promise<Story[]> => {
    let currentUserId: string | null = null
    let isWatcher = false

    if (data?.userId && data.userId.trim()) {
      currentUserId = data.userId.trim()
      const userList = await db.select().from(users).where(eq(users.id, currentUserId)).limit(1)
      const currentUser = userList[0]
      isWatcher = currentUser?.role === 'guru_bk'
    }

    const allStories = await db.select().from(stories).orderBy(desc(stories.createdAt))

    if (allStories.length === 0) return []

    const storyIds = allStories.map((s) => s.id)

    const allComments = await db
      .select()
      .from(comments)
      .where(inArray(comments.storyId, storyIds))
      .orderBy(comments.createdAt)

    const allLikes = await db
      .select()
      .from(likes)
      .where(inArray(likes.storyId, storyIds))

    const commentsByStoryId = new Map<string, Comment[]>()
    for (const c of allComments) {
      const list = commentsByStoryId.get(c.storyId) || []
      list.push({
        id: c.id,
        author: c.authorName,
        authorId: c.authorId,
        timeAgo: formatTimeAgo(c.createdAt),
        text: c.text,
        canDelete: isWatcher || (Boolean(currentUserId) && c.authorId === currentUserId),
      })
      commentsByStoryId.set(c.storyId, list)
    }

    const likesCountByStoryId = new Map<string, number>()
    const userLikedStoryIds = new Set<string>()
    for (const l of allLikes) {
      likesCountByStoryId.set(l.storyId, (likesCountByStoryId.get(l.storyId) || 0) + 1)
      if (currentUserId && l.userId === currentUserId) {
        userLikedStoryIds.add(l.storyId)
      }
    }

    return allStories.map((s) => ({
      id: s.id,
      author: s.isAnonymous ? 'Anonim' : s.authorName,
      authorId: s.authorId,
      isAnonymous: s.isAnonymous,
      grade: s.grade,
      avatarLetter: s.avatarLetter,
      avatarHue: s.avatarHue,
      timeAgo: formatTimeAgo(s.createdAt),
      title: s.title,
      excerpt: s.excerpt,
      content: s.content,
      tag: s.tag as Category,
      likes: likesCountByStoryId.get(s.id) || 0,
      isLiked: userLikedStoryIds.has(s.id),
      mine: Boolean(currentUserId) && s.authorId === currentUserId,
      isProtected: s.isProtected,
      canDelete: isWatcher || (Boolean(currentUserId) && s.authorId === currentUserId),
      comments: commentsByStoryId.get(s.id) || [],
    }))
  })

export const getStoryById = createServerFn({ method: 'GET' })
  .inputValidator((data: { id: string; userId?: string }) => data)
  .handler(async ({ data }): Promise<{ story: Story | null; isLiked: boolean; isWatcher: boolean }> => {
    let currentUserId: string | null = null
    let isWatcher = false

    if (data.userId && data.userId.trim()) {
      currentUserId = data.userId.trim()
      const userList = await db.select().from(users).where(eq(users.id, currentUserId)).limit(1)
      const currentUser = userList[0]
      isWatcher = currentUser?.role === 'guru_bk'
    }

    const found = await db.select().from(stories).where(eq(stories.id, data.id)).limit(1)
    if (found.length === 0) return { story: null, isLiked: false, isWatcher }

    const s = found[0]

    const storyComments = await db
      .select()
      .from(comments)
      .where(eq(comments.storyId, s.id))
      .orderBy(comments.createdAt)

    const storyLikes = await db.select().from(likes).where(eq(likes.storyId, s.id))

    const isLiked = Boolean(currentUserId) && storyLikes.some((l) => l.userId === currentUserId)

    const mappedComments: Comment[] = storyComments.map((c) => ({
      id: c.id,
      author: c.authorName,
      authorId: c.authorId,
      timeAgo: formatTimeAgo(c.createdAt),
      text: c.text,
      canDelete: isWatcher || (Boolean(currentUserId) && c.authorId === currentUserId),
    }))

    const story: Story = {
      id: s.id,
      author: s.isAnonymous ? 'Anonim' : s.authorName,
      authorId: s.authorId,
      isAnonymous: s.isAnonymous,
      grade: s.grade,
      avatarLetter: s.avatarLetter,
      avatarHue: s.avatarHue,
      timeAgo: formatTimeAgo(s.createdAt),
      title: s.title,
      excerpt: s.excerpt,
      content: s.content,
      tag: s.tag as Category,
      likes: storyLikes.length,
      mine: Boolean(currentUserId) && s.authorId === currentUserId,
      isProtected: s.isProtected,
      canDelete: isWatcher || (Boolean(currentUserId) && s.authorId === currentUserId),
      comments: mappedComments,
    }

    return { story, isLiked, isWatcher }
  })

export const createStory = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: {
      userId: string
      title: string
      content: string
      tag: Category
      anonymous: boolean
    }) => data,
  )
  .handler(async ({ data }) => {
    if (!data.userId || !data.userId.trim()) {
      throw new Error('Silakan buat atau pilih akun pengguna terlebih dahulu di Menu Admin.')
    }

    const userList = await db.select().from(users).where(eq(users.id, data.userId.trim())).limit(1)
    if (userList.length === 0) {
      throw new Error('Akun pengguna tidak ditemukan. Silakan tambahkan di Menu Admin.')
    }

    const currentUser = userList[0]

    const paragraphs = data.content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const newId = `cerita-${Date.now()}`
    const avatarLetter = data.anonymous ? '?' : currentUser.name.charAt(0)
    const avatarHue = data.anonymous ? 35 : 205
    const excerpt = (paragraphs[0] || data.title).slice(0, 140)

    await db.insert(stories).values({
      id: newId,
      authorId: currentUser.id,
      authorName: currentUser.name,
      grade: currentUser.grade,
      isAnonymous: data.anonymous,
      avatarLetter,
      avatarHue,
      title: data.title.trim(),
      excerpt,
      content: paragraphs.length > 0 ? paragraphs : [data.content],
      tag: data.tag,
      isProtected: true, // Monitored by default to prevent bullying
      createdAt: new Date(),
    })

    return { id: newId }
  })

export const deleteStory = createServerFn({ method: 'POST' })
  .inputValidator((data: { storyId: string; userId: string }) => data)
  .handler(async ({ data }) => {
    if (!data.userId || !data.userId.trim()) {
      throw new Error('User ID tidak valid.')
    }

    const userList = await db.select().from(users).where(eq(users.id, data.userId.trim())).limit(1)
    const caller = userList[0]
    const isWatcher = caller?.role === 'guru_bk'

    const target = await db.select().from(stories).where(eq(stories.id, data.storyId)).limit(1)
    if (target.length === 0) {
      throw new Error('Cerita tidak ditemukan.')
    }

    const story = target[0]
    if (story.authorId !== data.userId.trim() && !isWatcher) {
      throw new Error('Kamu tidak memiliki izin untuk menghapus cerita ini.')
    }

    await db.delete(stories).where(eq(stories.id, data.storyId))
    return { success: true }
  })

export const deleteComment = createServerFn({ method: 'POST' })
  .inputValidator((data: { commentId: string; userId: string }) => data)
  .handler(async ({ data }) => {
    if (!data.userId || !data.userId.trim()) {
      throw new Error('User ID tidak valid.')
    }

    const userList = await db.select().from(users).where(eq(users.id, data.userId.trim())).limit(1)
    const caller = userList[0]
    const isWatcher = caller?.role === 'guru_bk'

    const target = await db.select().from(comments).where(eq(comments.id, data.commentId)).limit(1)
    if (target.length === 0) {
      throw new Error('Komentar tidak ditemukan.')
    }

    const comment = target[0]
    if (comment.authorId !== data.userId.trim() && !isWatcher) {
      throw new Error('Kamu tidak memiliki izin untuk menghapus komentar ini.')
    }

    await db.delete(comments).where(eq(comments.id, data.commentId))
    return { success: true }
  })

export const toggleStoryProtection = createServerFn({ method: 'POST' })
  .inputValidator((data: { storyId: string; userId: string }) => data)
  .handler(async ({ data }) => {
    if (!data.userId || !data.userId.trim()) {
      throw new Error('User ID tidak valid.')
    }

    const userList = await db.select().from(users).where(eq(users.id, data.userId.trim())).limit(1)
    const caller = userList[0]

    if (caller?.role !== 'guru_bk') {
      throw new Error('Hanya Guru BK / Watcher yang dapat mengatur status pengawasan.')
    }

    const target = await db.select().from(stories).where(eq(stories.id, data.storyId)).limit(1)
    if (target.length === 0) throw new Error('Cerita tidak ditemukan.')

    const updated = !target[0].isProtected
    await db.update(stories).set({ isProtected: updated }).where(eq(stories.id, data.storyId))
    return { isProtected: updated }
  })

export const toggleStoryLike = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { storyId: string; userId: string; userName?: string }) => data,
  )
  .handler(async ({ data }) => {
    if (!data.userId || !data.userId.trim()) {
      throw new Error('Silakan pilih akun pengguna terlebih dahulu.')
    }

    const callerId = data.userId.trim()

    // Ensure user exists in database so foreign key doesn't fail
    const userList = await db.select().from(users).where(eq(users.id, callerId)).limit(1)
    if (userList.length === 0) {
      await db.insert(users).values({
        id: callerId,
        name: data.userName?.trim() || 'Siswa',
        grade: 'Siswa',
        role: 'siswa',
        joinedAt: new Date(),
      })
    }

    const existing = await db
      .select()
      .from(likes)
      .where(eq(likes.storyId, data.storyId))

    const userLike = existing.find((l) => l.userId === callerId)

    if (userLike) {
      await db.delete(likes).where(eq(likes.id, userLike.id))
      return { liked: false, likesCount: Math.max(0, existing.length - 1) }
    } else {
      await db.insert(likes).values({
        id: `like-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        storyId: data.storyId,
        userId: callerId,
      })
      return { liked: true, likesCount: existing.length + 1 }
    }
  })

export const createComment = createServerFn({ method: 'POST' })
  .inputValidator(
    (data?: { storyId?: string; text?: string; userId?: string; userName?: string }) => data || {},
  )
  .handler(async ({ data }) => {
    const payload = data || {}
    const storyId = payload.storyId?.trim()
    const text = payload.text?.trim()

    if (!storyId) {
      throw new Error('ID cerita tidak valid.')
    }
    if (!text) {
      throw new Error('Isi komentar tidak boleh kosong.')
    }

    // Verify target story exists in database
    const storyList = await db.select().from(stories).where(eq(stories.id, storyId)).limit(1)
    if (storyList.length === 0) {
      throw new Error('Cerita tidak ditemukan.')
    }

    let callerId = payload.userId?.trim()
    let authorName = payload.userName?.trim() || 'Siswa'

    if (callerId) {
      const userList = await db.select().from(users).where(eq(users.id, callerId)).limit(1)
      if (userList.length === 0) {
        await db.insert(users).values({
          id: callerId,
          name: authorName,
          grade: 'Siswa',
          role: 'siswa',
          joinedAt: new Date(),
        })
      } else {
        authorName = userList[0].name
      }
    } else {
      callerId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      await db.insert(users).values({
        id: callerId,
        name: authorName,
        grade: 'Siswa',
        role: 'siswa',
        joinedAt: new Date(),
      })
    }

    const commentId = `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const newComment = {
      id: commentId,
      storyId,
      authorId: callerId,
      authorName,
      text,
      createdAt: new Date(),
    }
    await db.insert(comments).values(newComment)

    return {
      id: commentId,
      author: authorName,
      authorId: callerId,
      timeAgo: 'Baru saja',
      text,
      canDelete: true,
    }
  })

