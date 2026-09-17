import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { Heart, MessageCircle, ShieldCheck } from 'lucide-react'

import type { Story } from '@/lib/fixtures'
import { TagChip } from '@/components/tag-chip'
import { useSession } from '@/lib/session'
import { toggleStoryLike } from '@/server/stories.functions'

export function StoryCard({ story, index = 0 }: { story: Story; index?: number }) {
  const { getOrCreateUser } = useSession()

  const [isLiked, setIsLiked] = useState(story.isLiked ?? false)
  const [likesCount, setLikesCount] = useState(story.likes)
  const [isLiking, setIsLiking] = useState(false)

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (isLiking) return
    setIsLiking(true)

    const prevLiked = isLiked
    const prevCount = likesCount
    setIsLiked(!prevLiked)
    setLikesCount(prevLiked ? Math.max(0, prevCount - 1) : prevCount + 1)

    try {
      const user = await getOrCreateUser()
      const res = await toggleStoryLike({
        data: {
          storyId: story.id,
          userId: user.id,
          userName: user.name,
        },
      })
      setIsLiked(res.liked)
      setLikesCount(res.likesCount)
    } catch (err) {
      console.error('Like error:', err)
      setIsLiked(prevLiked)
      setLikesCount(prevCount)
    } finally {
      setIsLiking(false)
    }
  }

  return (
    <Link
      to="/feed/$storyId"
      params={{ storyId: story.id }}
      className="rise-in block rounded-2xl border border-[#e4d7bd] bg-paper-warm p-4 shadow-[0_2px_0_#e4d7bd] transition-transform active:scale-[0.99]"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-2xs"
          style={{ backgroundColor: `hsl(${story.avatarHue} 38% 42%)` }}
        >
          {story.avatarLetter}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-ink">{story.author}</p>
          <p className="text-xs text-ink-soft/70">
            {story.grade} · {story.timeAgo}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          {story.isProtected && (
            <span
              title="Cerita ini dipantau oleh Guru BK agar aman dari perundungan"
              className="flex items-center gap-1 rounded-full bg-emerald-700/10 px-2 py-0.5 text-[10.5px] font-bold text-emerald-800"
            >
              <ShieldCheck className="h-3 w-3 text-emerald-700" />
              Dipantau
            </span>
          )}
          {story.mine && (
            <span className="shrink-0 rounded-full bg-forest/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-forest-dark">
              Ceritaku
            </span>
          )}
        </div>
      </div>

      <h3 className="font-display mt-3 text-[17px] font-semibold leading-snug text-ink">
        {story.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-[13.5px] leading-relaxed text-ink-soft">
        {story.excerpt}
      </p>

      <div className="mt-3.5 flex items-center justify-between">
        <TagChip tag={story.tag} />

        <div className="flex items-center gap-2">
          {/* Interactive Like Button */}
          <button
            type="button"
            onClick={handleLike}
            title={isLiked ? 'Batal menyukai cerita' : 'Sukai cerita ini'}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-all active:scale-90 ${
              isLiked
                ? 'border border-rose/30 bg-rose/15 text-rose'
                : 'border border-[#e4d7bd]/60 bg-paper/80 text-ink-soft/80 hover:border-rose/30 hover:bg-rose/10 hover:text-rose'
            }`}
          >
            <Heart
              className={`h-3.5 w-3.5 transition-transform ${isLiked ? 'fill-rose text-rose scale-110' : ''}`}
              strokeWidth={2.25}
            />
            <span>{likesCount}</span>
          </button>

          {/* Comment Count Indicator */}
          <span
            title={`${story.comments.length} komentar`}
            className="flex items-center gap-1.5 rounded-full border border-[#e4d7bd]/60 bg-paper/80 px-2.5 py-1 text-xs font-semibold text-ink-soft/80"
          >
            <MessageCircle className="h-3.5 w-3.5" strokeWidth={2.25} />
            <span>{story.comments.length}</span>
          </span>
        </div>
      </div>
    </Link>
  )
}
