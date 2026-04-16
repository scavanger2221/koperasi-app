import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/auth'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePagination } from '../../hooks/usePagination'
import { useLoadMore } from '../../hooks/useLoadMore'
import { useDataFetch } from '../../hooks/useDataFetch'
import { useFormValidation } from '../../hooks/useFormValidation'
import { useToast } from '../../components/ui/ToastProvider'
import { listAngsuran, getAngsuran, payAngsuran } from '../../lib/angsuranFns'
import { MetricCard } from '../../components/ui/MetricCard'
import { Toolbar } from '../../components/ui/Toolbar'
import { SearchInput } from '../../components/ui/SearchInput'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { FieldError } from '../../components/ui/FieldError'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { DataTable } from '../../components/ui/DataTable'
import { IconButton } from '../../components/ui/IconButton'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { TablePagination } from '../../components/ui/TablePagination'
import { EntityCard } from '../../components/ui/EntityCard'
import { Modal } from '../../components/ui/Modal'
import { ModalFooter } from '../../components/ui/ModalFooter'
import { Avatar } from '../../components/ui/Avatar'
import { CellNumber, CellCurrency, CellMember } from '../../components/ui/table-cells'
import { Receipt, Wallet, AlertTriangle, CircleDollarSign, ChevronDown } from 'lucide-react'
import { format, startOfDay } from 'date-fns'
import { id } from 'date-fns/locale'
import { formatCurrency } from '../../utils/format'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants/messages'
import type { AngsuranStatus } from '../../constants/status'

export const Route = createFileRoute('/angsuran/')({
  component: AngsuranPage,
})

type AngsuranItem = Awaited<ReturnType<typeof listAngsuran>>[number]
type AngsuranDetail = Awaited<ReturnType<typeof getAngsuran>>

const STATUS_OPTIONS: { value: '' | AngsuranStatus; label: string }[] = [
  { value: '', label: 'Semua Status' },
  { value: 'unpaid', label: 'Belum Lunas' },
  { value: 'partial', label: 'Sebagian' },
  { value: 'paid', label: 'Lunas' },
]

