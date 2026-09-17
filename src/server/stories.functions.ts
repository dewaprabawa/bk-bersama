import { createServerFn } from '@tanstack/react-start'
import {
  getStoriesCollection,
  getCommentsCollection,
  getLikesCollection,
  getUsersCollection,
} from '@/db'
import type { StoryDoc, CommentDoc, LikeDoc, UserDoc } from '@/db/schema'
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

    const users = await getUsersCollection()
    const stories = await getStoriesCollection()
    const comments = await getCommentsCollection()
    const likes = await getLikesCollection()

    if (data?.userId && data.userId.trim()) {
      currentUserId = data.userId.trim()
      const currentUser = await users.findOne({ id: currentUserId })
      isWatcher = currentUser?.role === 'guru_bk'
    }

    const allStories = await stories.find({}).sort({ createdAt: -1 }).toArray()

    if (allStories.length === 0) return []

    const storyIds = allStories.map((s) => s.id)

    const allComments = await comments
      .find({ storyId: { $in: storyIds } })
      .sort({ createdAt: 1 })
      .toArray()

    const allLikes = await likes.find({ storyId: { $in: storyIds } }).toArray()

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

    const users = await getUsersCollection()
    const stories = await getStoriesCollection()
    const comments = await getCommentsCollection()
    const likes = await getLikesCollection()

    if (data.userId && data.userId.trim()) {
      currentUserId = data.userId.trim()
      const currentUser = await users.findOne({ id: currentUserId })
      isWatcher = currentUser?.role === 'guru_bk'
    }

    const s = await stories.findOne({ id: data.id })
    if (!s) return { story: null, isLiked: false, isWatcher }

    const storyComments = await comments
      .find({ storyId: s.id })
      .sort({ createdAt: 1 })
      .toArray()

    const storyLikes = await likes.find({ storyId: s.id }).toArray()
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
      throw new Error('Silakan buat atau pilih akun pengguna terlebih dahulu.')
    }

    const users = await getUsersCollection()
    const stories = await getStoriesCollection()

    const currentUser = await users.findOne({ id: data.userId.trim() })
    if (!currentUser) {
      throw new Error('Akun pengguna tidak ditemukan. Silakan login kembali.')
    }

    const paragraphs = data.content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const newId = `cerita-${Date.now()}`
    const avatarLetter = data.anonymous ? '?' : currentUser.name.charAt(0)
    const avatarHue = data.anonymous ? 35 : 205
    const excerpt = (paragraphs[0] || data.title).slice(0, 140)

    const newStory: StoryDoc = {
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
      isProtected: true,
      createdAt: new Date(),
    }

    await stories.insertOne(newStory)
    return { id: newId }
  })

export const deleteStory = createServerFn({ method: 'POST' })
  .inputValidator((data: { storyId: string; userId: string }) => data)
  .handler(async ({ data }) => {
    if (!data.userId || !data.userId.trim()) {
      throw new Error('User ID tidak valid.')
    }

    const users = await getUsersCollection()
    const stories = await getStoriesCollection()
    const comments = await getCommentsCollection()
    const likes = await getLikesCollection()

    const caller = await users.findOne({ id: data.userId.trim() })
    const isWatcher = caller?.role === 'guru_bk'

    const story = await stories.findOne({ id: data.storyId })
    if (!story) {
      throw new Error('Cerita tidak ditemukan.')
    }

    if (story.authorId !== data.userId.trim() && !isWatcher) {
      throw new Error('Kamu tidak memiliki izin untuk menghapus cerita ini.')
    }

    await stories.deleteOne({ id: data.storyId })
    await comments.deleteMany({ storyId: data.storyId })
    await likes.deleteMany({ storyId: data.storyId })

    return { success: true }
  })

