import { Calendar } from 'lucide-react'
import { MetricCard } from '../../components/ui/MetricCard'
import { EntityCard } from '../../components/ui/EntityCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { TablePagination } from '../../components/ui/TablePagination'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { ReportTable } from '../../components/ui/ReportTable'
import { CellMember, CellCurrency } from '../../components/ui/table-cells'
import { PAGE_SIZE } from '../../constants/pagination'
import { formatCurrency, formatDate } from '../../utils/format'

interface AngsuranRow {
  id: number
  paidDate?: string | number
  installmentNumber: number
  paidAmount: number
  penaltyAmount: number
  pinjaman?: { member?: { name: string } }
}

interface AngsuranReportProps {
  data: {
    totalPaid: number
    totalPenalty: number
    rows: AngsuranRow[]
  }
  isMobile: boolean
  error?: string
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function AngsuranReport({ data, isMobile, error, page, totalPages, onPageChange }: AngsuranReportProps) {
  const paginatedRows = data.rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (error) return <ErrorAlert message={error} />

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MetricCard label="Total Diterima" value={formatCurrency(data.totalPaid)} tone="success" />
        <MetricCard label="Total Denda" value={formatCurrency(data.totalPenalty)} tone="warning" />
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {paginatedRows.map((r) => (
            <EntityCard
              key={r.id}
              title={r.pinjaman?.member?.name || 'Tidak diketahui'}
              subtitle={`Angsuran ke-${r.installmentNumber}`}
              meta={[
                { label: 'Tanggal Bayar', value: r.paidDate ? formatDate(r.paidDate, 'display') : '-' },
                { label: 'Denda', value: r.penaltyAmount > 0 ? formatCurrency(r.penaltyAmount) : '-' },
                { label: 'Jumlah Bayar', value: formatCurrency(r.paidAmount), className: 'text-[var(--color-success)]' },
              ]}
            />
          ))}
          {data.rows.length === 0 && <EmptyState icon={Calendar} message="Tidak ada data laporan angsuran." />}
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
            { key: 'paidDate', header: 'Tanggal Bayar' },
            { key: 'member', header: 'Anggota' },
            { key: 'installment', header: 'Ke' },
            { key: 'paid', header: 'Bayar', className: 'text-right' },
            { key: 'penalty', header: 'Denda', className: 'text-right' },
          ]}
          rows={data.rows}
          renderRow={(r) => (
            <tr key={r.id}>
              <td>{r.paidDate ? formatDate(r.paidDate, 'short') : '-'}</td>
              <CellMember name={r.pinjaman?.member?.name || '?'} />
              <td>{r.installmentNumber}</td>
              <CellCurrency>{formatCurrency(r.paidAmount)}</CellCurrency>
              <CellCurrency>{r.penaltyAmount > 0 ? formatCurrency(r.penaltyAmount) : '-'}</CellCurrency>
            </tr>
          )}
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          emptyMessage="Tidak ada data laporan angsuran."
        />
      )}
    </div>
  )
}
