import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/auth'
import { useIsMobile } from '../hooks/useIsMobile'
import { listAngsuran, getAngsuran, payAngsuran } from '../lib/angsuranFns'
import { Modal } from '../components/ui/Modal'
import { MetricCard } from '../components/ui/MetricCard'
import { Toolbar } from '../components/ui/Toolbar'
import { SearchInput } from '../components/ui/SearchInput'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import { FieldError } from '../components/ui/FieldError'
import { StatusBadge } from '../components/ui/StatusBadge'
import { DataTable } from '../components/ui/DataTable'
import { PageActions } from '../components/ui/PageActions'
import { Receipt, Wallet, AlertTriangle } from 'lucide-react'
import { format, startOfDay } from 'date-fns'
import { id } from 'date-fns/locale'

export const Route = createFileRoute('/angsuran')({
  component: AngsuranPage,
})

type AngsuranItem = Awaited<ReturnType<typeof listAngsuran>>[number]
type AngsuranDetail = Awaited<ReturnType<typeof getAngsuran>>

function formatCurrency(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

function AngsuranPage() {
  const token = useAuthStore((s) => s.token)!
  const isMobile = useIsMobile()
  const [items, setItems] = useState<AngsuranItem[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [payOpen, setPayOpen] = useState(false)
  const [detail, setDetail] = useState<AngsuranDetail | null>(null)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listAngsuran({ data: { token, memberName: search || undefined } })
      setItems(data)
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [search])

  const today = startOfDay(new Date()).getTime()
  const totalBayarHariIni = items
    .filter((a) => a.paidDate && new Date(a.paidDate).getTime() >= today)
    .reduce((sum, a) => sum + a.paidAmount, 0)
  const belumLunas = items.filter((a) => a.status !== 'paid').length
  const tunggakan = items.filter((a) => a.status === 'unpaid' && new Date(a.dueDate).getTime() < today).length

  const openPay = async (id: number) => {
    setError('')
    try {
      const a = await getAngsuran({ data: { token, id } })
      setDetail(a)
      setPayOpen(true)
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data')
    }
  }

  const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!detail) return
    setError('')
    const form = e.currentTarget
    const formData = new FormData(form)
    const paidAmount = Number(formData.get('paidAmount'))
    const paidDate = String(formData.get('paidDate'))

    const errors: Record<string, string> = {}
    if (!paidAmount || paidAmount <= 0) errors.paidAmount = 'Jumlah bayar harus lebih dari 0'
    if (!paidDate) errors.paidDate = 'Tanggal bayar wajib diisi'
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    
    setFieldErrors({})

    try {
      await payAngsuran({
        data: { token, id: detail.id, paidAmount, paidDate },
      })
      setPayOpen(false)
      setDetail(null)
      setFieldErrors({})
      await fetchData()
    } catch (err: any) {
      setError(err?.message || 'Gagal membayar')
    }
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="space-y-4">
      <Toolbar>
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari nama anggota..." />
        </div>
      </Toolbar>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Bayar Hari Ini" value={formatCurrency(totalBayarHariIni)} tone="success" icon={Wallet} />
        <MetricCard label="Belum Lunas" value={belumLunas} tone="warning" icon={Receipt} />
        <MetricCard label="Tunggakan" value={tunggakan} tone="danger" icon={AlertTriangle} />
      </div>

      {error && !payOpen && <ErrorAlert message={error} />}

      {loading ? (
        <p className="text-[13px] text-[var(--color-text-soft)]">Memuat...</p>
      ) : items.length === 0 ? (
        <EmptyState icon={Receipt} message="Belum ada data angsuran." />
      ) : isMobile ? (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="card p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[16px] font-bold text-[var(--color-text)]">{a.pinjaman?.member?.name}</p>
                  <p className="text-[13px] text-[var(--color-text-soft)]">Angsuran ke-{a.installmentNumber}</p>
                </div>
                <div className="shrink-0">
                  <StatusBadge variant={a.status as any} />
                </div>
              </div>

              <div className="space-y-1 text-[13px]">
                <div className="flex justify-between"><span className="text-[var(--color-text-soft)]">Jatuh tempo</span><span className="font-medium">{format(new Date(a.dueDate), 'dd MMM yyyy', { locale: id })}</span></div>
                <div className="flex justify-between"><span className="text-[var(--color-text-soft)]">Total</span><span className="font-semibold tabular-nums">{formatCurrency(a.totalAmount)}</span></div>
                {a.penaltyAmount > 0 && (
                  <div className="flex justify-between"><span className="text-[var(--color-text-soft)]">Denda</span><span className="text-[var(--color-danger)] font-medium">{formatCurrency(a.penaltyAmount)}</span></div>
                )}
                {a.paidAmount > 0 && (
                  <div className="flex justify-between"><span className="text-[var(--color-text-soft)]">Sudah bayar</span><span className="text-[var(--color-success)] font-medium">{formatCurrency(a.paidAmount)}</span></div>
                )}
              </div>

              {a.status !== 'paid' && (
                <button onClick={() => openPay(a.id)} className="w-full btn btn-primary">
                  Bayar Angsuran
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <DataTable>
          <table>
            <thead>
              <tr>
                <th>Anggota</th>
                <th className="text-center">Ke</th>
                <th>Jatuh Tempo</th>
                <th className="text-right">Total</th>
                <th className="text-right">Denda</th>
                <th className="text-right">Sudah Bayar</th>
                <th>Status</th>
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((a) => (
                <tr key={a.id}>
                  <td className="font-medium">{a.pinjaman?.member?.name}</td>
                  <td className="text-center text-[var(--color-text-soft)]">{a.installmentNumber}</td>
                  <td>{format(new Date(a.dueDate), 'dd/MM/yyyy', { locale: id })}</td>
                  <td className="text-right font-semibold tabular-nums">{formatCurrency(a.totalAmount)}</td>
                  <td className="text-right text-[var(--color-danger)]">{a.penaltyAmount > 0 ? formatCurrency(a.penaltyAmount) : '-'}</td>
                  <td className="text-right tabular-nums">{a.paidAmount > 0 ? formatCurrency(a.paidAmount) : '-'}</td>
                  <td><StatusBadge variant={a.status as any} /></td>
                  <td>
                    <PageActions>
                      {a.status !== 'paid' ? (
                        <button onClick={() => openPay(a.id)} className="btn btn-primary btn-sm">
                          Bayar
                        </button>
                      ) : (
                        <span className="text-[12px] text-[var(--color-text-soft)]">-</span>
                      )}
                    </PageActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </DataTable>
      )}

      <Modal open={payOpen} onClose={() => { setPayOpen(false); setDetail(null); setError(''); setFieldErrors({}) }} title="Bayar Angsuran">
        {error && payOpen && <ErrorAlert message={error} className="mb-3" />}
        {detail && (
          <div className="space-y-3">
            <div className="card p-3 bg-[var(--color-bg-soft)]">
              <p className="text-sm font-medium">{detail.pinjaman?.member?.name}</p>
              <p className="text-[12px] text-[var(--color-text-soft)]">Angsuran ke-{detail.installmentNumber}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div><p className="text-[11px] text-[var(--color-text-soft)]">Total Angsuran</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(detail.totalAmount)}</p></div>
                <div><p className="text-[11px] text-[var(--color-text-soft)]">Denda</p><p className="text-sm font-semibold tabular-nums text-[var(--color-danger)]">{formatCurrency(detail.penaltyAmount)}</p></div>
                <div><p className="text-[11px] text-[var(--color-text-soft)]">Sudah Dibayar</p><p className="text-sm font-semibold tabular-nums text-[var(--color-success)]">{formatCurrency(detail.paidAmount)}</p></div>
                <div><p className="text-[11px] text-[var(--color-text-soft)]">Sisa</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(Math.max(0, detail.totalAmount + detail.penaltyAmount - detail.paidAmount))}</p></div>
              </div>
            </div>

            <form onSubmit={handlePay} className="space-y-4" noValidate>
              <div>
                <label htmlFor="paidAmount">Jumlah Bayar (Rp) <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
                <input
                  id="paidAmount"
                  name="paidAmount"
                  type="number"
                  defaultValue={Math.max(0, detail.totalAmount + detail.penaltyAmount - detail.paidAmount)}
                  required
                />
                <FieldError message={fieldErrors.paidAmount} />
              </div>
              <div>
                <label htmlFor="paidDate">Tanggal Bayar <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
                <input id="paidDate" name="paidDate" type="date" defaultValue={todayStr} required />
                <FieldError message={fieldErrors.paidDate} />
              </div>
              <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
                <button type="button" onClick={() => { setPayOpen(false); setDetail(null); setError(''); setFieldErrors({}) }} className="btn btn-secondary flex-1">Batal</button>
                <button type="submit" className="btn btn-primary flex-1">Simpan Pembayaran</button>
              </div>
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}
