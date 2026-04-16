import { BarChart3 } from 'lucide-react'
import { MetricCard } from '../../components/ui/MetricCard'
import { EntityCard } from '../../components/ui/EntityCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { TablePagination } from '../../components/ui/TablePagination'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { ReportTable } from '../../components/ui/ReportTable'
import { CellMember, CellCurrency } from '../../components/ui/table-cells'
import { PAGE_SIZE } from '../../constants/pagination'
import { formatCurrency, formatDate } from '../../utils/format'

interface SimpananRow {
  id: number
  date: string | number
  member?: { name: string }
  jenis?: { name: string }
  type: 'deposit' | 'withdrawal'
  amount: number
}

interface SimpananReportProps {
  data: {
    totalDeposit: number
    totalWithdrawal: number
    net: number
    rows: SimpananRow[]
  }
  isMobile: boolean
  error?: string
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function SimpananReport({ data, isMobile, error, page, totalPages, onPageChange }: SimpananReportProps) {
  const paginatedRows = data.rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (error) return <ErrorAlert message={error} />

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Total Setoran" value={formatCurrency(data.totalDeposit)} tone="success" />
        <MetricCard label="Total Penarikan" value={formatCurrency(data.totalWithdrawal)} tone="danger" />
        <MetricCard label="Sisa Simpanan" value={formatCurrency(data.net)} />
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {paginatedRows.map((r) => (
            <EntityCard
              key={r.id}
              title={r.member?.name || 'Tidak diketahui'}
              subtitle={formatDate(r.date, 'display')}
              badge={<StatusBadge variant={r.type === 'deposit' ? 'deposit' : 'withdrawal'} />}
              meta={[
                { label: 'Jenis', value: r.jenis?.name },
                { label: 'Jumlah', value: formatCurrency(r.amount), className: r.type === 'deposit' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]' },
              ]}
            />
          ))}
          {data.rows.length === 0 && <EmptyState icon={BarChart3} message="Tidak ada data laporan simpanan." />}
          {data.rows.length > 0 && (
            <TablePagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
              totalItems={data.rows.length}
              pageSize={PAGE_SIZE}
            />
          )}
        </div>
      ) : (
        <ReportTable
          columns={[
            { key: 'date', header: 'Tanggal' },
            { key: 'member', header: 'Anggota' },
            { key: 'jenis', header: 'Jenis' },
            { key: 'type', header: 'Tipe' },
            { key: 'amount', header: 'Jumlah', className: 'text-right' },
          ]}
          rows={data.rows}
          renderRow={(r) => (
            <tr key={r.id}>
              <td>{formatDate(r.date, 'short')}</td>
              <CellMember name={r.member?.name || '?'} />
              <td>{r.jenis?.name}</td>
              <td>
                <StatusBadge variant={r.type === 'deposit' ? 'deposit' : 'withdrawal'} />
              </td>
              <CellCurrency>{formatCurrency(r.amount)}</CellCurrency>
            </tr>
          )}
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          emptyMessage="Tidak ada data laporan simpanan."
        />
      )}
    </div>
  )
}
