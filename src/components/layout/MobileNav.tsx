import { Link, useRouterState } from '@tanstack/react-router'
import { navItems } from '../../constants/navigation'
import { cn } from '../../lib/utils'

export function MobileNav() {
  const router = useRouterState()
  const currentPath = router.location.pathname

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] z-50 pb-[env(safe-area-inset-bottom,0.5rem)]">
      <div className="flex items-center justify-around h-[var(--header-height)]">
        {navItems.map((item) => {
          const active = currentPath === item.to || currentPath.startsWith(item.to + '/')
          const Icon = item.icon
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center justify-center flex-1 h-full min-w-0 px-1',
                active ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-soft)]'
              )}
            >
              <Icon
                className="w-6 h-6 shrink-0 mb-1"
                strokeWidth={active ? 2.5 : 2}
                fill={active ? 'currentColor' : 'none'}
                fillOpacity={active ? 0.2 : 0}
              />
              <span className={cn(
                'text-xs truncate w-full max-w-full text-center leading-tight',
                active ? 'font-bold' : 'font-medium'
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
