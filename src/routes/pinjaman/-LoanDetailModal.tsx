import { Modal } from '../../components/ui/Modal'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { Avatar } from '../../components/ui/Avatar'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { DataTable } from '../../components/ui/DataTable'
import { CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { formatCurrency } from '../../utils/format'

interface AngsuranItem {
  id: number
  installmentNumber: number
  dueDate: string | number
  totalAmount: number
  status: 'paid' | 'partial' | 'unpaid'
}

interface LoanDetail {
  id: number
  member?: { name: string }
  jenis?: { name: string }
  principal: number
  totalInterest: number
  totalPayment: number
  installmentAmount: number
  status: string
  angsuran: AngsuranItem[]
}

interface LoanDetailModalProps {
  open: boolean
  onClose: () => void
  detail: LoanDetail | null
  error: string
  onApprove: () => void
  isMobile: boolean
}

export function LoanDetailModal({ open, onClose, detail, error, onApprove, isMobile }: LoanDetailModalProps) {
  if (!detail) return null

  return (
    <Modal open={open} onClose={onClose} title="Detail Pinjaman" size="lg">
      {error && <ErrorAlert message={error} className="mb-3" />}
      <div className="space-y-3">
        <div className="card p-3 bg-[var(--color-bg-soft)]">
          <div className="flex items-center gap-3">
            <Avatar name={detail.member?.name || '?'} size="md" />
            <div>
              <p className="text-sm font-bold">{detail.member?.name}</p>
              <p className="text-xs text-[var(--color-text-soft)]">{detail.jenis?.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <div><p className="text-xs text-[var(--color-text-soft)]">Pokok</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(detail.principal)}</p></div>
            <div><p className="text-xs text-[var(--color-text-soft)]">Bunga</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(detail.totalInterest)}</p></div>
            <div><p className="text-xs text-[var(--color-text-soft)]">Total</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(detail.totalPayment)}</p></div>
            <div><p className="text-xs text-[var(--color-text-soft)]">Angsuran</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(detail.installmentAmount)}</p></div>
          </div>
        </div>

        <h3 className="text-sm font-bold">Jadwal Angsuran</h3>
        <div className="max-h-72 overflow-y-auto rounded-lg">
          {isMobile ? (
            <div className="space-y-2">
              {detail.angsuran.map((a) => (
                <div key={a.id} className="card p-3 text-sm">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold">Angsuran ke-{a.installmentNumber}</span>
                    <StatusBadge
                      variant={a.status === 'paid' ? 'paid' : a.status === 'partial' ? 'partial' : 'unpaid'}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[var(--color-text-soft)]">
                    <span>{format(new Date(a.dueDate), 'dd MMM yyyy', { locale: id })}</span>
                    <span className="font-bold text-[var(--color-text)] tabular-nums">{formatCurrency(a.totalAmount)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <DataTable>
              <table>
                <thead className="sticky top-0 bg-[var(--color-bg-soft)]">
                  <tr>
                    <th className="text-left">Ke</th>
                    <th className="text-left">Jatuh Tempo</th>
                    <th className="text-right">Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.angsuran.map((a) => (
                    <tr key={a.id}>
                      <td>{a.installmentNumber}</td>
                      <td>{format(new Date(a.dueDate), 'dd/MM/yyyy', { locale: id })}</td>
                      <td className="text-right font-semibold tabular-nums">{formatCurrency(a.totalAmount)}</td>
                      <td>
                        <StatusBadge
                          variant={a.status === 'paid' ? 'paid' : a.status === 'partial' ? 'partial' : 'unpaid'}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </DataTable>
          )}
        </div>

        {detail.status === 'approved' && (
          <button
            onClick={onApprove}
            className="btn btn-primary w-full"
          >
            <CheckCircle className="w-4 h-4" /> Cairkan Pinjaman
          </button>
        )}
      </div>
    </Modal>
  )
}
