import { createServerFn } from '@tanstack/react-start'
import { getUsersCollection, getStoriesCollection, getLikesCollection } from '@/db'

export const getProfile = createServerFn({ method: 'GET' })
  .inputValidator((data?: { userId?: string }) => data)
  .handler(async ({ data }) => {
    let user = null
    const users = await getUsersCollection()
    const stories = await getStoriesCollection()
    const likes = await getLikesCollection()

    if (data?.userId && data.userId.trim()) {
      user = await users.findOne({ id: data.userId.trim() })
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
    const myStories = await stories.find({ authorId: user.id }, { projection: { id: 1 } }).toArray()
    const myStoryIds = myStories.map((s) => s.id)

    let likesReceived = 0
    if (myStoryIds.length > 0) {
      likesReceived = await likes.countDocuments({ storyId: { $in: myStoryIds } })
    }

    const joinedDate = user.joinedAt ? new Date(user.joinedAt) : new Date()
    const joinedLabel = `Bergabung ${joinedDate.toLocaleString('id-ID', { month: 'long', year: 'numeric' })}`

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
      storiesCount: myStories.length,
      likesReceived,
      joinedLabel,
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

    const users = await getUsersCollection()

    await users.updateOne(
      { id: data.userId.trim() },
      {
        $set: {
          name: data.name,
          grade: data.grade,
          address: data.address,
          phone: data.phone,
          bio: data.bio,
          ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {}),
        },
      },
    )

    return { success: true }
  })
