import type { LucideIcon } from 'lucide-react'

export function EmptyState({
  icon: Icon,
  message,
  className = '',
}: {
  icon: LucideIcon
  message: string
  className?: string
}) {
  return (
    <div className={['card text-center py-10', className].join(' ')}>
      <Icon className="w-10 h-10 mx-auto text-[var(--color-text-soft)] mb-2 opacity-60" />
      <p className="text-sm text-[var(--color-text-soft)]">{message}</p>
    </div>
  )
}
