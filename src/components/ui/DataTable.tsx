import { cn } from '../../lib/utils'

export function DataTable({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('card overflow-hidden', className)}>
      <div className="overflow-x-auto">{children}</div>
    </div>
  )
}
