import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '../stores/auth'
import { useIsMobile } from '../hooks/useIsMobile'
import { useToast } from '../components/ui/ToastProvider'
import { listMembers } from '../lib/membersFns'
import { listJenisSimpanan, listSimpanan, createSimpanan } from '../lib/simpananFns'
import { Modal } from '../components/ui/Modal'
import { MetricCard } from '../components/ui/MetricCard'
import { Toolbar } from '../components/ui/Toolbar'
import { SearchInput } from '../components/ui/SearchInput'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import { FieldError } from '../components/ui/FieldError'
import { StatusBadge } from '../components/ui/StatusBadge'
import { DataTable } from '../components/ui/DataTable'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { TablePagination } from '../components/ui/TablePagination'
import { Avatar } from '../components/ui/Avatar'
import { EntityCard } from '../components/ui/EntityCard'
import { Plus, Wallet, PiggyBank, ArrowDownCircle } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export const Route = createFileRoute('/simpanan')({
  component: SimpananPage,
})

type SimpananItem = Awaited<ReturnType<typeof listSimpanan>>[number]
type Member = Awaited<ReturnType<typeof listMembers>>[number]
type Jenis = Awaited<ReturnType<typeof listJenisSimpanan>>[number]

function formatCurrency(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

const PAGE_SIZE = 10

function SimpananPage() {
  const token = useAuthStore((s) => s.token)!
  const isMobile = useIsMobile()
  const { success, error: showError } = useToast()
  const [transactions, setTransactions] = useState<SimpananItem[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [jenisList, setJenisList] = useState<Jenis[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [trxData, memberData, jenisData] = await Promise.all([
        listSimpanan({ data: { token, search: search || undefined } }),
        listMembers({ data: { token } }),
        listJenisSimpanan({ data: { token } }),
      ])
      setTransactions(trxData)
      setMembers(memberData)
      setJenisList(jenisData)
      setPage(1)
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [search])

  const totalDeposit = transactions.filter((t) => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawal = transactions.filter((t) => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0)
  const net = totalDeposit - totalWithdrawal

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return transactions.slice(start, start + PAGE_SIZE)
  }, [transactions, page])

  const totalPages = Math.ceil(transactions.length / PAGE_SIZE) || 1

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      memberId: Number(formData.get('memberId')),
      jenisSimpananId: Number(formData.get('jenisSimpananId')),
      type: formData.get('type') as 'deposit' | 'withdrawal',
      amount: Number(formData.get('amount')),
      date: String(formData.get('date')),
      notes: String(formData.get('notes') || ''),
    }

    const errors: Record<string, string> = {}
    if (!payload.memberId) errors.memberId = 'Pilih anggota'
    if (!payload.jenisSimpananId) errors.jenisSimpananId = 'Pilih jenis simpanan'
    if (!payload.amount || payload.amount <= 0) errors.amount = 'Jumlah harus lebih dari 0'
    if (!payload.date) errors.date = 'Tanggal wajib diisi'
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    
    setFieldErrors({})

    try {
      await createSimpanan({ data: { token, ...payload } })
      setModalOpen(false)
      setFieldErrors({})
      success(`Transaksi simpanan ${formatCurrency(payload.amount)} berhasil disimpan`)
      await fetchData()
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan')
      showError(err?.message || 'Gagal menyimpan')
    }
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd')

  return (
    <div className="space-y-4">
      <Toolbar>
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari nama anggota..." />
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </Toolbar>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Total Setoran" value={formatCurrency(totalDeposit)} tone="success" icon={PiggyBank} />
        <MetricCard label="Total Penarikan" value={formatCurrency(totalWithdrawal)} tone="danger" icon={ArrowDownCircle} />
        <MetricCard label="Sisa Simpanan" value={formatCurrency(net)} icon={Wallet} />
      </div>

      {error && !modalOpen && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : transactions.length === 0 ? (
        <EmptyState
          icon={Wallet}
          message={search ? `Tidak ditemukan hasil untuk "${search}"` : "Belum ada transaksi simpanan."}
          submessage={search ? "Coba kata kunci lain." : "Silakan tambah transaksi baru."}
          action={
            search ? (
              <button onClick={() => setSearch('')} className="btn btn-secondary">Hapus Pencarian</button>
            ) : undefined
          }
        />
      ) : isMobile ? (
        <div className="space-y-3">
          {transactions.map((t) => (
            <EntityCard
              key={t.id}
              title={t.member?.name || 'Tidak diketahui'}
              subtitle={[t.jenis?.name, format(new Date(t.date), 'dd MMM yyyy', { locale: id })].filter(Boolean).join(' • ')}
              badge={<StatusBadge variant={t.type === 'deposit' ? 'deposit' : 'withdrawal'} />}
              meta={[
                {
                  label: 'Jumlah',
                  value: `${t.type === 'deposit' ? '+' : '-'} ${formatCurrency(t.amount)}`,
                  className: t.type === 'deposit' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
                },
                ...(t.notes ? [{ value: t.notes }] : []),
              ]}
            />
          ))}
        </div>
      ) : (
        <DataTable>
          <table>
            <thead>
              <tr>
                <th className="text-left">Tanggal</th>
                <th className="text-left">Anggota</th>
                <th className="text-left">Jenis</th>
                <th className="text-left">Tipe</th>
                <th className="text-right">Jumlah</th>
                <th className="text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((t) => (
                <tr key={t.id}>
                  <td>{format(new Date(t.date), 'dd/MM/yyyy', { locale: id })}</td>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={t.member?.name || '?'} size="sm" />
                      <span className="font-medium">{t.member?.name}</span>
                    </div>
                  </td>
                  <td>{t.jenis?.name}</td>
                  <td>
                    <StatusBadge variant={t.type === 'deposit' ? 'deposit' : 'withdrawal'} />
                  </td>
                  <td
                    className={[
                      'text-right font-semibold tabular-nums',
                      t.type === 'deposit' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
                    ].join(' ')}
                  >
                    {t.type === 'deposit' ? '+' : '-'} {formatCurrency(t.amount)}
                  </td>
                  <td className="text-[var(--color-text-soft)]">{t.notes || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={transactions.length}
            pageSize={PAGE_SIZE}
          />
        </DataTable>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setError('')
          setFieldErrors({})
        }}
        title="Tambah Transaksi Simpanan"
        footer={
          <div className="flex flex-col-reverse sm:flex-row gap-2">
            <button
              type="button"
              onClick={() => {
                setModalOpen(false)
                setError('')
                setFieldErrors({})
              }}
              className="btn btn-secondary flex-1"
            >
              Batal
            </button>
            <button type="submit" form="simpananForm" className="btn btn-primary flex-1">
              Simpan
            </button>
          </div>
        }
      >
        {error && modalOpen && <ErrorAlert message={error} className="mb-3" />}
        <form id="simpananForm" onSubmit={handleSave} className="space-y-4" noValidate>
          <div>
            <label htmlFor="memberId">Anggota <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
            <select id="memberId" name="memberId" required>
              <option value="">Pilih anggota</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} - {m.name}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.memberId} />
          </div>
          <div>
            <label htmlFor="jenisSimpananId">Jenis Simpanan <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
            <select id="jenisSimpananId" name="jenisSimpananId" required>
              <option value="">Pilih jenis</option>
              {jenisList.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.name}
                </option>
              ))}
            </select>
            <FieldError message={fieldErrors.jenisSimpananId} />
          </div>
          <div>
            <label htmlFor="type">Tipe Transaksi <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
            <select id="type" name="type" required>
              <option value="deposit">Setoran (Deposit)</option>
              <option value="withdrawal">Penarikan (Withdrawal)</option>
            </select>
          </div>
          <div>
            <label htmlFor="amount">Jumlah (Rp) <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
            <input id="amount" name="amount" type="number" inputMode="numeric" step="1" placeholder="Contoh: 100000" required />
            <FieldError message={fieldErrors.amount} />
          </div>
          <div>
            <label htmlFor="date">Tanggal <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
            <input id="date" name="date" type="date" defaultValue={todayStr} required />
            <FieldError message={fieldErrors.date} />
          </div>
          <div>
            <label htmlFor="notes">Keterangan</label>
            <textarea id="notes" name="notes" placeholder="Keterangan tambahan" rows={2} />
          </div>
        </form>
      </Modal>
    </div>
  )
}
