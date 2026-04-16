import { Receipt } from 'lucide-react'
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

interface PinjamanRow {
  id: number
  applicationDate: string | number
  member?: { name: string }
  jenis?: { name: string }
  principal: number
  status: string
  tenorMonths: number
}

interface PinjamanReportProps {
  data: {
    totalPrincipal: number
    totalInterest: number
    rows: PinjamanRow[]
  }
  isMobile: boolean
  error?: string
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PinjamanReport({ data, isMobile, error, page, totalPages, onPageChange }: PinjamanReportProps) {
  const paginatedRows = data.rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  if (error) return <ErrorAlert message={error} />

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <MetricCard label="Total Pokok" value={formatCurrency(data.totalPrincipal)} />
        <MetricCard label="Total Bunga" value={formatCurrency(data.totalInterest)} tone="warning" />
      </div>

      {isMobile ? (
        <div className="space-y-3">
          {paginatedRows.map((r) => (
            <EntityCard
              key={r.id}
              title={r.member?.name || 'Tidak diketahui'}
              subtitle={[r.jenis?.name, `${r.tenorMonths} bulan`].filter(Boolean).join(' • ')}
              badge={<StatusBadge variant={r.status as any} />}
              meta={[
                { label: 'Jenis', value: r.jenis?.name },
                { label: 'Pokok', value: formatCurrency(r.principal) },
              ]}
            />
          ))}
          {data.rows.length === 0 && <EmptyState icon={Receipt} message="Tidak ada data laporan pinjaman." />}
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
            { key: 'principal', header: 'Pokok', className: 'text-right' },
            { key: 'status', header: 'Status' },
          ]}
          rows={data.rows}
          renderRow={(r) => (
            <tr key={r.id}>
              <td>{formatDate(r.applicationDate, 'short')}</td>
              <CellMember name={r.member?.name || '?'} />
              <td>{r.jenis?.name}</td>
              <CellCurrency>{formatCurrency(r.principal)}</CellCurrency>
              <td><StatusBadge variant={r.status as any} /></td>
            </tr>
          )}
          page={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          emptyMessage="Tidak ada data laporan pinjaman."
        />
      )}
    </div>
  )
}
