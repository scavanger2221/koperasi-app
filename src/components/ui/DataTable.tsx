export function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}
