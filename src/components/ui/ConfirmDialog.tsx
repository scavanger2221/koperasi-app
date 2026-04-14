export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Ya, lanjutkan',
  cancelText = 'Batal',
  variant = 'danger',
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'primary'
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-xl shadow-lg p-4">
        <h3 className="text-sm font-semibold mb-1">{title}</h3>
        <p className="text-[13px] text-[var(--color-text-soft)] mb-4">{message}</p>
        <div className="flex flex-col-reverse sm:flex-row gap-2">
          <button onClick={onClose} className="btn btn-secondary flex-1">
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={['btn flex-1', variant === 'danger' ? 'btn-danger' : 'btn-primary'].join(' ')}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
