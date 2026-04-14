import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'

export function SearchInput({
  value,
  onChange,
  placeholder = 'Cari...',
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
    <div className={['relative', className].join(' ')}>
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-soft)]/70 pointer-events-none" />
      <input
        type="text"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder={placeholder}
        className="!pl-11"
      />
    </div>
  )
}
