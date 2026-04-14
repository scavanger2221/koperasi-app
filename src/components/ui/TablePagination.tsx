import { ChevronLeft, ChevronRight } from 'lucide-react'

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  pageSize,
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems: number
  pageSize: number
}) {
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const end = Math.min(currentPage * pageSize, totalItems)

  const btnClass = "inline-flex items-center justify-center w-10 h-10 rounded-lg border border-[var(--color-border)] bg-white text-[var(--color-text-soft)] hover:bg-[var(--color-bg-soft)] hover:text-[var(--color-text)] transition-all disabled:opacity-30 disabled:cursor-not-allowed";

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-[var(--color-border)] bg-[var(--color-bg-soft)]/30">
      <p className="text-[13px] font-medium text-[var(--color-text-soft)]">
        Menampilkan <span className="font-extrabold text-[var(--color-text)]">{start}</span> –{' '}
        <span className="font-extrabold text-[var(--color-text)]">{end}</span> dari{' '}
        <span className="font-extrabold text-[var(--color-text)]">{totalItems}</span> data
      </p>
      
      <div className="flex items-center gap-3">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className={btnClass}
          aria-label="Halaman sebelumnya"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.5px]" />
        </button>
        
        <div className="min-w-[4.5rem] text-center">
          <span className="text-[13px] font-extrabold text-[var(--color-text)] tracking-wider">
            {currentPage} <span className="text-[var(--color-text-soft)] font-medium mx-1">/</span> {Math.max(1, totalPages)}
          </span>
        </div>
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className={btnClass}
          aria-label="Halaman berikutnya"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.5px]" />
        </button>
      </div>
    </div>
  )
}
