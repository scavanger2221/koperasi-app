import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'

export function SearchInput({
  value,
  onChange,
  placeholder = 'Cari data...',
  className = '',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}) {
  const [localValue, setLocalValue] = useState(value)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    const timer = setTimeout(() => {
      if (localValue !== value) {
        onChange(localValue)
      }
    }, 400) // 400ms debounce

    return () => clearTimeout(timer)
  }, [localValue, onChange, value])

  return (
    <div className={['relative w-full sm:max-w-xs', className].join(' ')}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-primary)] stroke-[2.5px] pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="!pl-10 text-sm font-semibold tracking-tight h-11 border-[var(--color-border)] shadow-sm focus:shadow-md"
      />
    </div>
  )
}
