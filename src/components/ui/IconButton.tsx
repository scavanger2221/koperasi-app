export function IconButton({
  icon: Icon,
  label,
  onClick,
  variant = 'default',
  className = '',
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  variant?: 'default' | 'danger' | 'primary'
  className?: string
}) {
  const base = 'inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors'
  const themes = {
    default: 'text-[var(--color-text-soft)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text)]',
    danger: 'text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]',
    primary: 'text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]',
  }

  return (
    <button
      onClick={onClick}
      className={[base, themes[variant], className].join(' ')}
      aria-label={label}
      title={label}
    >
      <Icon className="w-4 h-4" />
    </button>
  )
}
