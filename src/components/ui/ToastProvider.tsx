import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle, AlertCircle, X, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void
  success: (message: string) => void
  error: (message: string) => void
  info: (message: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).slice(2)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => removeToast(id), 4000)
  }, [removeToast])

  const success = useCallback((message: string) => toast(message, 'success'), [toast])
  const error = useCallback((message: string) => toast(message, 'error'), [toast])
  const info = useCallback((message: string) => toast(message, 'info'), [toast])

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  )
}

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-3 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  )
}

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(0)
    }, 10)
    return () => clearTimeout(timer)
  }, [])

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-[var(--color-success)] stroke-[2.5px]" />,
    error: <AlertCircle className="w-5 h-5 text-[var(--color-danger)] stroke-[2.5px]" />,
    info: <Info className="w-5 h-5 text-[var(--color-primary)] stroke-[2.5px]" />,
  }

  const accentColors = {
    success: 'var(--color-success)',
    error: 'var(--color-danger)',
    info: 'var(--color-primary)',
  }

  return (
    <div
      className={[
        'pointer-events-auto w-full bg-white border border-[var(--color-border)] rounded-xl shadow-lg p-4 flex items-start gap-4 overflow-hidden relative group transition-all animate-in fade-in slide-in-from-top-4 duration-300',
      ].join(' ')}
    >
      <div className="shrink-0 mt-0.5">{icons[toast.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-[14px] font-bold text-[var(--color-text)] leading-tight">{toast.message}</p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="shrink-0 p-1 rounded-md hover:bg-[var(--color-bg-soft)] text-[var(--color-text-soft)] transition-colors"
        aria-label="Tutup"
      >
        <X className="w-4 h-4 stroke-[2.5px]" />
      </button>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--color-bg-soft)]">
        <div
          className="h-full ease-linear"
          style={{
            width: `${progress}%`,
            transition: 'width 3.99s linear',
            backgroundColor: accentColors[toast.type],
          }}
        />
      </div>
    </div>
  )
}
