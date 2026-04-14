import { AlertCircle } from 'lucide-react'

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-[var(--color-danger-dark)] font-bold">
      <AlertCircle className="w-4 h-4 stroke-[2.5px]" />
      {message}
    </p>
  )
}
