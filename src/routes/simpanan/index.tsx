import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/auth'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePagination } from '../../hooks/usePagination'
import { useLoadMore } from '../../hooks/useLoadMore'
import { useDataFetch } from '../../hooks/useDataFetch'
import { useFormValidation } from '../../hooks/useFormValidation'
import { useToast } from '../../components/ui/ToastProvider'
import { listMembers } from '../../lib/membersFns'
import { listJenisSimpanan, listSimpanan, createSimpanan } from '../../lib/simpananFns'
import { MetricCard } from '../../components/ui/MetricCard'
import { Toolbar } from '../../components/ui/Toolbar'
import { SearchInput } from '../../components/ui/SearchInput'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { DataTable } from '../../components/ui/DataTable'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { TablePagination } from '../../components/ui/TablePagination'
import { EntityCard } from '../../components/ui/EntityCard'
import { Modal } from '../../components/ui/Modal'
import { ModalFooter } from '../../components/ui/ModalFooter'
import { TransactionForm } from './-TransactionForm'
import { CellNumber, CellCurrency, CellMember } from '../../components/ui/table-cells'
import { cn } from '../../lib/utils'
import { Plus, Wallet, PiggyBank, ArrowDownCircle } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { formatCurrency } from '../../utils/format'
import { ERROR_MESSAGES } from '../../constants/messages'

export const Route = createFileRoute('/simpanan/')({
  component: SimpananPage,
})

type SimpananItem = Awaited<ReturnType<typeof listSimpanan>>[number]
type Member = Awaited<ReturnType<typeof listMembers>>[number]
type Jenis = Awaited<ReturnType<typeof listJenisSimpanan>>[number]

type SimpananData = {
  transactions: SimpananItem[]
  members: Member[]
  jenisList: Jenis[]
}

const fetchSimpananData = async ({ token, search }: { token: string; search?: string }): Promise<SimpananData> => {
  const [trxData, memberData, jenisData] = await Promise.all([
    listSimpanan({ data: { token, search } }),
    listMembers({ data: { token } }),
    listJenisSimpanan({ data: { token } }),
  ])
  return { transactions: trxData, members: memberData, jenisList: jenisData }
}

function SimpananPage() {
  const token = useAuthStore((s) => s.token)!
  const isMobile = useIsMobile()
  const { success, error: showError } = useToast()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)

  const { data, loading, error, refetch: fetchData } = useDataFetch<SimpananData>(fetchSimpananData, search)

  const { fieldErrors, validate, clearErrors } = useFormValidation()

  const transactions: SimpananItem[] = data?.transactions ?? []
  const members: Member[] = data?.members ?? []
  const jenisList: Jenis[] = data?.jenisList ?? []

  const { paginated, page, setPage, totalPages, pageSize } = usePagination(transactions)
  const { visible, canLoadMore, loadMore } = useLoadMore(transactions)

  useEffect(() => {
    setPage(1)
  }, [transactions, setPage])

  const totalDeposit = transactions.filter((t) => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0)
  const totalWithdrawal = transactions.filter((t) => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0)
  const net = totalDeposit - totalWithdrawal

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
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

    if (!validate(errors)) return

     try {
       await createSimpanan({ data: { token, ...payload } })
       setModalOpen(false)
       clearErrors()
       success(`Transaksi simpanan ${formatCurrency(payload.amount)} berhasil disimpan`)
       await fetchData()
     } catch (err: any) {
       const message = err?.message || ERROR_MESSAGES.SAVE_FAILED
       showError(message)
     }
  }

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
          {visible.map((t, idx) => (
            <EntityCard
              key={t.id}
              number={idx + 1}
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
                <th className="text-left">Tanggal</th>
                <th className="text-left">Anggota</th>
                <th className="text-left">Jenis</th>
                <th className="text-left">Tipe</th>
                <th className="text-right">Jumlah</th>
                <th className="text-left">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((t, idx) => (
                <tr key={t.id}>
                  <CellNumber>{(page - 1) * pageSize + idx + 1}</CellNumber>
                  <td>{format(new Date(t.date), 'dd/MM/yyyy', { locale: id })}</td>
                  <CellMember name={t.member?.name || '?'} />
                  <td>{t.jenis?.name}</td>
                  <td>
                    <StatusBadge variant={t.type === 'deposit' ? 'deposit' : 'withdrawal'} />
                  </td>
                  <CellCurrency className={cn(t.type === 'deposit' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]')}>
                    {t.type === 'deposit' ? '+' : '-'} {formatCurrency(t.amount)}
                  </CellCurrency>
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
            pageSize={pageSize}
          />
        </DataTable>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          clearErrors()
        }}
        title="Tambah Transaksi Simpanan"
        footer={
          <ModalFooter
            secondaryLabel="Batal"
            onSecondary={() => {
              setModalOpen(false)
              clearErrors()
            }}
            primaryLabel="Simpan"
            onPrimary={() => {}}
            primaryType="submit"
            form="simpananForm"
          />
        }
      >
        {error && modalOpen && <ErrorAlert message={error} className="mb-3" />}
         <TransactionForm members={members} jenisList={jenisList} errors={fieldErrors} onSubmit={handleSave} />
      </Modal>
    </div>
  )
}