function AngsuranPage() {
  const token = useAuthStore((s) => s.token)!
  const isMobile = useIsMobile()
  const { success, error: showError } = useToast()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'' | AngsuranStatus>('')
  const [payOpen, setPayOpen] = useState(false)
  const [detail, setDetail] = useState<AngsuranDetail | null>(null)

  const { data, loading, error, refetch: fetchData } = useDataFetch<AngsuranItem[]>(
    ({ token, search, status }) => listAngsuran({
      data: {
        token,
        memberName: search || undefined,
        status: status || undefined,
      },
    }),
    search,
    [],
    { extraParams: { status: status || undefined } }
  )

  const { fieldErrors, validate, clearErrors } = useFormValidation()

  const items = data ?? []

  const { paginated, page, setPage, totalPages, pageSize } = usePagination(items)
  const { visible, canLoadMore, loadMore } = useLoadMore(items)

  useEffect(() => {
    setPage(1)
  }, [items, setPage])

  const today = startOfDay(new Date()).getTime()
  const totalBayarHariIni = items
    .filter((a) => a.paidDate && new Date(a.paidDate).getTime() >= today)
    .reduce((sum, a) => sum + a.paidAmount, 0)
  const belumLunas = items.filter((a) => a.status !== 'paid').length
  const tunggakan = items.filter((a) => a.status === 'unpaid' && new Date(a.dueDate).getTime() < today).length

  const openPay = async (id: number) => {
    try {
      const a = await getAngsuran({ data: { token, id } })
      setDetail(a)
      setPayOpen(true)
    } catch (err: any) {
      showError(err?.message || ERROR_MESSAGES.FETCH_FAILED)
    }
  }

  const handlePay = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!detail) return
    const form = e.currentTarget
    const formData = new FormData(form)
    const paidAmount = Number(formData.get('paidAmount'))
    const paidDate = String(formData.get('paidDate'))

    const errors: Record<string, string> = {}
    if (!paidAmount || paidAmount <= 0) errors.paidAmount = 'Jumlah bayar harus lebih dari 0'
    if (!paidDate) errors.paidDate = 'Tanggal bayar wajib diisi'

    if (!validate(errors)) return

    try {
      await payAngsuran({
        data: { token, id: detail.id, paidAmount, paidDate },
      })
      const sisa = Math.max(0, detail.totalAmount + detail.penaltyAmount - detail.paidAmount - paidAmount)
      setPayOpen(false)
      setDetail(null)
      clearErrors()
      success(SUCCESS_MESSAGES.ANGSURAN_PAID(sisa))
      await fetchData()
    } catch (err: any) {
      const message = err?.message || ERROR_MESSAGES.SAVE_FAILED
      showError(message)
    }
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="space-y-4">
      <Toolbar>
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari nama anggota..."
            className="flex-1"
          />
          <div className="relative sm:w-52">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as AngsuranStatus | '')}
              className="w-full appearance-none pr-10 cursor-pointer"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-soft)] pointer-events-none" />
          </div>
        </div>
      </Toolbar>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Bayar Hari Ini" value={formatCurrency(totalBayarHariIni)} tone="success" icon={Wallet} />
        <MetricCard label="Belum Lunas" value={belumLunas} tone="warning" icon={Receipt} />
        <MetricCard label="Tunggakan" value={tunggakan} tone="danger" icon={AlertTriangle} />
      </div>

      {error && !payOpen && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Receipt}
          message={search || status ? "Tidak ada data angsuran" : "Belum ada data angsuran."}
          submessage={search || status ? "Coba ubah filter pencarian." : "Silakan cek kembali nanti."}
          action={
            search || status ? (
              <button
                onClick={() => {
                  setSearch('')
                  setStatus('')
                }}
                className="btn btn-secondary"
              >
                Reset Filter
              </button>
            ) : undefined
          }
        />
      ) : isMobile ? (
        <div className="space-y-3">
          {visible.map((a, idx) => (
            <EntityCard
              key={a.id}
              number={idx + 1}
              title={a.pinjaman?.member?.name || 'Tidak diketahui'}
              subtitle={`Angsuran ke-${a.installmentNumber}`}
              badge={<StatusBadge variant={a.status as any} />}
              meta={[
                { label: 'Jatuh tempo', value: format(new Date(a.dueDate), 'dd MMM yyyy', { locale: id }) },
                { label: 'Total', value: formatCurrency(a.totalAmount) },
                ...(a.penaltyAmount > 0 ? [{ label: 'Denda', value: formatCurrency(a.penaltyAmount), className: 'text-[var(--color-danger)]' }] : []),
                ...(a.paidAmount > 0 ? [{ label: 'Sudah bayar', value: formatCurrency(a.paidAmount), className: 'text-[var(--color-success)]' }] : []),
              ]}
              actions={
                a.status !== 'paid'
                  ? [
                      {
                        label: 'Bayar Angsuran',
                        variant: 'primary' as const,
                        onClick: () => openPay(a.id),
                      },
                    ]
                  : []
              }
            />
          ))}
          {canLoadMore && (
            <button onClick={loadMore} className="w-full btn btn-secondary">
              Muat Lebih
            </button>
          )}
        </div>
      ) : (
        <DataTable>
          <table>
            <thead>
              <tr>
                <th className="text-center w-12">No</th>
                <th className="text-left">Anggota</th>
                <th className="text-center">Ke</th>
                <th className="text-left">Jatuh Tempo</th>
                <th className="text-right">Total</th>
                <th className="text-right">Denda</th>
                <th className="text-right">Sudah Bayar</th>
                <th className="text-left">Status</th>
                <th className="text-right">Pembayaran</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((a, idx) => (
                <tr key={a.id}>
                  <CellNumber>{(page - 1) * pageSize + idx + 1}</CellNumber>
                  <CellMember name={a.pinjaman?.member?.name || '?'} />
                  <CellNumber>{a.installmentNumber}</CellNumber>
                  <td>{format(new Date(a.dueDate), 'dd/MM/yyyy', { locale: id })}</td>
                  <CellCurrency>{formatCurrency(a.totalAmount)}</CellCurrency>
                  <CellCurrency className={a.penaltyAmount > 0 ? 'text-[var(--color-danger)]' : undefined}>
                    {a.penaltyAmount > 0 ? formatCurrency(a.penaltyAmount) : '-'}
                  </CellCurrency>
                  <CellCurrency>{a.paidAmount > 0 ? formatCurrency(a.paidAmount) : '-'}</CellCurrency>
                  <td><StatusBadge variant={a.status as any} /></td>
                  <td className="text-right">
                    {a.status !== 'paid' ? (
                      <IconButton
                        icon={CircleDollarSign}
                        label="Bayar"
                        showLabel={true}
                        variant="primary"
                        onClick={() => openPay(a.id)}
                      />
                    ) : (
                      <span className="inline-flex items-center justify-center min-w-[48px] text-[var(--color-text-soft)] text-xs font-bold uppercase tracking-widest">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={items.length}
            pageSize={pageSize}
          />
        </DataTable>
      )}

      <Modal
        open={payOpen}
        onClose={() => { setPayOpen(false); setDetail(null); clearErrors() }}
        title="Bayar Angsuran"
        footer={
          <ModalFooter
            secondaryLabel="Batal"
            onSecondary={() => { setPayOpen(false); setDetail(null); clearErrors() }}
            primaryLabel="Simpan Pembayaran"
            onPrimary={() => {}}
            primaryType="submit"
            form="payForm"
          />
        }
      >
        {error && payOpen && <ErrorAlert message={error} className="mb-3" />}
        {detail && (
          <div className="space-y-3">
            <div className="card p-3 bg-[var(--color-bg-soft)]">
              <div className="flex items-center gap-3">
                <Avatar name={detail.pinjaman?.member?.name || '?'} size="md" />
                <div>
                  <p className="text-sm font-bold">{detail.pinjaman?.member?.name}</p>
                  <p className="text-xs text-[var(--color-text-soft)]">Angsuran ke-{detail.installmentNumber}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div><p className="text-xs text-[var(--color-text-soft)]">Total Angsuran</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(detail.totalAmount)}</p></div>
                <div><p className="text-xs text-[var(--color-text-soft)]">Denda</p><p className="text-sm font-semibold tabular-nums text-[var(--color-danger)]">{formatCurrency(detail.penaltyAmount)}</p></div>
                <div><p className="text-xs text-[var(--color-text-soft)]">Sudah Dibayar</p><p className="text-sm font-semibold tabular-nums text-[var(--color-success)]">{formatCurrency(detail.paidAmount)}</p></div>
                <div><p className="text-xs text-[var(--color-text-soft)]">Sisa</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(Math.max(0, detail.totalAmount + detail.penaltyAmount - detail.paidAmount))}</p></div>
              </div>
            </div>

            <form id="payForm" onSubmit={handlePay} className="space-y-4" noValidate>
              <div>
                <label htmlFor="paidAmount">Jumlah Bayar (Rp) <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
                <input
                  id="paidAmount"
                  name="paidAmount"
                  type="number"
                  inputMode="numeric"
                  step="1"
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
            </form>
          </div>
        )}
      </Modal>
    </div>
  )
}
