import type { LucideProps } from 'lucide-react'
import type { ReactNode, ComponentType } from 'react'
import { cn } from '../../lib/utils'

export function EmptyState({
  icon: Icon,
  message,
  submessage,
  action,
  className = '',
}: {
  icon: ComponentType<LucideProps>
  message: string
  submessage?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('card text-center py-16 px-6 bg-[var(--color-bg-soft)]/50 border-dashed border-2', className)}>
      <div className="w-20 h-20 mx-auto mb-6 rounded-xl bg-white border border-[var(--color-border)] flex items-center justify-center text-[var(--color-primary)]">
        <Icon className="w-10 h-10" strokeWidth={1.5} />
      </div>
      <p className="text-lg font-extrabold text-[var(--color-text)] tracking-tight uppercase">{message}</p>
      {submessage && (
        <p className="text-sm font-medium text-[var(--color-text-soft)] mt-2 max-w-[280px] mx-auto leading-relaxed">
          {submessage}
        </p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  )
}
