import { cn } from '../../lib/utils'

export function ErrorAlert({ message, className = '' }: { message: string; className?: string }) {
  return (
    <div
      className={cn(
        'mb-4 p-3 rounded-xl bg-[var(--color-danger-light)] text-[var(--color-danger)] font-semibold text-sm',
        className
      )}
    >
      {message}
    </div>
  )
}
