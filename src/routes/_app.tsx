import { Outlet, createFileRoute } from '@tanstack/react-router'

import { BottomNav } from '@/components/bottom-nav'
import { SessionProvider, useSession } from '@/lib/session'
import { AuthScreen } from '@/components/auth-screen'

export const Route = createFileRoute('/_app')({
  component: AppShell,
})

function AppShell() {
  return (
    <SessionProvider>
      <AppShellContent />
    </SessionProvider>
  )
}

function AppShellContent() {
  const { activeUser, isLoading } = useSession()

  return (
    <div className="cork-bg flex min-h-screen justify-center py-0 sm:py-6">
      <div className="relative flex min-h-screen w-full max-w-[440px] flex-col overflow-hidden bg-paper shadow-[0_0_0_1px_rgba(0,0,0,0.05)] sm:min-h-[min(920px,calc(100vh-3rem))] sm:rounded-[28px] sm:shadow-2xl">
        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-2.5 p-6">
            <div className="h-8 w-8 animate-spin rounded-full border-3 border-forest border-t-transparent" />
            <p className="font-display text-xs font-semibold text-ink-soft">Memuat BK Bersama...</p>
          </div>
        ) : !activeUser ? (
          <AuthScreen />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto pb-24">
              <Outlet />
            </div>
            <BottomNav />
          </>
        )}
      </div>
    </div>
  )
}
