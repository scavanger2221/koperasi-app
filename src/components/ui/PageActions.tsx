export function PageActions({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={['flex items-center justify-end gap-1', className].join(' ')}>
      {children}
    </div>
  )
}
