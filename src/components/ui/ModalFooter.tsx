import { cn } from '../../lib/utils'

export function ModalFooter({
  primaryLabel = 'Simpan',
  secondaryLabel = 'Batal',
  onPrimary,
  onSecondary,
  primaryDisabled = false,
  secondaryDisabled = false,
  primaryVariant = 'primary',
  showSecondary = true,
  primaryType = 'button',
  form,
  extra,
  children,
}: {
  primaryLabel?: string
  secondaryLabel?: string
  onPrimary: () => void
  onSecondary?: () => void
  primaryDisabled?: boolean
  secondaryDisabled?: boolean
  primaryVariant?: 'primary' | 'secondary' | 'danger'
  showSecondary?: boolean
  primaryType?: 'button' | 'submit'
  form?: string
  extra?: React.ReactNode
  children?: React.ReactNode
}) {
  const primaryClass = {
    primary: 'btn btn-primary',
    secondary: 'btn btn-secondary',
    danger: 'btn btn-danger',
  }[primaryVariant]

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-2">
      {showSecondary && (
        <button
          type="button"
          onClick={onSecondary}
          disabled={secondaryDisabled}
          className="btn btn-secondary flex-1"
        >
          {secondaryLabel}
        </button>
      )}
      {extra}
      <button
        type={primaryType}
        form={form}
        onClick={onPrimary}
        disabled={primaryDisabled}
        className={cn(primaryClass, 'flex-1')}
      >
        {primaryLabel}
      </button>
      {children}
    </div>
  )
}
