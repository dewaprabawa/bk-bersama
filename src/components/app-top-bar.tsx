import { Link, useRouter } from '@tanstack/react-router'
import { ArrowLeft, ShieldCheck, UserCheck, UserPlus } from 'lucide-react'
import { useSession } from '@/lib/session'

export function AppTopBar({
  title,
  subtitle,
  back,
}: {
  title: string
  subtitle?: string
  back?: boolean
}) {
  const router = useRouter()
  const { activeUser, hasUsers, isWatcher } = useSession()

  return (
    <header className="sticky top-0 z-30 border-b border-[#e4d7bd] bg-paper/95 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-2.5">
        {back ? (
          <button
            onClick={() => router.history.back()}
            aria-label="Kembali"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-ink/5"
          >
            <ArrowLeft className="h-5 w-5" strokeWidth={2.25} />
          </button>
        ) : (
          <Link
            to="/"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest text-[13px] font-bold text-paper-warm"
          >
            BK
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="font-display truncate text-[17px] font-semibold leading-tight text-ink">
            {title}
          </h1>
          {subtitle && <p className="truncate text-[11.5px] text-ink-soft/70">{subtitle}</p>}
        </div>

        {!hasUsers ? (
          <Link
            to="/admin"
            className="flex shrink-0 items-center gap-1 rounded-full border border-forest/30 bg-forest/10 px-2.5 py-1 text-[11px] font-semibold text-forest-dark transition hover:bg-forest hover:text-white"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>+ Buat Akun</span>
          </Link>
        ) : (
          <Link
            to={isWatcher ? '/admin' : '/profile'}
            title={isWatcher ? 'Portal Admin Guru BK' : 'Lihat Profil Anda'}
            className={`flex max-w-[130px] shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
              isWatcher
                ? 'border border-rose/30 bg-rose/15 text-rose'
                : 'border border-forest/20 bg-forest/10 text-forest-dark'
            }`}
          >
            {isWatcher ? (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-rose" />
            ) : (
              <UserCheck className="h-3.5 w-3.5 shrink-0 text-forest" />
            )}
            <span className="truncate">{activeUser?.name || (isWatcher ? 'Watcher' : 'Siswa')}</span>
          </Link>
        )}
      </div>
    </header>
  )
}

