import { pgTable, text, timestamp, boolean, integer, jsonb, uniqueIndex } from 'drizzle-orm/pg-core'

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  grade: text('grade').notNull(),
  role: text('role').notNull().default('siswa'), // 'siswa' | 'guru_bk'
  address: text('address').notNull().default(''),
  phone: text('phone').notNull().default(''),
  bio: text('bio').notNull().default(''),
  pin: text('pin').notNull().default(''),
  avatarUrl: text('avatar_url'),
  joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull(),
})

export const stories = pgTable('stories', {
  id: text('id').primaryKey(),
  authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
  authorName: text('author_name').notNull(),
  grade: text('grade').notNull(),
  isAnonymous: boolean('is_anonymous').notNull().default(false),
  avatarLetter: text('avatar_letter').notNull().default('?'),
  avatarHue: integer('avatar_hue').notNull().default(205),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  content: jsonb('content').$type<string[]>().notNull(),
  tag: text('tag').notNull(),
  isProtected: boolean('is_protected').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  storyId: text('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
  authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
  authorName: text('author_name').notNull(),
  text: text('text').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const likes = pgTable(
  'likes',
  {
    id: text('id').primaryKey(),
    storyId: text('story_id').notNull().references(() => stories.id, { onDelete: 'cascade' }),
    userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [uniqueIndex('story_user_like_idx').on(table.storyId, table.userId)],
)

export const inspirations = pgTable('inspirations', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  category: text('category').notNull(),
  content: text('content').notNull(),
  practicalTip: text('practical_tip').notNull(),
  quote: text('quote'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const counselingRequests = pgTable('counseling_requests', {
  id: text('id').primaryKey(),
  studentId: text('student_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  studentName: text('student_name').notNull(),
  counselorId: text('counselor_id').references(() => users.id, { onDelete: 'set null' }),
  counselorName: text('counselor_name'),
  topic: text('topic').notNull(),
  message: text('message').notNull(),
  preferredDate: text('preferred_date').notNull(),
  preferredTime: text('preferred_time').notNull(),
  status: text('status').notNull().default('pending'),
  counselorNote: text('counselor_note'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
