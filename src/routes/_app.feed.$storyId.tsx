import { createFileRoute, notFound, useNavigate, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Heart, Send, ShieldCheck, Trash2 } from 'lucide-react'

import { AppTopBar } from '@/components/app-top-bar'
import { TagChip } from '@/components/tag-chip'
import { useSession } from '@/lib/session'
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
  const { story, isLiked } = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const { activeUser, isWatcher } = useSession()

  const [draft, setDraft] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [liked, setLiked] = useState(isLiked)
  const [likesCount, setLikesCount] = useState(story.likes)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    setLiked(isLiked)
    setLikesCount(story.likes)
  }, [isLiked, story.likes])

  const canDeleteStory = isWatcher || (activeUser?.id ? story.authorId === activeUser.id : false) || story.mine

  const handleLike = async () => {
    if (!activeUser?.id) {
      alert('Silakan pilih atau buat akun di menu Admin untuk menyukai cerita ini.')
      return
    }
    const prevLiked = liked
    const prevCount = likesCount
    setLiked(!prevLiked)
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1)
    try {
      const res = await toggleStoryLike({
        data: { storyId: story.id, userId: activeUser.id },
      })
      setLiked(res.liked)
      setLikesCount(res.likesCount)
      await router.invalidate()
    } catch {
      setLiked(prevLiked)
      setLikesCount(prevCount)
    }
  }

  const submitComment = async () => {
    if (!activeUser?.id) {
      alert('Silakan pilih atau buat akun di menu Admin untuk mengirim komentar.')
      return
    }
    const text = draft.trim()
    if (!text || isSubmitting) return
    setIsSubmitting(true)
    try {
      await createComment({
        data: { storyId: story.id, text, userId: activeUser.id },
      })
      setDraft('')
      await router.invalidate()
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
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus cerita.')
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

    try {
      await deleteComment({
        data: { commentId, userId: activeUser.id },
      })
      await router.invalidate()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal menghapus komentar.')
    }
  }

  const handleToggleProtect = async () => {
    if (!activeUser?.id) return
    try {
      await toggleStoryProtection({
        data: { storyId: story.id, userId: activeUser.id },
      })
      await router.invalidate()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Gagal mengubah status perlindungan.')
    }
  }

  return (
    <div>
      <AppTopBar title="Cerita" back />

      {/* Anti-bullying Watcher banner */}
      <div className="mx-4 mt-3 rounded-xl border border-emerald-600/30 bg-emerald-50/80 p-3 text-emerald-900 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-1">
              <p className="text-[12.5px] font-bold text-emerald-800">
                {story.isProtected ? 'Dipantau Guru BK (Aman dari Perundungan)' : 'Pengawasan Dinonaktifkan'}
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
              Cerita ini diawasi oleh tim Bimbingan Konseling. Komentar bernada ejekan, intimidasi,
              atau perundungan akan segera dihapus untuk menjaga ruang aman.
            </p>
          </div>
        </div>
      </div>

      <article className="px-4 py-4">
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
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

        <h1 className="font-display mt-4 text-[22px] font-semibold leading-tight text-ink">
          {story.title}
        </h1>

        <div className="mt-3 space-y-3 text-[14.5px] leading-relaxed text-ink-soft">
          {story.content.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between">
          <button
            onClick={handleLike}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
              liked ? 'border-rose bg-rose/10 text-rose' : 'border-[#e4d7bd] text-ink-soft'
            }`}
          >
            <Heart className="h-4 w-4" strokeWidth={2.25} fill={liked ? 'currentColor' : 'none'} />
            {likesCount} suka
          </button>

          {canDeleteStory && (
            <button
              onClick={handleDeleteStory}
              disabled={isDeleting}
              className="flex items-center gap-1.5 rounded-full border border-rose/30 bg-rose/10 px-3.5 py-1.5 text-xs font-semibold text-rose transition-colors hover:bg-rose/20 disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>{isWatcher ? 'Hapus Cerita (Watcher)' : 'Hapus Cerita'}</span>
            </button>
          )}
        </div>
      </article>

      <div className="border-t border-[#e4d7bd] px-4 py-4">
        <h2 className="font-display text-[15px] font-semibold text-ink">
          Komentar ({story.comments.length})
        </h2>

        <div className="mt-3 space-y-3">
          {story.comments.length === 0 ? (
            <p className="rounded-xl border border-dashed border-[#d8c7a3] bg-paper-warm/60 px-4 py-5 text-center text-[13px] text-ink-soft/80">
              Belum ada komentar. Jadi yang pertama memberi dukungan ramah.
            </p>
          ) : (
            story.comments.map((comment) => {
              const canDeleteThisComment =
                isWatcher ||
                (activeUser?.id ? comment.authorId === activeUser.id : false) ||
                comment.canDelete

              return (
                <div key={comment.id} className="rounded-xl bg-paper-warm px-3.5 py-3">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="text-[13px] font-semibold text-ink">{comment.author}</p>
                    <div className="flex items-center gap-2">
                      <p className="shrink-0 text-[11px] text-ink-soft/60">{comment.timeAgo}</p>
                      {canDeleteThisComment && (
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          title="Hapus komentar ini untuk mencegah perundungan"
                          className="flex items-center gap-1 text-[11px] font-medium text-rose hover:underline"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Hapus</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-ink-soft">{comment.text}</p>
                </div>
              )
            })
          )}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') submitComment()
            }}
            placeholder={
              isWatcher
                ? 'Tulis tanggapan atau bimbingan konselor...'
                : 'Tulis dukungan ramah untuk cerita ini...'
            }
            className="flex-1 rounded-full border border-[#e4d7bd] bg-paper-warm px-4 py-2.5 text-[13.5px] text-ink outline-none placeholder:text-ink-soft/50 focus:border-forest"
          />
          <button
            onClick={submitComment}
            disabled={isSubmitting}
            aria-label="Kirim komentar"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-paper-warm transition-transform active:scale-95 disabled:opacity-60"
          >
            <Send className="h-4 w-4" strokeWidth={2.25} />
          </button>
        </div>
      </div>
    </div>
  )
}
