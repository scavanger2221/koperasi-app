import { FieldError } from './FieldError'
import type { ReactNode } from 'react'

export function FormField({
  label,
  htmlFor,
  children,
  error,
  className = '',
  labelClassName = '',
}: {
  label: string
  htmlFor: string
  children: ReactNode
  error?: string
  className?: string
  labelClassName?: string
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className={labelClassName}>
        {label}
      </label>
      {children}
      {error && <FieldError message={error} />}
    </div>
  )
}
