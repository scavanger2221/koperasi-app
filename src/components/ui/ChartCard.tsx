export function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-4">
      <h3 className="text-sm font-semibold mb-3">{title}</h3>
      <div className="h-64 min-h-[256px]">{children}</div>
    </div>
  )
}
