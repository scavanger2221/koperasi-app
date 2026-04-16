import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

export function PageHeader({
  title,
  subtitle,
  action,
  className = '',
}: {
  title: string
  subtitle?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)] tracking-tighter uppercase leading-none">{title}</h1>
          {subtitle && (
            <p className="text-[var(--color-text-soft)] mt-3 text-sm font-bold uppercase tracking-widest leading-none bg-white inline-block px-3 py-1.5 rounded-lg border border-[var(--color-border)]">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
    </div>
  )
}
