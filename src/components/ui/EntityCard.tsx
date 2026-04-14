import type { ReactNode } from 'react'

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
  meta = [],
  actions = [],
  className = '',
}: {
  title: string
  subtitle?: string
  badge?: ReactNode
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
    <div className={['card p-5 space-y-4 shadow-sm hover:shadow-md transition-shadow duration-200', className].join(' ')}>
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-[var(--color-border)]">
        <div className="min-w-0">
          <p className="text-[16px] font-extrabold text-[var(--color-text)] tracking-tight uppercase leading-tight">{title}</p>
          {subtitle && (
            <p className="text-[11px] font-bold text-[var(--color-text-soft)] uppercase tracking-wider mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {badge && <div className="shrink-0">{badge}</div>}
      </div>

      {meta.length > 0 && (
        <div className="space-y-3">
          {meta.map((m, idx) => (
            <div key={idx} className={['flex justify-between items-center gap-4', m.className].join(' ')}>
              {m.label ? (
                <>
                  <span className="text-[10px] text-[var(--color-text-soft)] font-extrabold uppercase tracking-widest leading-none">
                    {m.label}
                  </span>
                  <span className="text-[14px] font-bold text-[var(--color-text)] text-right leading-none tabular-nums">
                    {m.value}
                  </span>
                </>
              ) : (
                <div className="text-[14px] font-bold text-[var(--color-text)] w-full">
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
