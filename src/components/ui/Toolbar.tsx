import { cn } from '../../lib/utils'

export function Toolbar({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-col sm:flex-row sm:items-center gap-3 justify-between', className)}>
      {children}
    </div>
  )
}
