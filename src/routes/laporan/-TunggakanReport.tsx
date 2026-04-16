import { AlertTriangle } from 'lucide-react'
import { MetricCard } from '../../components/ui/MetricCard'
import { EntityCard } from '../../components/ui/EntityCard'
import { EmptyState } from '../../components/ui/EmptyState'
import { TablePagination } from '../../components/ui/TablePagination'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { ReportTable } from '../../components/ui/ReportTable'
import { CellMember, CellCurrency } from '../../components/ui/table-cells'
import { PAGE_SIZE } from '../../constants/pagination'
import { formatCurrency, formatDate } from '../../utils/format'

interface TunggakanRow {
  id: number
  dueDate: string | number
  installmentNumber: number
  totalAmount: number
  pinjaman?: { member?: { name: string } }
}

interface TunggakanReportProps {
  data: {
    count: number
    totalDue: number
    rows: TunggakanRow[]
  }
  isMobile: boolean
  error?: string
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function TunggakanReport({ data, isMobile, error, page, totalPages, onPageChange }: TunggakanReportProps) {
  const paginatedRows = data.rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (error) return <ErrorAlert message={error} />

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MetricCard label="Jumlah Tunggakan" value={data.count} subtext="angsuran" tone="danger" />
        <MetricCard label="Total Tunggakan" value={formatCurrency(data.totalDue)} tone="danger" />
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {paginatedRows.map((r) => (
            <EntityCard
              key={r.id}
              title={r.pinjaman?.member?.name || 'Tidak diketahui'}
              subtitle={`Angsuran ke-${r.installmentNumber}`}
              meta={[
                { label: 'Jatuh Tempo', value: formatDate(r.dueDate, 'display') },
                { label: 'Total', value: formatCurrency(r.totalAmount), className: 'text-[var(--color-danger)]' },
              ]}
            />
          ))}
          {data.rows.length === 0 && <EmptyState icon={AlertTriangle} message="Tidak ada data tunggakan." />}
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
            { key: 'dueDate', header: 'Jatuh Tempo' },
            { key: 'member', header: 'Anggota' },
            { key: 'installment', header: 'Ke' },
            { key: 'total', header: 'Total', className: 'text-right' },
          ]}
          rows={data.rows}
          renderRow={(r) => (
            <tr key={r.id}>
              <td>{formatDate(r.dueDate, 'short')}</td>
              <CellMember name={r.pinjaman?.member?.name || '?'} />
              <td>{r.installmentNumber}</td>
              <CellCurrency>{formatCurrency(r.totalAmount)}</CellCurrency>
            </tr>
          )}
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          emptyMessage="Tidak ada data tunggakan."
        />
      )}
    </div>
  )
}
