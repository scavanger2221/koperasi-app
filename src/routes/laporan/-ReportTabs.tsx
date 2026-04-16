import { BarChart3, Receipt, Calendar, AlertTriangle } from 'lucide-react'
import { cn } from '../../lib/utils'

const tabs = [
  { key: 'simpanan', label: 'Simpanan', icon: BarChart3 },
  { key: 'pinjaman', label: 'Pinjaman', icon: Receipt },
  { key: 'angsuran', label: 'Angsuran', icon: Calendar },
  { key: 'tunggakan', label: 'Tunggakan', icon: AlertTriangle },
] as const

type TabKey = (typeof tabs)[number]['key']

export function ReportTabs({
  currentTab,
  onTabChange,
  isMobile,
}: {
  currentTab: TabKey
  onTabChange: (tab: TabKey) => void
  isMobile: boolean
}) {
  return (
    <div className={cn(isMobile ? 'flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide' : 'flex gap-2 flex-wrap')}>
      {tabs.map((t) => {
        const Icon = t.icon
        const active = currentTab === t.key
        return (
          <button
            key={t.key}
            onClick={() => { onTabChange(t.key) }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-3 rounded-md font-medium text-sm shrink-0',
              active
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-bg border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]'
            )}
          >
            <Icon className="w-4 h-4" />
            {t.label}
          </button>
        )
      })}
    </div>
  )
}
