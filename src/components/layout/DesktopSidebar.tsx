import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Users, Wallet, FileText, Receipt, BarChart3 } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/anggota', label: 'Anggota', icon: Users },
  { to: '/simpanan', label: 'Simpanan', icon: Wallet },
  { to: '/pinjaman', label: 'Pinjaman', icon: FileText },
  { to: '/angsuran', label: 'Angsuran', icon: Receipt },
  { to: '/laporan', label: 'Laporan', icon: BarChart3 },
]

export function DesktopSidebar() {
  const router = useRouterState()
  const currentPath = router.location.pathname

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-[var(--color-border)] flex flex-col z-40">
      <div className="h-16 flex items-center px-6 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <img src="/logo192.png" alt="Logo" className="w-8 h-8" />
          <div className="flex flex-col justify-center pt-0.5">
            <h1 className="text-[16px] font-bold text-[var(--color-text)] leading-none tracking-tight">
              Koperasi
            </h1>
            <p className="text-[10px] font-bold text-[var(--color-text-soft)] uppercase tracking-wider mt-1">
              Simpan Pinjam
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-6">
        <nav className="space-y-1.5 px-4">
          {navItems.map((item) => {
            const active = currentPath === item.to || currentPath.startsWith(item.to + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                className={[
                  'flex items-center gap-3 px-3 py-3 rounded-lg text-[15px] transition-colors min-h-[48px]',
                  active
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)] font-bold'
                    : 'text-[var(--color-text)] font-medium hover:bg-[var(--color-bg-soft)]',
                ].join(' ')}
              >
                <Icon className={["w-5 h-5 shrink-0", active ? "stroke-[2.5px]" : "stroke-[2px] text-[var(--color-text-soft)]"].join(' ')} />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="p-4 border-t border-[var(--color-border)]">
        <p className="text-[11px] text-[var(--color-text-soft)] leading-snug">
          Sistem Informasi Manajemen Koperasi v1.0.0
        </p>
      </div>
    </aside>
  )
}
