export const MEMBER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const
export type MemberStatus = typeof MEMBER_STATUS[keyof typeof MEMBER_STATUS]

export const SIMPANAN_TYPE = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
} as const
export type SimpananType = typeof SIMPANAN_TYPE[keyof typeof SIMPANAN_TYPE]

export const PINJAMAN_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  DISBURSED: 'disbursed',
  PAID: 'paid',
} as const
export type PinjamanStatus = typeof PINJAMAN_STATUS[keyof typeof PINJAMAN_STATUS]

export const ANGSURAN_STATUS = {
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
  PAID: 'paid',
} as const
export type AngsuranStatus = typeof ANGSURAN_STATUS[keyof typeof ANGSURAN_STATUS]

export const BADGE_VARIANT = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  DISBURSED: 'disbursed',
  PAID: 'paid',
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  PARTIAL: 'partial',
  DANGER: 'danger',
  WARNING: 'warning',
  SUCCESS: 'success',
} as const
export type BadgeVariant = typeof BADGE_VARIANT[keyof typeof BADGE_VARIANT]
