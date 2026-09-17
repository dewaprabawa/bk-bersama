import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { Sparkles, ShieldCheck } from 'lucide-react'

import { AppTopBar } from '@/components/app-top-bar'
import { StoryCard } from '@/components/story-card'
import { useSession } from '@/lib/session'
import { getStories } from '@/server/stories.functions'

export const Route = createFileRoute('/_app/feed')({
  loader: async () => {
    return { stories: await getStories() }
  },
  component: FeedPage,
})

type Tab = 'semua' | 'saya'

function FeedPage() {
  const { stories } = Route.useLoaderData()
  const { activeUser, hasUsers, isWatcher } = useSession()
  const [tab, setTab] = useState<Tab>('semua')

  const visible =
    tab === 'saya'
      ? stories.filter((story) => story.authorId === activeUser?.id || story.mine)
      : stories

  return (
    <div>
      <AppTopBar title="BK Bersama" subtitle="Tempat berbagi dan bertumbuh" />

      {/* No user alert banner */}
      {!hasUsers && (
        <div className="mx-4 mt-3 rounded-2xl border border-forest/30 bg-forest/10 p-3.5 text-forest-dark">
          <p className="text-xs font-bold">👋 Belum ada akun terdaftar</p>
          <p className="mt-0.5 text-[11.5px] leading-relaxed text-ink-soft">
            Daftarkan Siswa atau Guru BK (Watcher) di menu Admin untuk mulai membagikan cerita dan mengawasi ruang diskusi.
          </p>
        </div>
      )}

      {/* Watcher info indicator */}
      {isWatcher && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-rose/30 bg-rose/10 px-3 py-2 text-rose">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <p className="text-[11.5px] font-medium leading-tight">
            <strong>Mode Watcher:</strong> Anda bertugas mengawasi cerita siswa dan berwenang
            menghapus ujaran perundungan.
          </p>
        </div>
      )}

      <div className="px-4 pt-4">
        <div className="flex gap-1 rounded-full bg-[#efe4cd] p-1">
          <TabButton active={tab === 'semua'} onClick={() => setTab('semua')}>
            Semua Cerita ({stories.length})
          </TabButton>
          <TabButton active={tab === 'saya'} onClick={() => setTab('saya')}>
            Cerita Saya
          </TabButton>
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        {visible.length === 0 ? (
          <EmptyState tab={tab} isWatcher={isWatcher} />
        ) : (
          visible.map((story, index) => (
            <StoryCard story={story} key={story.id} index={index} />
          ))
        )}
      </div>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-colors ${
        active ? 'bg-forest text-paper-warm shadow-sm' : 'text-ink-soft/70'
      }`}
    >
      {children}
    </button>
  )
}

function EmptyState({ tab, isWatcher }: { tab: Tab; isWatcher: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d8c7a3] bg-paper-warm/60 px-6 py-10 text-center">
      <Sparkles className="mx-auto h-6 w-6 text-terracotta" strokeWidth={2} />
      <p className="font-display mt-3 text-[15px] font-semibold text-ink">
        {tab === 'saya' ? 'Kamu belum memiliki cerita' : 'Belum ada cerita di sini'}
      </p>
      <p className="mt-1 text-[13px] text-ink-soft/80">
        {tab === 'saya'
          ? 'Bagikan apa yang kamu rasakan lewat tombol Tulis Cerita.'
          : isWatcher
            ? 'Belum ada siswa yang membagikan cerita baru saat ini.'
            : 'Ceritamu bisa jadi yang pertama. Ruang ini aman dan dipantau oleh Guru BK.'}
      </p>
    </div>
  )
}
