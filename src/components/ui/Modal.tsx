import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { IconButton } from './IconButton'

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
    <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center p-0 md:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[var(--color-text)]/40 backdrop-blur-[2px]" 
        onClick={onClose} 
      />
      
      {/* Content */}
      <div
        className={cn(
          'relative bg-white w-full h-[90vh] md:h-auto max-h-[90vh] flex flex-col',
          'rounded-t-xl md:rounded-xl border-x border-t md:border border-[var(--color-border)]',
          'animate-in slide-in-from-bottom-10 md:slide-in-from-bottom-4 duration-300',
          sizeClasses[size]
        )}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
          <h2 className="text-lg font-extrabold tracking-tight text-[var(--color-text)] uppercase">{title}</h2>
          <IconButton icon={X} label="Tutup" onClick={onClose} variant="ghost" />
        </div>
        
        <div className="flex-1 overflow-y-auto min-h-0 p-6">
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
