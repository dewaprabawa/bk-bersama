import { createContext, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import { stories as initialStories, type Story } from '@/lib/fixtures'

type NewStoryInput = {
  title: string
  content: string
  tag: Story['tag']
  anonymous: boolean
}

type AppStoreValue = {
  stories: Story[]
  addStory: (input: NewStoryInput) => void
  toggleLike: (storyId: string) => void
  addComment: (storyId: string, text: string) => void
  likedIds: Set<string>
}

const AppStoreContext = createContext<AppStoreValue | null>(null)

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [stories, setStories] = useState<Story[]>(initialStories)
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())

  const addStory = (input: NewStoryInput) => {
    const paragraphs = input.content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)

    const story: Story = {
      id: `cerita-baru-${Date.now()}`,
      author: input.anonymous ? 'Anonim' : 'Ratna Ayu Wulandari',
      isAnonymous: input.anonymous,
      grade: 'Kelas 11 IPA 2',
      avatarLetter: input.anonymous ? '?' : 'R',
      avatarHue: 205,
      timeAgo: 'Baru saja',
      title: input.title,
      excerpt: paragraphs[0]?.slice(0, 140) ?? '',
      content: paragraphs.length > 0 ? paragraphs : [input.content],
      tag: input.tag,
      likes: 0,
      mine: true,
      comments: [],
    }

    setStories((prev) => [story, ...prev])
  }

  const toggleLike = (storyId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (next.has(storyId)) next.delete(storyId)
      else next.add(storyId)
      return next
    })
    setStories((prev) =>
      prev.map((story) =>
        story.id === storyId
          ? { ...story, likes: story.likes + (likedIds.has(storyId) ? -1 : 1) }
          : story,
      ),
    )
  }

  const addComment = (storyId: string, text: string) => {
    setStories((prev) =>
      prev.map((story) =>
        story.id === storyId
          ? {
              ...story,
              comments: [
                ...story.comments,
                {
                  id: `komentar-${Date.now()}`,
                  author: 'Ratna Ayu Wulandari',
                  timeAgo: 'Baru saja',
                  text,
                },
              ],
            }
          : story,
      ),
    )
  }

  const value = useMemo(
    () => ({ stories, addStory, toggleLike, addComment, likedIds }),
    [stories, likedIds],
  )

  return <AppStoreContext.Provider value={value}>{children}</AppStoreContext.Provider>
}

export function useAppStore() {
  const ctx = useContext(AppStoreContext)
  if (!ctx) throw new Error('useAppStore must be used within AppStoreProvider')
  return ctx
}
