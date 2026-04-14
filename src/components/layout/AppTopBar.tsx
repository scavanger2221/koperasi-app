import { LogOut, Bell, ChevronDown, FileText } from 'lucide-react'
import { useAuthStore } from '../../stores/auth'
import { useRouterState, Link } from '@tanstack/react-router'
import { useState, useRef, useEffect } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'

const pageTitles: Record<string, string> = {
  '/': 'Beranda',
  '/anggota': 'Daftar Anggota',
  '/simpanan': 'Data Simpanan',
  '/pinjaman': 'Data Pinjaman',
  '/angsuran': 'Data Angsuran',
  '/laporan': 'Laporan Keuangan',
}

export function AppTopBar() {
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const router = useRouterState()
  const title = pageTitles[router.location.pathname] || 'Koperasi'
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  return (
    <header className="fixed top-0 right-0 left-0 md:left-64 h-16 bg-white border-b border-[var(--color-border)] z-40 px-4 md:px-8 flex items-center justify-between shadow-sm">
      <h1 className="text-lg font-extrabold text-[var(--color-text)] tracking-tight">{title}</h1>

      <div className="flex items-center gap-2 sm:gap-3">
        {isMobile && (
          <Link
            to="/laporan"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] border border-transparent hover:border-[var(--color-border)] transition-all"
            aria-label="Laporan"
          >
            <FileText className="w-5 h-5 stroke-[2px]" />
          </Link>
        )}

        <button
          className="inline-flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] border border-transparent hover:border-[var(--color-border)] transition-all"
          aria-label="Notifikasi"
        >
          <Bell className="w-5 h-5 stroke-[2px]" />
        </button>

        <div className="h-6 w-px bg-[var(--color-border)] mx-1" />

        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full hover:bg-[var(--color-bg-soft)] border border-[var(--color-border)] transition-all bg-white"
          >
            <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-black uppercase">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="hidden sm:block text-left mr-1">
              <p className="text-sm font-bold text-[var(--color-text)] leading-none">{user?.name || 'User'}</p>
              <p className="text-[10px] text-[var(--color-text-soft)] font-bold uppercase mt-1">{user?.role || '-'}</p>
            </div>
            <ChevronDown className="w-4 h-4 text-[var(--color-text-soft)]" />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-[var(--color-border)] rounded-xl shadow-lg py-1 z-50 overflow-hidden">
              <div className="px-4 py-3 bg-[var(--color-bg-soft)] border-b border-[var(--color-border)]">
                <p className="text-sm font-bold text-[var(--color-text)] truncate">{user?.name}</p>
                <p className="text-[11px] font-bold text-[var(--color-text-soft)] uppercase mt-0.5">{user?.role}</p>
              </div>
              <button
                onClick={() => { setOpen(false); clearAuth() }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] transition-colors text-left"
              >
                <LogOut className="w-4 h-4 stroke-[2.5px]" />
                Keluar Aplikasi
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
