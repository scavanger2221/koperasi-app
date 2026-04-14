import { LogOut, Bell, ChevronDown } from 'lucide-react'
import { useAuthStore } from '../../stores/auth'
import { useRouterState } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'

const pageTitles: Record<string, string> = {
  '/': 'Beranda',
  '/anggota': 'Anggota',
  '/simpanan': 'Simpanan',
  '/pinjaman': 'Pinjaman',
  '/angsuran': 'Angsuran',
  '/laporan': 'Laporan',
}

export function AppTopBar() {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const router = useRouterState()
  const title = pageTitles[router.location.pathname] || 'Koperasi'
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white/95 backdrop-blur border-b border-[var(--color-border)] z-40 px-4 md:px-6 flex items-center justify-between shadow-sm">
      <h1 className="text-lg font-bold text-[var(--color-text)]">{title}</h1>

      <div className="flex items-center gap-2">
        <button
          className="inline-flex items-center justify-center w-12 h-12 rounded-full hover:bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] relative transition-colors"
          aria-label="Notifikasi"
        >
          <Bell className="w-6 h-6 stroke-[2px]" />
          <span className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full bg-[var(--color-danger)] border-2 border-white" />
        </button>

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-2 pl-1.5 pr-3 h-12 rounded-full hover:bg-[var(--color-bg-soft)] border border-transparent hover:border-[var(--color-border)] transition-colors"
          >
            <div className="w-9 h-9 rounded-full bg-[var(--color-primary-light)] text-[var(--color-primary)] flex items-center justify-center text-sm font-bold">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <ChevronDown className="w-4 h-4 text-[var(--color-text-soft)]" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[var(--color-border)] rounded-xl shadow-lg py-2 z-50">
              <div className="px-4 py-3 border-b border-[var(--color-border)]">
                <p className="text-base font-bold truncate text-[var(--color-text)]">{user?.name || 'Pengguna'}</p>
                <p className="text-sm text-[var(--color-text-soft)] capitalize">{user?.role || '-'}</p>
              </div>
              <button
                onClick={() => { setOpen(false); clearAuth() }}
                className="w-full flex items-center gap-3 px-4 py-3 text-base font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors text-left"
              >
                <LogOut className="w-5 h-5 stroke-[2.5px]" />
                Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
