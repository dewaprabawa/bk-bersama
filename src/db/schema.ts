export type UserRole = 'siswa' | 'guru_bk'

export type UserDoc = {
  id: string
  name: string
  grade: string
  role: string // 'siswa' | 'guru_bk'
  address: string
  phone: string
  bio: string
  pin: string
  avatarUrl: string | null
  joinedAt: Date
}

export type StoryDoc = {
  id: string
  authorId: string | null
  authorName: string
  grade: string
  isAnonymous: boolean
  avatarLetter: string
  avatarHue: number
  title: string
  excerpt: string
  content: string[]
  tag: string
  isProtected: boolean
  createdAt: Date
}

export type CommentDoc = {
  id: string
  storyId: string
  authorId: string | null
  authorName: string
  text: string
  createdAt: Date
}

export type LikeDoc = {
  id: string
  storyId: string
  userId: string
  createdAt: Date
}

export type InspirationDoc = {
  id: string
  title: string
  category: string
  content: string
  practicalTip: string
  quote: string | null
  createdAt: Date
}

export type CounselingRequestDoc = {
  id: string
  studentId: string
  studentName: string
  counselorId: string | null
  counselorName: string | null
  topic: string
  message: string
  preferredDate: string
  preferredTime: string
  status: 'pending' | 'accepted' | 'rejected'
  counselorNote: string | null
  createdAt: Date
  updatedAt: Date
}
