import { HeadContent, Scripts, createRootRoute, Outlet, Link, useRouterState } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/auth'
import { LoginForm } from '../components/LoginForm'
import { DesktopSidebar } from '../components/layout/DesktopSidebar'
import { AppTopBar } from '../components/layout/AppTopBar'
import { MobileNav } from '../components/layout/MobileNav'
import { ToastProvider } from '../components/ui/ToastProvider'
import { useIsMobile } from '../hooks/useIsMobile'
import { Home } from 'lucide-react'
import { cn } from '../lib/utils'

import appCss from '../styles.css?url'

function NotFoundComponent() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center bg-[var(--color-bg-soft)]">
      <h1 className="text-4xl font-bold text-[var(--color-text)] mb-2">404</h1>
      <p className="text-base text-[var(--color-text-soft)] mb-6">Halaman yang Anda cari tidak ditemukan.</p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 rounded-lg px-4 py-3 bg-[var(--color-primary)] text-white font-semibold hover:opacity-90 transition"
      >
        <Home className="w-5 h-5" />
        Kembali ke Beranda
      </Link>
    </div>
  )
}

function RootComponent() {
  return <AppLayout />
}

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#16a34a' },
      { title: 'Koperasi Simpan Pinjam' },
    ],
    links: [
      { rel: 'stylesheet', href: appCss },
      { rel: 'manifest', href: '/manifest.json' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  )
}

function AppLayout() {
  const token = useAuthStore((s) => s.token)
  const isMobile = useIsMobile()
  const [mounted, setMounted] = useState(false)
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch: Server (no local storage) renders the same shell
  // but it MUST include the Outlet, otherwise TanStack Router complains about
  // missing HTML. We just hide it until mounted.
  const content = !token ? (
    <LoginForm />
  ) : (
    <div className="min-h-screen bg-[var(--color-bg-soft)]">
      <AppTopBar />
      {!isMobile && <DesktopSidebar />}

      <main
        className={cn(
          'min-h-screen pt-[var(--header-height)]',
          !isMobile ? 'md:pl-[var(--sidebar-width)]' : 'pb-[var(--mobile-nav-height)]'
        )}
      >
        <div className="p-4 md:p-5 overflow-x-hidden">
          {isMobile ? (
            <div key={pathname} className="page-enter-mobile">
              <Outlet />
            </div>
          ) : (
            <Outlet />
          )}
        </div>
      </main>
      {isMobile && <MobileNav />}
    </div>
  )

  if (!mounted) {
    return (
      <ToastProvider>
        <div className="min-h-screen bg-[var(--color-bg-soft)] hidden" suppressHydrationWarning>
          <Outlet />
        </div>
      </ToastProvider>
    )
  }

  return <ToastProvider>{content}</ToastProvider>
}
