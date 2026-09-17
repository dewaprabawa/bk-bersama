import { Link, createFileRoute } from '@tanstack/react-router'
import { HeartHandshake, Lock, MessagesSquare, Sparkle } from 'lucide-react'

import { getStories } from '@/server/stories.functions'
import { TagChip } from '@/components/tag-chip'

export const Route = createFileRoute('/')({
  loader: async () => {
    const all = await getStories()
    return { stories: all.slice(0, 3) }
  },
  component: LandingPage,
})

const ROTATIONS = ['-rotate-3', 'rotate-2', '-rotate-1']

function LandingPage() {
  const { stories } = Route.useLoaderData()
  return (
    <div className="cork-bg min-h-screen">
      <div className="mx-auto max-w-[480px] px-5 pb-16 pt-10 sm:max-w-[560px]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-paper-warm text-[13px] font-bold text-forest-dark">
            BK
          </span>
          <span className="font-display text-[15px] font-semibold text-paper-warm">
            BK Bersama
          </span>
        </div>

        <div className="relative mt-8 rounded-[26px] bg-paper-warm px-6 pb-8 pt-9 shadow-[0_18px_40px_-12px_rgba(0,0,0,0.55)]">
          <span className="washi-tape absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-2 rounded-[3px]" />
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-terracotta-dark">
            Ruang cerita siswa &amp; guru BK
          </p>
          <h1 className="font-display mt-3 text-[34px] font-semibold leading-[1.08] text-ink">
            Tempat berbagi
            <br />
            dan bertumbuh.
          </h1>
          <p className="mt-3.5 text-[14.5px] leading-relaxed text-ink-soft">
            Ceritakan apa yang kamu rasakan — soal akademik, keluarga, atau pertemanan.
            Anonim jika kamu mau, dibaca oleh guru BK dan teman yang peduli.
          </p>

          <Link
            to="/feed"
            className="mt-6 flex w-full items-center justify-center rounded-full bg-terracotta py-3.5 text-[15px] font-bold text-white shadow-[0_4px_0_var(--color-terracotta-dark)] transition-transform active:translate-y-[2px] active:shadow-none"
          >
            Mulai Cerita
          </Link>
          <Link
            to="/profile"
            className="mt-3 flex w-full items-center justify-center rounded-full border border-[#e4d7bd] py-3 text-[13.5px] font-semibold text-ink-soft"
          >
            Lengkapi profil dulu
          </Link>
        </div>

        <div className="relative mt-12 flex flex-col gap-4">
          {stories.map((story, index) => (
            <Link
              to="/feed/$storyId"
              params={{ storyId: story.id }}
              key={story.id}
              className={`block rounded-2xl bg-paper-warm p-4 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.45)] transition-transform hover:-translate-y-0.5 ${ROTATIONS[index % ROTATIONS.length]}`}
              style={{ marginLeft: index % 2 === 1 ? '10%' : 0, marginRight: index % 2 === 0 ? '6%' : 0 }}
            >
              <TagChip tag={story.tag} />
              <p className="font-display mt-2 text-[14.5px] font-semibold leading-snug text-ink">
                {story.title}
              </p>
              <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-soft">
                {story.excerpt}
              </p>
            </Link>
          ))}
        </div>

        <div className="mt-14 space-y-6">
          <FeatureRow
            icon={<Lock className="h-5 w-5" strokeWidth={2.25} />}
            title="Boleh anonim, tetap didengar"
            body="Nama boleh disembunyikan. Guru BK tetap bisa merespons dan menawarkan bantuan tanpa membuka identitasmu ke publik."
          />
          <FeatureRow
            icon={<HeartHandshake className="h-5 w-5" strokeWidth={2.25} />}
            title="Direspons, bukan dibiarkan"
            body="Setiap cerita bisa mendapat tanggapan dari guru BK maupun teman sekolah yang pernah mengalami hal serupa."
          />
          <FeatureRow
            icon={<MessagesSquare className="h-5 w-5" strokeWidth={2.25} />}
            title="Bukan cuma soal berat"
            body="Kemajuan kecil — berani duduk sebangku, akur lagi sama sahabat — juga layak dirayakan di sini."
          />
        </div>

        <div className="mt-14 rounded-2xl border border-[#5c4530] bg-[#3f2c1e] px-5 py-5 text-center">
          <Sparkle className="mx-auto h-5 w-5 text-gold" strokeWidth={2} />
          <p className="font-display mt-2 text-[15px] font-semibold text-paper-warm">
            Sudah lebih dari 200 cerita dibagikan minggu ini
          </p>
          <p className="mt-1 text-[12.5px] text-paper-warm/70">
            Giliran kamu berbagi, sekecil apa pun ceritanya.
          </p>
        </div>
      </div>
    </div>
  )
}

function FeatureRow({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode
  title: string
  body: string
}) {
  return (
    <div className="flex gap-3.5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest text-paper-warm">
        {icon}
      </span>
      <div>
        <p className="font-display text-[15px] font-semibold text-paper-warm">{title}</p>
        <p className="mt-1 text-[13px] leading-relaxed text-paper-warm/70">{body}</p>
      </div>
    </div>
  )
}
