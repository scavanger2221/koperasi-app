import { Modal } from './Modal'
import { ModalFooter } from './ModalFooter'

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
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <ModalFooter
          primaryLabel={confirmText}
          secondaryLabel={cancelText}
          onPrimary={onConfirm}
          onSecondary={onClose}
          primaryVariant={variant}
        />
      }
    >
      <p className="text-sm text-[var(--color-text-soft)]">{message}</p>
    </Modal>
  )
}
