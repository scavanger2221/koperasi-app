import type { ReactNode } from 'react'
import { cn } from '../../lib/utils'
import { Avatar } from './Avatar'

export function CellNumber({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('text-center text-[var(--color-text-soft)] font-semibold', className)}>{children}</td>
}

export function CellCurrency({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn('text-right font-semibold tabular-nums', className)}>{children}</td>
}

export function CellMember({ name, className }: { name: string; className?: string }) {
  return (
    <td className={cn('font-medium', className)}>
      <div className="flex items-center gap-3">
        <Avatar name={name} size="sm" />
        <span>{name}</span>
      </div>
    </td>
  )
}
