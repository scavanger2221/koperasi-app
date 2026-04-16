import { AlertCircle } from 'lucide-react'

export function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return (
    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-[var(--color-danger)] font-bold">
      <AlertCircle className="w-4 h-4" strokeWidth={2.5} />
      {message}
    </p>
  )
}