export const deleteComment = createServerFn({ method: 'POST' })
  .inputValidator((data: { commentId: string; userId: string }) => data)
  .handler(async ({ data }) => {
    if (!data.userId || !data.userId.trim()) {
      throw new Error('User ID tidak valid.')
    }

    const users = await getUsersCollection()
    const comments = await getCommentsCollection()

    const caller = await users.findOne({ id: data.userId.trim() })
    const isWatcher = caller?.role === 'guru_bk'

    const comment = await comments.findOne({ id: data.commentId })
    if (!comment) {
      throw new Error('Komentar tidak ditemukan.')
    }

    if (comment.authorId !== data.userId.trim() && !isWatcher) {
      throw new Error('Kamu tidak memiliki izin untuk menghapus komentar ini.')
    }

    await comments.deleteOne({ id: data.commentId })
    return { success: true }
  })

export const toggleStoryProtection = createServerFn({ method: 'POST' })
  .inputValidator((data: { storyId: string; userId: string }) => data)
  .handler(async ({ data }) => {
    if (!data.userId || !data.userId.trim()) {
      throw new Error('User ID tidak valid.')
    }

    const users = await getUsersCollection()
    const stories = await getStoriesCollection()

    const caller = await users.findOne({ id: data.userId.trim() })
    if (caller?.role !== 'guru_bk') {
      throw new Error('Hanya Guru BK / Watcher yang dapat mengatur status pengawasan.')
    }

    const story = await stories.findOne({ id: data.storyId })
    if (!story) throw new Error('Cerita tidak ditemukan.')

    const updated = !story.isProtected
    await stories.updateOne({ id: data.storyId }, { $set: { isProtected: updated } })
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
    const users = await getUsersCollection()
    const likes = await getLikesCollection()

    // Ensure user exists
    const user = await users.findOne({ id: callerId })
    if (!user) {
      const newUser: UserDoc = {
        id: callerId,
        name: data.userName?.trim() || 'Siswa',
        grade: 'Siswa',
        role: 'siswa',
        address: '',
        phone: '',
        bio: 'Siswa BK Bersama.',
        pin: '',
        avatarUrl: null,
        joinedAt: new Date(),
      }
      await users.insertOne(newUser)
    }

    const existingLike = await likes.findOne({ storyId: data.storyId, userId: callerId })
    const totalLikes = await likes.countDocuments({ storyId: data.storyId })

    if (existingLike) {
      await likes.deleteOne({ id: existingLike.id })
      return { liked: false, likesCount: Math.max(0, totalLikes - 1) }
    } else {
      const newLike: LikeDoc = {
        id: `like-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        storyId: data.storyId,
        userId: callerId,
        createdAt: new Date(),
      }
      await likes.insertOne(newLike)
      return { liked: true, likesCount: totalLikes + 1 }
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

    const stories = await getStoriesCollection()
    const comments = await getCommentsCollection()
    const users = await getUsersCollection()

    const story = await stories.findOne({ id: storyId })
    if (!story) {
      throw new Error('Cerita tidak ditemukan.')
    }

    let callerId = payload.userId?.trim()
    let authorName = payload.userName?.trim() || 'Siswa'

    if (callerId) {
      const user = await users.findOne({ id: callerId })
      if (!user) {
        await users.insertOne({
          id: callerId,
          name: authorName,
          grade: 'Siswa',
          role: 'siswa',
          address: '',
          phone: '',
          bio: 'Siswa BK Bersama.',
          pin: '',
          avatarUrl: null,
          joinedAt: new Date(),
        })
      } else {
        authorName = user.name
      }
    } else {
      callerId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
      await users.insertOne({
        id: callerId,
        name: authorName,
        grade: 'Siswa',
        role: 'siswa',
        address: '',
        phone: '',
        bio: 'Siswa BK Bersama.',
        pin: '',
        avatarUrl: null,
        joinedAt: new Date(),
      })
    }

    const commentId = `c-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const newComment: CommentDoc = {
      id: commentId,
      storyId,
      authorId: callerId,
      authorName,
      text,
      createdAt: new Date(),
    }

    await comments.insertOne(newComment)

    return {
      id: commentId,
      author: authorName,
      authorId: callerId,
      timeAgo: 'Baru saja',
      text,
      canDelete: true,
    }
  })
