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
  active: 'bg-[var(--color-success)] text-white',
  inactive: 'bg-[#6B7280] text-white',
  pending: 'bg-[var(--color-warning)] text-black',
  approved: 'bg-[#2563EB] text-white',
  disbursed: 'bg-[var(--color-success)] text-white',
  paid: 'bg-[var(--color-success)] text-white',
  deposit: 'bg-[var(--color-success)] text-white',
  withdrawal: 'bg-[var(--color-danger)] text-white',
  unpaid: 'bg-[var(--color-danger)] text-white',
  partial: 'bg-[var(--color-warning)] text-black',
  danger: 'bg-[var(--color-danger)] text-white',
  warning: 'bg-[var(--color-warning)] text-black',
  success: 'bg-[var(--color-success)] text-white',
  default: 'bg-[var(--color-bg-soft)] text-[var(--color-text)] border border-[var(--color-border)]',
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
  return (
    <span
      className={[
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-bold whitespace-nowrap',
        styles[variant] || styles.default,
        className,
      ].join(' ')}
    >
      {children ?? labels[variant] ?? labels.default}
    </span>
  )
}
