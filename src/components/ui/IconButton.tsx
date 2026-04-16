import { cn } from '../../lib/utils'

export function IconButton({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  className = '',
  showLabel = false,
}: {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  label: string
  onClick: () => void
  variant?: 'default' | 'danger' | 'primary' | 'ghost'
  className?: string
  showLabel?: boolean
}) {
  const base = 'inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg transition-all min-h-[44px] min-w-[44px]'
  const themes = {
    default: 'bg-white text-[var(--color-text-soft)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text)] border border-[var(--color-border)]',
    danger: 'bg-white text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] border border-[var(--color-danger)]/30',
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]',
    ghost: 'bg-transparent text-[var(--color-text-soft)] hover:bg-[var(--color-bg-soft)] border border-transparent hover:border-[var(--color-border)]',
  }

  return (
    <button
      onClick={onClick}
      className={cn(base, themes[variant], className)}
      aria-label={label}
      title={label}
    >
      <Icon className="w-4 h-4" strokeWidth={variant === 'primary' ? 3 : 2.5} />
      {showLabel && <span className="text-xs font-black uppercase tracking-widest">{label}</span>}
    </button>
  )
}
