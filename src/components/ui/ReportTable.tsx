import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { DataTable } from './DataTable'
import { TablePagination } from './TablePagination'
import { PAGE_SIZE } from '../../constants/pagination'

export interface ReportTableProps<T> {
  columns: { key: string; header: ReactNode; className?: string }[]
  rows: T[]
  renderRow: (row: T, index: number) => ReactNode
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  emptyMessage?: string
}

export function ReportTable<T>({
  columns,
  rows,
  renderRow,
  page,
  totalPages,
  onPageChange,
  emptyMessage = 'Tidak ada data',
}: ReportTableProps<T>) {
  const paginatedRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <DataTable className="overflow-hidden p-0">
      <table>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={cn('text-left', col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {paginatedRows.map((row, idx) => renderRow(row, idx))}
        </tbody>
      </table>
      {rows.length === 0 && (
        <div className="text-center py-8 text-[var(--color-text-soft)]">{emptyMessage}</div>
      )}
      {rows.length > 0 && (
        <TablePagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
          totalItems={rows.length}
          pageSize={PAGE_SIZE}
        />
      )}
    </DataTable>
  )
}
