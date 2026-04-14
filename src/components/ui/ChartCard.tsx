import type { ReactNode } from 'react'

export function ChartCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="card p-6 shadow-sm">
      <h3 className="text-[13px] font-extrabold text-[var(--color-text)] uppercase tracking-wider mb-6 pb-3 border-b border-[var(--color-border)] inline-block">
        {title}
      </h3>
      <div className="h-72 min-h-[288px]">
        {children}
      </div>
    </div>
  )
}
