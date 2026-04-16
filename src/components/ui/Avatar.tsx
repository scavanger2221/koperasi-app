import { cn } from '../../lib/utils'

export function Avatar({
  name,
  size = 'md',
  className = '',
}: {
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}) {
  const initial = name?.trim()?.charAt(0)?.toUpperCase() || '?'

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-20 h-20 text-2xl',
  }

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center rounded-full font-bold bg-[var(--color-primary-light)] text-[var(--color-primary-dark)]',
        sizeClasses[size],
        className
      )}
      aria-hidden
    >
      {initial}
    </div>
  )
}
