import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function MobileRow({
  header,
  meta,
  badge,
  children,
  actions,
}: {
  header: React.ReactNode
  meta?: React.ReactNode
  badge?: React.ReactNode
  children?: React.ReactNode
  actions?: React.ReactNode
}) {
  const [open, setOpen] = useState(false)
  const expandable = !!children

  return (
    <div className="card p-0 overflow-hidden">
      <div className="w-full flex items-start justify-between gap-3 p-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-start gap-2">
            <p className="text-sm font-medium break-words text-[var(--color-text)]">{header}</p>
            {badge && <div className="shrink-0 pt-0.5">{badge}</div>}
          </div>
          {meta && <p className="text-[12px] text-[var(--color-text-soft)] truncate mt-0.5">{meta}</p>}
        </div>
        <div className="flex items-center gap-1 shrink-0 pt-0.5">
          {actions}
          {expandable && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="inline-flex items-center justify-center w-8 h-8 rounded-md text-[var(--color-text-soft)] hover:bg-[var(--color-bg-soft)] transition-colors"
              aria-label={open ? 'Tutup detail' : 'Buka detail'}
            >
              <ChevronDown className={['w-4 h-4 transition-transform', open ? 'rotate-180' : ''].join(' ')} />
            </button>
          )}
        </div>
      </div>
      {open && children && (
        <div className="px-3 pb-3 border-t border-[var(--color-border)] pt-2">
          {children}
        </div>
      )}
    </div>
  )
}
