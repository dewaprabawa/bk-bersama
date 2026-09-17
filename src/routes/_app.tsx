import { Outlet, createFileRoute } from '@tanstack/react-router'

import { BottomNav } from '@/components/bottom-nav'
import { SessionProvider } from '@/lib/session'

export const Route = createFileRoute('/_app')({
  component: AppShell,
})

function AppShell() {
  return (
    <SessionProvider>
      <div className="cork-bg flex min-h-screen justify-center py-0 sm:py-6">
        <div className="relative flex min-h-screen w-full max-w-[440px] flex-col overflow-hidden bg-paper shadow-[0_0_0_1px_rgba(0,0,0,0.05)] sm:min-h-[min(920px,calc(100vh-3rem))] sm:rounded-[28px] sm:shadow-2xl">
          <div className="flex-1 overflow-y-auto pb-24">
            <Outlet />
          </div>
          <BottomNav />
        </div>
      </div>
    </SessionProvider>
  )
}
