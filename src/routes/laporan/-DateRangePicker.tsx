import { Calendar, ChevronDown, Filter } from 'lucide-react'
import { formatDate } from '../../utils/format'
import { cn } from '../../lib/utils'

export function DateRangePicker({
  from,
  to,
  onFromChange,
  onToChange,
  onShow,
  showDatePicker,
  onFetch,
  isMobile,
}: {
  from: string
  to: string
  onFromChange: (value: string) => void
  onToChange: (value: string) => void
  onShow: () => void
  showDatePicker: boolean
  onFetch: () => void
  isMobile: boolean
}) {
  if (isMobile) {
    return (
      <div className="space-y-2">
        <button
          onClick={onShow}
          className="w-full flex items-center justify-between p-3 bg-bg border border-[var(--color-border)] rounded-md"
        >
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="w-4 h-4 text-[var(--color-text-soft)]" />
            <span>{formatDate(from, 'display')} – {formatDate(to, 'display')}</span>
          </div>
          <ChevronDown className={cn('w-4 h-4 text-[var(--color-text-soft)] transition-transform', showDatePicker && 'rotate-180')} />
        </button>
        {showDatePicker && (
          <div className="p-3 bg-bg border border-[var(--color-border)] rounded-md space-y-2">
            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-xs text-[var(--color-text-soft)] font-medium mb-1">Dari</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => onFromChange(e.target.value)}
                  className="w-full text-sm py-2 px-3 border border-[var(--color-border)] rounded-md"
                />
              </div>
              <div>
                <label className="block text-xs text-[var(--color-text-soft)] font-medium mb-1">Sampai</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => onToChange(e.target.value)}
                  className="w-full text-sm py-2 px-3 border border-[var(--color-border)] rounded-md"
                />
              </div>
            </div>
            <button
              onClick={() => { onFetch(); onShow() }}
              className="w-full btn btn-primary py-2.5"
            >
              Tampilkan
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-bg border border-[var(--color-border)] rounded-md">
      <div className="flex items-center gap-2 text-sm text-[var(--color-text-soft)]">
        <Filter className="w-4 h-4" />
        <span>Filter Tanggal:</span>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-[var(--color-text-soft)] font-medium">Dari</label>
          <input
            type="date"
            value={from}
            onChange={(e) => onFromChange(e.target.value)}
            className="w-auto text-sm py-1.5 px-2 border border-[var(--color-border)] rounded-md"
          />
        </div>
        <div className="flex items-end pb-1.5 text-[var(--color-text-soft)] text-sm">s/d</div>
        <div className="flex flex-col gap-0.5">
          <label className="text-xs text-[var(--color-text-soft)] font-medium">Sampai</label>
          <input
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="w-auto text-sm py-1.5 px-2 border border-[var(--color-border)] rounded-md"
          />
        </div>
      </div>
      <div className="ml-auto">
        <button onClick={onFetch} className="btn btn-primary flex items-center gap-1.5">
          <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
          Tampilkan
        </button>
      </div>
    </div>
  )
}
