import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Sparkles,
  PhoneCall,
  HeartHandshake,
  Lightbulb,
  Quote,
  Trash2,
  RefreshCw,
  HelpCircle,
  Activity,
} from 'lucide-react'

import { AppTopBar } from '@/components/app-top-bar'
import { useSession } from '@/lib/session'
import {
  getInspirations,
  generateDailyInspirations,
  deleteInspiration,
  type InspirationItem,
} from '@/server/inspiration.functions'

export const Route = createFileRoute('/_app/inspiration')({
  loader: async () => {
    return { inspirations: await getInspirations() }
  },
  component: InspirationPage,
})

function InspirationPage() {
  const { inspirations } = Route.useLoaderData()
  const router = useRouter()
  const { isWatcher } = useSession()

  const [isGenerating, setIsGenerating] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('Semua')

  const categories = ['Semua', ...Array.from(new Set(inspirations.map((item) => item.category)))]

  const filtered =
    activeCategory === 'Semua'
      ? inspirations
      : inspirations.filter((item) => item.category === activeCategory)

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      await generateDailyInspirations()
      await router.invalidate()
    } catch (err: any) {
      alert('Gagal menghasilkan inspirasi dengan Groq AI: ' + (err?.message || 'Coba lagi.'))
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDelete = async (id: string) => {
    const confirm = window.confirm('Hapus kartu inspirasi ini?')
    if (!confirm) return

    try {
      await deleteInspiration({ data: { id } })
      await router.invalidate()
    } catch (err: any) {
      alert(err?.message || 'Gagal menghapus.')
    }
  }

  return (
    <div className="pb-10">
      <AppTopBar
        title="Inspirasi & Dukungan"
        subtitle="Pertolongan pertama saat lelah dan cemas"
      />

      <div className="space-y-4 px-4 py-4">
        {/* Helpline Card for Mental Breakdown / Crisis */}
        <div className="rounded-2xl border border-rose/30 bg-rose/10 p-4 shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-rose text-white shadow-xs">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[15px] font-bold text-rose">
                Butuh Teman Bicara Segera?
              </h3>
              <p className="mt-1 text-[12px] leading-relaxed text-ink-soft">
                Jika kamu merasa putus asa, kelelahan mental, atau ingin melukai diri, kamu tidak sendirian. Hubungi layanan darurat gratis berikut:
              </p>
              <div className="mt-2.5 flex flex-wrap gap-2">
                <a
                  href="tel:119"
                  className="flex items-center gap-1.5 rounded-xl bg-rose px-3 py-1.5 text-xs font-bold text-white shadow-xs transition hover:bg-rose/90"
                >
                  <PhoneCall className="h-3.5 w-3.5" />
                  <span>Kemenkes Sejiwa 119 ext 8</span>
                </a>
                <span className="flex items-center gap-1 rounded-xl border border-rose/30 bg-white/70 px-3 py-1.5 text-xs font-semibold text-rose">
                  <HeartHandshake className="h-3.5 w-3.5" />
                  <span>Ruang Konseling Guru BK</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* AI Generator CTA Banner */}
        <div className="flex items-center justify-between rounded-2xl border border-amber-600/30 bg-amber-50/80 p-3.5">
          <div className="min-w-0 flex-1 pr-3">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-amber-700" />
              <p className="text-[13px] font-bold text-amber-950">Inspirasi Harian Groq AI</p>
            </div>
            <p className="mt-0.5 text-[11.5px] leading-tight text-amber-900/80">
              Dibuat otomatis dengan kecerdasan buatan untuk meredakan keputusasaan dan cemas.
            </p>
          </div>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-700 px-3 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-800 active:scale-95 disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            <span>{isGenerating ? 'Membuat...' : '+ 2 Post Hari Ini'}</span>
          </button>
        </div>

        {/* Categories Chips */}
        {categories.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold transition ${
                  activeCategory === cat
                    ? 'bg-forest text-paper-warm shadow-2xs'
                    : 'border border-[#e4d7bd] bg-paper text-ink-soft hover:bg-[#efe4cd]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Feed of Inspiration Cards */}
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#d8c7a3] bg-paper-warm/60 px-4 py-8 text-center">
            <HelpCircle className="mx-auto h-7 w-7 text-ink-soft/60" />
            <p className="mt-2 text-sm font-semibold text-ink">Belum ada konten inspirasi</p>
            <p className="mt-0.5 text-xs text-ink-soft">
              Tekan tombol "+ 2 Post Hari Ini" di atas untuk menghasilkan postingan dari Groq AI.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((item) => (
              <InspirationCard
                key={item.id}
                item={item}
                isWatcher={isWatcher}
                onDelete={() => handleDelete(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function InspirationCard({
  item,
  isWatcher,
  onDelete,
}: {
  item: InspirationItem
  isWatcher: boolean
  onDelete: () => void
}) {
  return (
    <article className="overflow-hidden rounded-2xl border border-[#e4d7bd] bg-paper-warm p-4 shadow-2xs">
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1 rounded-full bg-forest/10 px-2.5 py-0.5 text-[10.5px] font-bold text-forest-dark">
          <Activity className="h-3 w-3" />
          {item.category}
        </span>
        {isWatcher && (
          <button
            onClick={onDelete}
            className="flex items-center gap-1 text-[11px] font-medium text-rose hover:underline"
          >
            <Trash2 className="h-3 w-3" />
            Hapus
          </button>
        )}
      </div>

      <h2 className="font-display mt-2 text-[17px] font-bold leading-snug text-ink">
        {item.title}
      </h2>

      <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-ink-soft">
        {item.content}
      </p>

      {/* Practical Action Tip Box */}
      {item.practicalTip && (
        <div className="mt-3.5 rounded-xl border border-emerald-600/25 bg-emerald-50/70 p-3 text-emerald-950">
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
            <Lightbulb className="h-3.5 w-3.5 text-emerald-700" />
            <span>Latihan Praktis / Tips Langsung:</span>
          </div>
          <p className="mt-1 text-[12.5px] leading-relaxed text-emerald-900/90">
            {item.practicalTip}
          </p>
        </div>
      )}

      {/* Soothing Quote Box */}
      {item.quote && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-paper px-3 py-2.5 text-ink-soft shadow-2xs">
          <Quote className="h-4 w-4 shrink-0 rotate-180 text-terracotta/70" />
          <p className="font-display text-[12.5px] italic text-ink">{item.quote}</p>
        </div>
      )}
    </article>
  )
}
