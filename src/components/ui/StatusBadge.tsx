import { CheckCircle, XCircle, Clock, CircleDollarSign, AlertCircle, Circle, MinusCircle, TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '../../lib/utils'

export type BadgeVariant =
  | 'active'
  | 'inactive'
  | 'pending'
  | 'approved'
  | 'disbursed'
  | 'paid'
  | 'deposit'
  | 'withdrawal'
  | 'unpaid'
  | 'partial'
  | 'danger'
  | 'warning'
  | 'success'
  | 'default'

const labels: Record<BadgeVariant, string> = {
  active: 'Aktif',
  inactive: 'Nonaktif',
  pending: 'Menunggu',
  approved: 'Disetujui',
  disbursed: 'Dicairkan',
  paid: 'Lunas',
  deposit: 'Setor',
  withdrawal: 'Tarik',
  unpaid: 'Belum Lunas',
  partial: 'Sebagian',
  danger: 'Bahaya',
  warning: 'Perhatian',
  success: 'Berhasil',
  default: '-',
}

const styles: Record<BadgeVariant, string> = {
  active: 'bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success)]/20',
  inactive: 'bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] border border-[var(--color-border)]',
  pending: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning)]/20',
  approved: 'bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success)]/20',
  disbursed: 'bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success)]/20',
  paid: 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/20',
  deposit: 'bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success)]/20',
  withdrawal: 'bg-[var(--color-danger-light)] text-[var(--color-danger)] border border-[var(--color-danger)]/20',
  unpaid: 'bg-[var(--color-danger-light)] text-[var(--color-danger)] border border-[var(--color-danger)]/20',
  partial: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning)]/20',
  danger: 'bg-[var(--color-danger-light)] text-[var(--color-danger)] border border-[var(--color-danger)]/20',
  warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning)]/20',
  success: 'bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success)]/20',
  default: 'bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] border border-[var(--color-border)]',
}

const icons: Record<BadgeVariant, React.ComponentType<{ className?: string; strokeWidth?: number }>> = {
  active: CheckCircle,
  inactive: MinusCircle,
  pending: Clock,
  approved: CheckCircle,
  disbursed: CircleDollarSign,
  paid: CheckCircle,
  deposit: TrendingUp,
  withdrawal: TrendingDown,
  unpaid: XCircle,
  partial: AlertCircle,
  danger: AlertCircle,
  warning: AlertCircle,
  success: CheckCircle,
  default: Circle,
}

export function StatusBadge({
  variant,
  children,
  className = '',
}: {
  variant: BadgeVariant
  children?: React.ReactNode
  className?: string
}) {
  const Icon = icons[variant] || Circle
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-extrabold uppercase tracking-wider whitespace-nowrap',
        styles[variant] || styles.default,
        className
      )}
    >
      <Icon className="w-3.5 h-3.5" strokeWidth={2.5} />
      {children ?? labels[variant] ?? labels.default}
    </span>
  )
}
