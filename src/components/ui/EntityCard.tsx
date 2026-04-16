import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'

interface MetaItem {
  label?: string
  value: ReactNode
  className?: string
}

interface Action {
  label: string
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  disabled?: boolean
}

export function EntityCard({
  title,
  subtitle,
  badge,
  number,
  meta = [],
  actions = [],
  className = '',
}: {
  title: string
  subtitle?: string
  badge?: ReactNode
  number?: number
  meta?: MetaItem[]
  actions?: Action[]
  className?: string
}) {
  const btnClasses = {
    primary: 'btn btn-primary w-full',
    secondary: 'btn btn-secondary w-full',
    danger: 'btn btn-danger w-full',
    ghost: 'btn btn-ghost w-full',
  }

  return (
    <div className={cn('card p-5 space-y-4 transition-shadow duration-200', className)}>
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        {typeof number === 'number' && (
          <div className="shrink-0 mr-2">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-bg-soft)] text-[var(--color-text)] text-sm font-extrabold">
              {number}
            </span>
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="text-lg font-extrabold text-[var(--color-text)] tracking-tight uppercase leading-tight">{title}</p>
          {subtitle && (
            <p className="text-xs font-bold text-[var(--color-text-soft)] uppercase tracking-wider mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {meta.length > 0 && (
        <div className="space-y-3">
          {meta.map((m, idx) => (
            <div key={idx} className={cn('flex justify-between items-center gap-4', m.className)}>
              {m.label ? (
                <>
                  <span className="text-2xs text-[var(--color-text-soft)] font-extrabold uppercase tracking-widest leading-none">
                    {m.label}
                  </span>
                  <span className="text-sm font-bold text-[var(--color-text)] text-right leading-none tabular-nums">
                    {m.value}
                  </span>
                </>
              ) : (
                <div className="text-sm font-bold text-[var(--color-text)] w-full">
                  {m.value}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {actions.length > 0 && (
        <div className="pt-3 grid grid-cols-1 gap-2">
          {actions.map((a, idx) => (
            <button
              key={idx}
              onClick={a.onClick}
              disabled={a.disabled}
              className={btnClasses[a.variant || 'secondary']}
            >
              {a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
