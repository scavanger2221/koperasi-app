export function Toolbar({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={['flex flex-col sm:flex-row sm:items-center gap-3 justify-between', className].join(' ')}>
      {children}
    </div>
  )
}
