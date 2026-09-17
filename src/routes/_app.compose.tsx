import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Eye, EyeOff, UserPlus } from 'lucide-react'

import { AppTopBar } from '@/components/app-top-bar'
import { categories, type Category } from '@/lib/fixtures'
import { useSession } from '@/lib/session'
import { createStory } from '@/server/stories.functions'

export const Route = createFileRoute('/_app/compose')({
  component: ComposePage,
})

function ComposePage() {
  const navigate = useNavigate()
  const { activeUser, isWatcher } = useSession()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tag, setTag] = useState<Category>('Akademik')
  const [anonymous, setAnonymous] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    if (!activeUser?.id) {
      setError('Silakan pilih atau daftarkan akun terlebih dahulu.')
      return
    }

    if (!title.trim() || !content.trim()) {
      setError('Judul dan isi cerita wajib diisi ya.')
      return
    }
    setError('')
    setIsSubmitting(true)
    try {
      await createStory({
        data: {
          userId: activeUser.id,
          title: title.trim(),
          content,
          tag,
          anonymous,
        },
      })
      navigate({ to: '/feed' })
    } catch (err) {
      console.error(err)
      setError('Gagal menyimpan cerita. Coba lagi sebentar ya.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!activeUser) {
    return (
      <div>
        <AppTopBar title="Tulis Cerita" back />
        <div className="px-4 py-8">
          <div className="rounded-2xl border border-dashed border-[#d8c7a3] bg-paper-warm/80 p-6 text-center">
            <UserPlus className="mx-auto h-10 w-10 text-forest-dark" />
            <h2 className="font-display mt-3 text-lg font-bold text-ink">Menyiapkan Akun...</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Sedang menghubungkan ke akun perangkat Anda.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AppTopBar title="Tulis Cerita" back />

      <div className="space-y-4 px-4 py-4">
        <div className="rounded-xl border border-emerald-600/20 bg-emerald-50/70 px-3.5 py-3 text-[12.5px] leading-relaxed text-emerald-950">
          🛡️ Ruang aman: Cerita yang dibagikan dipantau oleh tim Guru BK untuk memastikan tidak
          ada intimidasi atau perundungan (bullying).
        </div>

        <div className="flex items-center justify-between rounded-xl bg-paper-warm px-3.5 py-2 text-xs text-ink-soft">
          <span>
            Penulis:{' '}
            <strong className="text-ink">{anonymous ? 'Anonim' : activeUser.name}</strong>
          </span>
          <span className="rounded-full bg-forest/10 px-2 py-0.5 text-[10.5px] font-semibold text-forest-dark">
            {isWatcher ? 'Watcher / Guru BK' : activeUser.grade}
          </span>
        </div>

        <Field label="Judul cerita">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Contoh: Susah tidur menjelang ujian"
            className="w-full rounded-xl border border-[#e4d7bd] bg-paper-warm px-3.5 py-2.5 text-[14px] text-ink outline-none placeholder:text-ink-soft/50 focus:border-forest"
          />
        </Field>

        <Field label="Topik">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={() => setTag(category)}
                className={`rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                  tag === category
                    ? 'bg-forest text-paper-warm'
                    : 'bg-[#efe4cd] text-ink-soft'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Ceritamu">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={7}
            placeholder="Tulis apa yang terjadi dan bagaimana rasanya buatmu..."
            className="w-full resize-none rounded-xl border border-[#e4d7bd] bg-paper-warm px-3.5 py-2.5 text-[14px] leading-relaxed text-ink outline-none placeholder:text-ink-soft/50 focus:border-forest"
          />
        </Field>

        <button
          type="button"
          onClick={() => setAnonymous((value) => !value)}
          className="flex w-full items-center justify-between rounded-xl border border-[#e4d7bd] bg-paper-warm px-3.5 py-3 text-left"
        >
          <span className="flex items-center gap-2.5 text-[13.5px] font-medium text-ink">
            {anonymous ? (
              <EyeOff className="h-4 w-4 text-terracotta" strokeWidth={2.25} />
            ) : (
              <Eye className="h-4 w-4 text-forest-dark" strokeWidth={2.25} />
            )}
            Kirim sebagai anonim
          </span>
          <span
            className={`relative h-6 w-11 rounded-full transition-colors ${
              anonymous ? 'bg-terracotta' : 'bg-[#d8c7a3]'
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                anonymous ? 'translate-x-5' : 'translate-x-0.5'
              }`}
            />
          </span>
        </button>

        {error && <p className="text-[13px] font-medium text-rose">{error}</p>}

        <button
          onClick={submit}
          disabled={isSubmitting}
          className="w-full rounded-full bg-terracotta py-3 text-[14.5px] font-bold text-white shadow-[0_3px_0_var(--color-terracotta-dark)] transition-transform active:translate-y-[2px] active:shadow-none disabled:opacity-60"
        >
          {isSubmitting ? 'Menyimpan Cerita...' : 'Bagikan Cerita'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-ink-soft/70">
        {label}
      </span>
      {children}
    </label>
  )
}
