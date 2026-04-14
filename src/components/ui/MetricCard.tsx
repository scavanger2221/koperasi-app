import type { LucideIcon } from 'lucide-react'

export function MetricCard({
  label,
  value,
  subtext,
  tone = 'default',
  icon: Icon,
}: {
  label: string
  value: string | number
  subtext?: string
  tone?: 'default' | 'danger' | 'success' | 'warning'
  icon?: LucideIcon
}) {
  const toneClasses = {
    default: {
      bg: 'bg-white',
      iconBg: 'bg-[var(--color-bg-soft)]',
      iconText: 'text-[var(--color-text-soft)]',
      value: 'text-[var(--color-text)]',
    },
    success: {
      bg: 'bg-[var(--color-success-light)]',
      iconBg: 'bg-white/70',
      iconText: 'text-[var(--color-success)]',
      value: 'text-[var(--color-success)]',
    },
    danger: {
      bg: 'bg-[var(--color-danger-light)]',
      iconBg: 'bg-white/70',
      iconText: 'text-[var(--color-danger)]',
      value: 'text-[var(--color-danger)]',
    },
    warning: {
      bg: 'bg-[var(--color-warning-light)]',
      iconBg: 'bg-white/70',
      iconText: 'text-[var(--color-warning-dark)]',
      value: 'text-[var(--color-warning-dark)]',
    },
  }

  const t = toneClasses[tone]

  return (
    <div className={['card p-4 overflow-hidden min-h-[120px] flex flex-col justify-between', t.bg].join(' ')}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[12px] text-[var(--color-text-soft)] font-bold uppercase tracking-wide truncate leading-tight">
          {label}
        </p>
        {Icon && (
          <div className={['shrink-0 p-1.5 rounded-md', t.iconBg, t.iconText].join(' ')}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-2">
        <p className={['text-xl sm:text-2xl md:text-[28px] font-bold tabular-nums leading-none break-words', t.value].join(' ')}>
          {value}
        </p>
        {subtext && (
          <p className="text-[12px] text-[var(--color-text-soft)] mt-1.5 leading-tight">
            {subtext}
          </p>
        )}
      </div>
    </div>
  )
}
