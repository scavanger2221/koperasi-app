import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export function formatCurrency(n?: number | null): string {
  if (n == null || Number.isNaN(n)) return 'Rp -'
  return `Rp ${n.toLocaleString('id-ID')}`
}

export function toDate(value: Date | string | number): Date {
  if (value instanceof Date) return value
  const d = new Date(value as string | number)
  if (isNaN(d.getTime())) throw new Error(`Invalid date: ${value}`)
  return d
}

export function formatDate(date: Date | string | number | undefined | null, type: 'input' | 'display' | 'short'): string {
  if (date == null) return '-'
  const d = toDate(date)
  switch (type) {
    case 'input': return format(d, 'yyyy-MM-dd')
    case 'short': return format(d, 'dd/MM/yyyy', { locale: id })
    case 'display': return format(d, 'dd MMM yyyy', { locale: id })
  }
}
