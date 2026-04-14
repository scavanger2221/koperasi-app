import { Link, useRouterState } from '@tanstack/react-router'
import { Home, Users, Wallet, FileText, Receipt } from 'lucide-react'

const navItems = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/anggota', label: 'Anggota', icon: Users },
  { to: '/simpanan', label: 'Simpanan', icon: Wallet },
  { to: '/pinjaman', label: 'Pinjaman', icon: FileText },
  { to: '/angsuran', label: 'Angsuran', icon: Receipt },
]

export function MobileNav() {
  const router = useRouterState()
  const currentPath = router.location.pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] z-50 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const active = currentPath === item.to || currentPath.startsWith(item.to + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className={[
                'flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1',
                active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-soft)]',
              ].join(' ')}
            >
              <Icon className={["w-6 h-6 shrink-0 mb-1", active ? "stroke-[2.5px]" : "stroke-2"].join(' ')} />
              <span className={["text-xs truncate w-full max-w-full text-center leading-none", active ? "font-bold" : "font-medium"].join(' ')}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
