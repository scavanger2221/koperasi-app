import { X } from 'lucide-react'

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  footer,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  footer?: React.ReactNode
}) {
  if (!open) return null

  const sizeClasses = {
    sm: 'md:max-w-sm',
    md: 'md:max-w-md',
    lg: 'md:max-w-lg',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px]" 
        onClick={onClose} 
      />
      
      {/* Content */}
      <div 
        className={[
          'relative bg-white w-full h-[90vh] md:h-auto max-h-[90vh] shadow-2xl flex flex-col',
          'rounded-t-2xl md:rounded-xl border-x border-t md:border border-[var(--color-border)]',
          'animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-4 duration-300',
          sizeClasses[size]
        ].join(' ')}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-[16px] font-extrabold tracking-tight text-[var(--color-text)] uppercase">{title}</h2>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-lg hover:bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] transition-colors border border-transparent hover:border-[var(--color-border)]"
          >
            <X className="w-5 h-5 stroke-[2.5px]" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        {footer && (
          <div className="sticky bottom-0 bg-[var(--color-bg-soft)] border-t border-[var(--color-border)] p-6 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
