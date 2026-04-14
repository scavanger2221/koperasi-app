import { CheckCircle, XCircle, Clock, CircleDollarSign, AlertCircle, Circle, MinusCircle, TrendingUp, TrendingDown } from 'lucide-react'

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
  active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  inactive: 'bg-slate-50 text-slate-600 border border-slate-200',
  pending: 'bg-amber-50 text-amber-700 border border-amber-200',
  approved: 'bg-blue-50 text-blue-700 border border-blue-200',
  disbursed: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
  paid: 'bg-[var(--color-primary-light)] text-[var(--color-primary)] border border-[var(--color-primary)]/20',
  deposit: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  withdrawal: 'bg-rose-50 text-rose-700 border border-rose-200',
  unpaid: 'bg-[var(--color-danger-light)] text-[var(--color-danger)] border border-[var(--color-danger)]/20',
  partial: 'bg-orange-50 text-orange-700 border border-orange-200',
  danger: 'bg-[var(--color-danger-light)] text-[var(--color-danger)] border border-[var(--color-danger)]/20',
  warning: 'bg-[var(--color-warning-light)] text-[var(--color-warning)] border border-[var(--color-warning)]/20',
  success: 'bg-[var(--color-success-light)] text-[var(--color-success)] border border-[var(--color-success)]/20',
  default: 'bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] border border-[var(--color-border)]',
}

const icons: Record<BadgeVariant, React.ComponentType<{ className?: string }>> = {
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
      className={[
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider whitespace-nowrap',
        styles[variant] || styles.default,
        className,
      ].join(' ')}
    >
      <Icon className="w-3.5 h-3.5 stroke-[2.5px]" />
      {children ?? labels[variant] ?? labels.default}
    </span>
  )
}
