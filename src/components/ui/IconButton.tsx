export function IconButton({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  className = '',
  showLabel = false,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  variant?: 'default' | 'danger' | 'primary'
  className?: string
  showLabel?: boolean
}) {
  const base = 'inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg transition-all min-h-[40px] shadow-sm hover:shadow-md'
  const themes = {
    default: 'bg-white text-[var(--color-text-soft)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text)] border border-[var(--color-border)]',
    danger: 'bg-white text-[var(--color-danger)] hover:bg-[var(--color-danger-light)] border border-[var(--color-danger)]/30',
    primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] border border-[var(--color-primary)]/20',
  }

  return (
    <button
      onClick={onClick}
      className={[base, themes[variant], className].join(' ')}
      aria-label={label}
      title={label}
    >
      <Icon className={["w-4 h-4", variant === 'primary' ? "stroke-[3px]" : "stroke-[2.5px]"].join(' ')} />
      {showLabel && <span className="text-[11px] font-black uppercase tracking-widest">{label}</span>}
    </button>
  )
}
