import { Link } from '@tanstack/react-router'
import { Home, PenLine, User, Shield, CalendarCheck } from 'lucide-react'

const NAV_LINK_CLASS =
  'flex flex-1 flex-col items-center gap-0.5 py-1 text-[10.5px] font-semibold text-ink-soft/60 transition-colors'
const NAV_LINK_ACTIVE_CLASS = 'text-forest-dark'

export function BottomNav() {
  return (
    <nav className="absolute inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-[#e4d7bd] bg-paper-warm/95 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-sm">
      <Link
        to="/feed"
        className={NAV_LINK_CLASS}
        activeProps={{ className: `${NAV_LINK_CLASS} ${NAV_LINK_ACTIVE_CLASS}` }}
      >
        <Home className="h-4.5 w-4.5" strokeWidth={2.2} />
        Beranda
      </Link>

      <Link
        to="/counseling"
        className={NAV_LINK_CLASS}
        activeProps={{ className: `${NAV_LINK_CLASS} ${NAV_LINK_ACTIVE_CLASS}` }}
      >
        <CalendarCheck className="h-4.5 w-4.5 text-forest" strokeWidth={2.2} />
        Konseling
      </Link>

      <Link
        to="/compose"
        className="-mt-5 flex flex-col items-center gap-0.5 text-[10px] font-semibold text-forest-dark"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-terracotta text-white shadow-[0_3px_0_var(--color-terracotta-dark)] transition-transform active:scale-95">
          <PenLine className="h-5 w-5" strokeWidth={2.25} />
        </span>
        Tulis
      </Link>

      <Link
        to="/profile"
        className={NAV_LINK_CLASS}
        activeProps={{ className: `${NAV_LINK_CLASS} ${NAV_LINK_ACTIVE_CLASS}` }}
      >
        <User className="h-4.5 w-4.5" strokeWidth={2.2} />
        Profil
      </Link>

      <Link
        to="/admin"
        className={NAV_LINK_CLASS}
        activeProps={{ className: `${NAV_LINK_CLASS} ${NAV_LINK_ACTIVE_CLASS}` }}
      >
        <Shield className="h-4.5 w-4.5 text-rose" strokeWidth={2.2} />
        Admin
      </Link>
    </nav>
  )
}

