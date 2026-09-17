import { createFileRoute, notFound, useNavigate, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Heart, Send, ShieldCheck, Trash2, MessageCircle, User } from 'lucide-react'

import { AppTopBar } from '@/components/app-top-bar'
import { TagChip } from '@/components/tag-chip'
import { useSession } from '@/lib/session'
import type { Comment } from '@/lib/fixtures'
import {
  getStoryById,
  toggleStoryLike,
  createComment,
  deleteStory,
  deleteComment,
  toggleStoryProtection,
} from '@/server/stories.functions'

export const Route = createFileRoute('/_app/feed/$storyId')({
  loader: async ({ params }) => {
    const { story, isLiked, isWatcher } = await getStoryById({ data: { id: params.storyId } })
    if (!story) throw notFound()
    return { story, isLiked, isWatcher }
  },
  component: StoryDetailPage,
})

function StoryDetailPage() {
  const { story, isLiked: initialLiked } = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const { activeUser, isWatcher, getOrCreateUser } = useSession()

  const [draft, setDraft] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [liked, setLiked] = useState(initialLiked)
  const [likesCount, setLikesCount] = useState(story.likes)
  const [commentsList, setCommentsList] = useState<Comment[]>(story.comments)
  const [isDeleting, setIsDeleting] = useState(false)

  // Re-sync with loader data
  useEffect(() => {
    setLiked(initialLiked)
    setLikesCount(story.likes)
    setCommentsList(story.comments)
  }, [initialLiked, story.likes, story.comments])

  // When activeUser loads on client, check if activeUser has liked this story
  useEffect(() => {
    if (!activeUser?.id) return
    getStoryById({ data: { id: story.id, userId: activeUser.id } }).then((res) => {
      if (res.story) {
        setLiked(res.isLiked)
        setLikesCount(res.story.likes)
      }
    })
  }, [activeUser?.id, story.id])

  const canDeleteStory =
    isWatcher || (activeUser?.id ? story.authorId === activeUser.id : false) || story.mine

  const handleLike = async () => {
    const prevLiked = liked
    const prevCount = likesCount

    // Optimistic update
    setLiked(!prevLiked)
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
      setLiked(res.liked)
      setLikesCount(res.likesCount)
    } catch (err) {
      console.error('Like failed:', err)
      setLiked(prevLiked)
      setLikesCount(prevCount)
    }
  }

  const submitComment = async () => {
    const text = draft.trim()
    if (!text || isSubmitting) return

    setIsSubmitting(true)
    try {
      const user = await getOrCreateUser()
      const authorName = user.name || 'Siswa'

      // Optimistic comment
      const tempId = `temp-${Date.now()}`
      const optimisticComment: Comment = {
        id: tempId,
        author: authorName,
        authorId: user.id,
        timeAgo: 'Baru saja',
        text,
        canDelete: true,
      }
      setCommentsList((prev) => [...prev, optimisticComment])
      setDraft('')

      const res = await createComment({
        data: {
          storyId: story.id,
          text,
          userId: user.id,
          userName: authorName,
        },
      })

      // Replace optimistic comment with confirmed server comment
      setCommentsList((prev) =>
        prev.map((c) => (c.id === tempId ? { ...c, id: res.id, author: res.author } : c)),
      )
      await router.invalidate()
    } catch (err) {
      console.error('Failed to post comment:', err)
      alert('Gagal mengirim komentar. Coba lagi sebentar ya.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStory = async () => {
    if (!activeUser?.id) return
    const confirmed = window.confirm(
      isWatcher
        ? 'Sebagai Guru BK / Watcher, kamu akan menghapus cerita ini demi keamanan siswa. Lanjutkan?'
        : 'Yakin ingin menghapus ceritamu? Cerita yang dihapus tidak bisa dikembalikan.',
    )
    if (!confirmed) return

    setIsDeleting(true)
    try {
      await deleteStory({
        data: { storyId: story.id, userId: activeUser.id },
      })
      navigate({ to: '/feed' })
    } catch (err: any) {
      alert(err?.message || 'Gagal menghapus cerita.')
      setIsDeleting(false)
    }
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!activeUser?.id) return
    const confirmed = window.confirm(
      isWatcher
        ? 'Hapus komentar ini karena berpotensi merundung (cyberbullying)?'
        : 'Hapus komentar ini?',
    )
    if (!confirmed) return

    setCommentsList((prev) => prev.filter((c) => c.id !== commentId))
    try {
      await deleteComment({
        data: { commentId, userId: activeUser.id },
      })
      await router.invalidate()
    } catch (err: any) {
      alert(err?.message || 'Gagal menghapus komentar.')
      await router.invalidate()
    }
  }

  const handleToggleProtect = async () => {
    if (!activeUser?.id) return
    try {
      await toggleStoryProtection({
        data: { storyId: story.id, userId: activeUser.id },
      })
      await router.invalidate()
    } catch (err: any) {
      alert(err?.message || 'Gagal mengubah status perlindungan.')
    }
  }

  return (
    <div className="pb-12">
      <AppTopBar title="Detail Cerita" back />

      {/* Anti-bullying Watcher banner */}
      <div className="mx-4 mt-3 rounded-xl border border-emerald-600/30 bg-emerald-50/80 p-3 text-emerald-900 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[12.5px] font-bold text-emerald-800">
                {story.isProtected ? 'Dipantau Guru BK (Aman dari Bullying)' : 'Pengawasan Dinonaktifkan'}
              </p>
              {isWatcher && (
                <button
                  onClick={handleToggleProtect}
                  className="shrink-0 text-[11px] font-semibold text-emerald-700 underline hover:text-emerald-900"
                >
                  {story.isProtected ? 'Matikan' : 'Aktifkan'}
                </button>
              )}
            </div>
            <p className="mt-0.5 text-[11.5px] leading-relaxed text-emerald-800/80">
              Cerita ini diawasi oleh tim Bimbingan Konseling. Komentar ejekan atau perundungan akan segera dihapus demi menjaga ruang aman.
            </p>
          </div>
        </div>
      </div>

      <article className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-2xs"
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
          <TagChip tag={story.tag} />
        </div>

        <h1 className="font-display mt-4 text-[22px] font-bold leading-tight text-ink">
          {story.title}
        </h1>

        <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-ink-soft">
          {story.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        {/* Action Buttons: Like & Delete */}
        <div className="mt-6 flex items-center justify-between border-y border-[#e4d7bd]/70 py-3">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all active:scale-95 ${
              liked
                ? 'border border-rose/30 bg-rose/15 text-rose shadow-2xs'
                : 'border border-[#e4d7bd] bg-paper-warm text-ink-soft hover:border-rose/30 hover:bg-rose/10 hover:text-rose'
            }`}
          >
            <Heart
              className={`h-4.5 w-4.5 transition-transform ${liked ? 'fill-rose text-rose scale-110' : ''}`}
              strokeWidth={2.25}
            />
            <span>{likesCount} Suka</span>
          </button>

          {canDeleteStory && (
            <button
              onClick={handleDeleteStory}
              disabled={isDeleting}
              className="flex items-center gap-1.5 rounded-full border border-rose/30 bg-rose/10 px-3.5 py-2 text-xs font-bold text-rose transition hover:bg-rose/20 active:scale-95 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isWatcher ? 'Hapus Cerita (Watcher)' : 'Hapus Cerita'}</span>
            </button>
          )}
        </div>
      </article>

      {/* Komentar Section */}
      <div id="comments" className="px-4 py-3">
        <div className="flex items-center gap-2">
          <MessageCircle className="h-4.5 w-4.5 text-forest" />
          <h2 className="font-display text-[16px] font-bold text-ink">
            Komentar &amp; Dukungan ({commentsList.length})
          </h2>
        </div>

        <div className="mt-3.5 space-y-3">
          {commentsList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d8c7a3] bg-paper-warm/60 px-4 py-6 text-center text-xs text-ink-soft">
              Belum ada komentar. Tuliskan tanggapan hangat atau dukungan pertamamu di bawah.
            </div>
          ) : (
            commentsList.map((comment) => {
              const canDeleteThisComment =
                isWatcher ||
                (activeUser?.id ? comment.authorId === activeUser.id : false) ||
                comment.canDelete

              return (
                <div
                  key={comment.id}
                  className="rounded-2xl border border-[#e4d7bd]/70 bg-paper-warm p-3.5 shadow-2xs"
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest/15 text-[10px] font-bold text-forest-dark">
                        {comment.author.charAt(0).toUpperCase()}
                      </span>
                      <p className="text-[13px] font-bold text-ink">{comment.author}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-[11px] text-ink-soft/60">{comment.timeAgo}</p>
                      {canDeleteThisComment && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Hapus komentar ini demi mencegah perundungan"
                          className="flex items-center gap-1 text-[11px] font-semibold text-rose hover:underline"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-2 text-[13.5px] leading-relaxed text-ink-soft">{comment.text}</p>
                </div>
              )
            })
          )}
        </div>

        {/* Form Tulis Komentar */}
        <div className="mt-4 rounded-2xl border border-[#e4d7bd] bg-paper-warm p-3 shadow-2xs">
          <div className="mb-2 flex items-center justify-between text-[11px] text-ink-soft">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3 text-forest" />
              <span>
                Komentar sebagai: <strong className="text-ink">{activeUser?.name || 'Siswa'}</strong>
              </span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') submitComment()
              }}
              placeholder={
                isWatcher
                  ? 'Tulis bimbingan atau tanggapan konselor...'
                  : 'Tulis dukungan ramah untuk teman ini...'
              }
              className="flex-1 rounded-xl border border-[#e4d7bd] bg-paper px-3.5 py-2.5 text-[13.5px] text-ink outline-none placeholder:text-ink-soft/50 focus:border-forest"
            />
            <button
              onClick={submitComment}
              disabled={isSubmitting || !draft.trim()}
              aria-label="Kirim komentar"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-forest text-paper-warm shadow-xs transition-transform active:scale-95 disabled:opacity-50"
            >
              <Send className="h-4 w-4" strokeWidth={2.25} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
