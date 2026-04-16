import { formatCurrency } from '../utils/format'

export const ERROR_MESSAGES = {
  SESSION_INVALID: 'Sesi tidak valid',
  FETCH_FAILED: 'Gagal memuat data',
  SAVE_FAILED: 'Gagal menyimpan',
  DELETE_FAILED: 'Gagal menghapus',
  DISBURSE_FAILED: 'Gagal mencairkan',
  NOT_FOUND: (entity: string) => `${entity} tidak ditemukan`,
} as const

export const SUCCESS_MESSAGES = {
  MEMBER_CREATED: 'Anggota berhasil ditambahkan',
  MEMBER_UPDATED: 'Data anggota berhasil diperbarui',
  MEMBER_DEACTIVATED: 'Anggota dinonaktifkan',
  SIMPANAN_CREATED: (amount: number) => `Transaksi simpanan ${formatCurrency(amount)} berhasil disimpan`,
  PINJAMAN_CREATED: 'Pinjaman berhasil diajukan',
  PINJAMAN_DISBURSED: 'Pinjaman berhasil dicairkan',
  ANGSURAN_PAID: (sisa: number) => `Angsuran berhasil dibayar. Sisa: ${formatCurrency(sisa)}`,
} as const
