import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '../../lib/utils'

export function SearchInput({
  value,
  onChange,
  placeholder = 'Cari data...',
  className = '',
  inputClassName = '',
  debounce = 400,
  onKeyDown,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  inputClassName?: string
  debounce?: number | false
  onKeyDown?: React.KeyboardEventHandler<HTMLInputElement>
}) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    if (debounce === false) return
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, debounce)

    return () => clearTimeout(timer)
  }, [localValue, onChange, value, debounce])

  return (
    <div className={cn('relative w-full', className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-primary)] pointer-events-none" strokeWidth={2.5} />
      <input
        type="text"
        value={localValue}
        onChange={(e) => {
          setLocalValue(e.target.value)
          if (debounce === false) {
            onChange(e.target.value)
          }
        }}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className={cn('!pl-10 text-sm font-semibold tracking-tight h-11 border-[var(--color-border)] w-full', inputClassName)}
      />
    </div>
  )
}
