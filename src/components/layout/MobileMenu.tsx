import { Link, useRouterState } from '@tanstack/react-router'
import { Receipt, BarChart3, LogOut, X } from 'lucide-react'
import { useAuthStore } from '../../stores/auth'

const menuItems = [
  { to: '/angsuran', label: 'Angsuran', icon: Receipt },
  { to: '/laporan', label: 'Laporan', icon: BarChart3 },
]

export function MobileMenu({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouterState()
  const currentPath = router.location.pathname
  const user = useAuthStore((s) => s.user)
  const clearAuth = useAuthStore((s) => s.clearAuth)

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-5 pb-safe shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold">Menu</h2>
          <button onClick={onClose} className="p-3 rounded-full hover:bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center">
            <X className="w-6 h-6 stroke-2" />
          </button>
        </div>

        <div className="space-y-2">
          {menuItems.map((item) => {
            const active = currentPath === item.to || currentPath.startsWith(item.to + '/')
            const Icon = item.icon
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={[
                  'flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-bold min-h-[48px]',
                  active
                    ? 'bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]'
                    : 'text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]',
                ].join(' ')}
              >
                <Icon className={["w-6 h-6", active ? "stroke-[2.5px]" : "stroke-2"].join(' ')} />
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
