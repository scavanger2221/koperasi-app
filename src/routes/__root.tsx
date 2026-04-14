import { HeadContent, Scripts, createRootRoute, Outlet } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/auth'
import { LoginForm } from '../components/LoginForm'
import { DesktopSidebar } from '../components/layout/DesktopSidebar'
import { AppTopBar } from '../components/layout/AppTopBar'
import { MobileNav } from '../components/layout/MobileNav'
import { MobileMenu } from '../components/layout/MobileMenu'
import { useIsMobile } from '../hooks/useIsMobile'

import appCss from '../styles.css?url'

function RootComponent() {
  return <AppLayout />
}

export const Route = createRootRoute({
  component: RootComponent,
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { name: 'theme-color', content: '#5D7A2A' },
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
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Prevent hydration mismatch: Server (no local storage) renders the same shell
  // but it MUST include the Outlet, otherwise TanStack Router complains about
  // missing HTML. We just hide it until mounted.
  if (!mounted) {
    return (
      <div className="min-h-screen bg-[var(--color-bg-soft)] hidden" suppressHydrationWarning>
        <Outlet />
      </div>
    )
  }

  if (!token) {
    return <LoginForm />
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-soft)]">
      <AppTopBar />
      {!isMobile && <DesktopSidebar />}

      <main
        className={[
          'min-h-screen pt-16', // 16 matches h-16 of AppTopBar
          !isMobile ? 'md:pl-64' : 'pb-24', // pb-24 ensures content clears mobile nav
        ].join(' ')}
      >
        <div className="p-4 md:p-5">
          <Outlet />
        </div>
      </main>
      {isMobile && (
        <>
          <MobileNav onMenuOpen={() => setMenuOpen(true)} />
          <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
        </>
      )}
    </div>
  )
}
