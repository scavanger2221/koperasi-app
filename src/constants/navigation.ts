import { Home, Users, Wallet, FileText, Receipt, BarChart3 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

export const navItems: NavItem[] = [
  { to: '/', label: 'Beranda', icon: Home },
  { to: '/anggota', label: 'Anggota', icon: Users },
  { to: '/simpanan', label: 'Simpanan', icon: Wallet },
  { to: '/pinjaman', label: 'Pinjaman', icon: FileText },
  { to: '/angsuran', label: 'Angsuran', icon: Receipt },
  { to: '/laporan', label: 'Laporan', icon: BarChart3 },
]
