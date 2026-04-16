import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

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
      card: 'bg-white',
      label: 'text-[var(--color-text-soft)]',
      value: 'text-[var(--color-text)]',
      iconBg: 'bg-[var(--color-bg-soft)]',
      iconText: 'text-[var(--color-text-soft)]',
    },
    success: {
      card: 'bg-white border-[var(--color-success)]/20',
      label: 'text-[var(--color-success)]',
      value: 'text-[var(--color-success)]',
      iconBg: 'bg-[var(--color-success-light)]',
      iconText: 'text-[var(--color-success)]',
    },
    danger: {
      card: 'bg-white border-[var(--color-danger)]/20',
      label: 'text-[var(--color-danger)]',
      value: 'text-[var(--color-danger)]',
      iconBg: 'bg-[var(--color-danger-light)]',
      iconText: 'text-[var(--color-danger)]',
    },
    warning: {
      card: 'bg-white border-[var(--color-warning)]/20',
      label: 'text-[var(--color-warning)]',
      value: 'text-[var(--color-warning)]',
      iconBg: 'bg-[var(--color-warning-light)]',
      iconText: 'text-[var(--color-warning)]',
    },
  }

  const t = toneClasses[tone]

  return (
    <div className={cn('card p-5 flex flex-col justify-between min-h-[128px]', t.card)}>
      <div className="flex items-start justify-between gap-2">
        <p className={cn('text-xs font-extrabold uppercase tracking-wider leading-none', t.label)}>
          {label}
        </p>
        {Icon && (
          <div className={cn('shrink-0 p-2 rounded-lg', t.iconBg, t.iconText)}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <p className={cn('text-2xl sm:text-3xl font-extrabold tabular-nums tracking-tight leading-none', t.value)}>
          {value}
        </p>
        {subtext && (
          <p className="text-xs font-semibold text-[var(--color-text-soft)] mt-2 flex items-center gap-1.5 uppercase tracking-wide">
            {subtext}
          </p>
        )}
      </div>
    </div>
  )
}
