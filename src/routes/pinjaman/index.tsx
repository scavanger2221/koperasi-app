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
import { listJenisPinjaman, listPinjaman, createPinjaman, getPinjaman, approvePinjaman } from '../../lib/pinjamanFns'
import { DataTable } from '../../components/ui/DataTable'
import { MetricCard } from '../../components/ui/MetricCard'
import { Toolbar } from '../../components/ui/Toolbar'
import { SearchInput } from '../../components/ui/SearchInput'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { TablePagination } from '../../components/ui/TablePagination'
import { EntityCard } from '../../components/ui/EntityCard'
import { PageActions } from '../../components/ui/PageActions'
import { IconButton } from '../../components/ui/IconButton'
import { CellNumber, CellCurrency, CellMember } from '../../components/ui/table-cells'
import { CreateLoanModal } from './-CreateLoanModal'
import { LoanDetailModal } from './-LoanDetailModal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { Plus, FileText, Eye, Wallet, Users, CircleDollarSign } from 'lucide-react'
import { formatCurrency } from '../../utils/format'
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants/messages'

export const Route = createFileRoute('/pinjaman/')({
  component: PinjamanPage,
})

type PinjamanItem = Awaited<ReturnType<typeof listPinjaman>>[number]
type Member = Awaited<ReturnType<typeof listMembers>>[number]
type Jenis = Awaited<ReturnType<typeof listJenisPinjaman>>[number]

type PinjamanData = {
  loans: PinjamanItem[]
  members: Member[]
  jenisList: Jenis[]
}

const fetchPinjamanData = async ({ token, search }: { token: string; search?: string }): Promise<PinjamanData> => {
  const [loanData, memberData, jenisData] = await Promise.all([
    listPinjaman({ data: { token, search } }),
    listMembers({ data: { token } }),
    listJenisPinjaman({ data: { token } }),
  ])
  return { loans: loanData, members: memberData, jenisList: jenisData } as const
}

function PinjamanPage() {
  const token = useAuthStore((s) => s.token)!
  const isMobile = useIsMobile()
  const { success, error: showError } = useToast()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<1 | 2>(1)
  const [step1Values, setStep1Values] = useState({ memberId: '', jenisPinjamanId: '' })
  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState<any>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [approvingId, setApprovingId] = useState<number | null>(null)

  const { data, loading, error, refetch: fetchData } = useDataFetch<PinjamanData>(fetchPinjamanData, search)

  const { fieldErrors, validate, clearErrors } = useFormValidation()

  const loans: PinjamanItem[] = data?.loans ?? []
  const members: Member[] = data?.members ?? []
  const jenisList: Jenis[] = data?.jenisList ?? []

  const { paginated, page, setPage, totalPages, pageSize } = usePagination(loans)
  const { visible, canLoadMore, loadMore } = useLoadMore(loans)

  useEffect(() => {
    setPage(1)
  }, [loans, setPage])

  const totalPengajuan = loans.reduce((sum, l) => sum + l.principal, 0)
  const totalDicairkan = loans.filter((l) => l.status === 'disbursed').reduce((sum, l) => sum + l.principal, 0)
  const uniqueBorrowers = new Set(loans.map((l) => l.memberId)).size

  const resetModal = () => {
    setModalOpen(false)
    setModalStep(1)
    setStep1Values({ memberId: '', jenisPinjamanId: '' })
    clearErrors()
  }

  const handleNextStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const memberId = Number(formData.get('memberId'))
    const jenisPinjamanId = Number(formData.get('jenisPinjamanId'))

    const errors: Record<string, string> = {}
    if (!memberId) errors.memberId = 'Pilih anggota'
    if (!jenisPinjamanId) errors.jenisPinjamanId = 'Pilih jenis pinjaman'

    if (!validate(errors)) return

    setStep1Values({ memberId: String(memberId), jenisPinjamanId: String(jenisPinjamanId) })
    setModalStep(2)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      memberId: Number(step1Values.memberId),
      jenisPinjamanId: Number(step1Values.jenisPinjamanId),
      principal: Number(formData.get('principal')),
      tenorMonths: Number(formData.get('tenorMonths')),
      applicationDate: String(formData.get('applicationDate')),
      notes: String(formData.get('notes') || ''),
    }

    const errors: Record<string, string> = {}
    if (!payload.principal || payload.principal <= 0) errors.principal = 'Pokok pinjaman harus lebih dari 0'
    if (!payload.tenorMonths || payload.tenorMonths <= 0) errors.tenorMonths = 'Tenor harus lebih dari 0'
    if (!payload.applicationDate) errors.applicationDate = 'Tanggal pengajuan wajib diisi'

    if (!validate(errors)) return

    try {
      await createPinjaman({ data: { token, ...payload } })
      resetModal()
      success(SUCCESS_MESSAGES.PINJAMAN_CREATED)
      await fetchData()
    } catch (err: any) {
      const message = err?.message || ERROR_MESSAGES.SAVE_FAILED
      showError(message)
    }
  }

  const openDetail = async (id: number) => {
    try {
      const p = await getPinjaman({ data: { token, id } })
      setDetail(p)
      setDetailOpen(true)
    } catch (err: any) {
      showError(err?.message || 'Gagal memuat detail')
    }
  }

  const handleApprove = async () => {
    if (!approvingId) return
    try {
      await approvePinjaman({ data: { token, id: approvingId } })
      setConfirmOpen(false)
      setApprovingId(null)
      success(SUCCESS_MESSAGES.PINJAMAN_DISBURSED)
      await fetchData()
      if (detail && detail.id === approvingId) {
        const p = await getPinjaman({ data: { token, id: detail.id } })
        setDetail(p)
      }
    } catch (err: any) {
      showError(err?.message || 'Gagal mencairkan')
    }
  }

  return (
    <div className="space-y-4">
      <Toolbar>
        <div className="flex-1">
          <SearchInput value={search} onChange={setSearch} placeholder="Cari nama anggota..." />
        </div>
        <button onClick={() => { setModalOpen(true); setModalStep(1) }} className="btn btn-primary shrink-0">
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </Toolbar>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <MetricCard label="Total Pengajuan" value={formatCurrency(totalPengajuan)} icon={FileText} />
        <MetricCard label="Total Dicairkan" value={formatCurrency(totalDicairkan)} tone="success" icon={Wallet} />
        <MetricCard label="Jumlah Peminjam" value={uniqueBorrowers} icon={Users} />
      </div>

      {error && !modalOpen && !detailOpen && !confirmOpen && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : loans.length === 0 ? (
        <EmptyState
          icon={FileText}
          message={search ? `Tidak ditemukan hasil untuk "${search}"` : "Belum ada pinjaman."}
          submessage={search ? "Coba kata kunci lain." : "Silakan tambah pinjaman baru."}
          action={
            search ? (
              <button onClick={() => setSearch('')} className="btn btn-secondary">Hapus Pencarian</button>
            ) : undefined
          }
        />
      ) : isMobile ? (
        <div className="space-y-3">
          {visible.map((l, idx) => (
            <EntityCard
              key={l.id}
              number={idx + 1}
              title={l.member?.name || 'Tidak diketahui'}
              subtitle={[l.jenis?.name, `${l.tenorMonths} bulan`].filter(Boolean).join(' • ')}
              badge={<StatusBadge variant={l.status as any} />}
              meta={[
                { label: 'Pokok', value: formatCurrency(l.principal) },
                { label: 'Angsuran/bulan', value: formatCurrency(l.installmentAmount) },
              ]}
              actions={[
                {
                  label: 'Detail',
                  variant: 'secondary',
                  onClick: () => openDetail(l.id),
                },
                ...(l.status === 'approved'
                  ? [
                      {
                        label: 'Cairkan Pinjaman',
                        variant: 'primary' as const,
                        onClick: () => { setApprovingId(l.id); setConfirmOpen(true) },
                      },
                    ]
                  : []),
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
                <th className="text-left">Anggota</th>
                <th className="text-left">Jenis</th>
                <th className="text-right">Pokok</th>
                <th className="text-right">Angsuran</th>
                <th className="text-center">Tenor</th>
                <th className="text-left">Status</th>
                <th className="text-right">Kelola Pinjaman</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((l, idx) => (
                <tr key={l.id}>
                  <CellNumber>{(page - 1) * pageSize + idx + 1}</CellNumber>
                  <CellMember name={l.member?.name || '?'} />
                  <td>{l.jenis?.name}</td>
                  <CellCurrency>{formatCurrency(l.principal)}</CellCurrency>
                  <CellCurrency>{formatCurrency(l.installmentAmount)}</CellCurrency>
                  <CellNumber>{l.tenorMonths} bln</CellNumber>
                  <td><StatusBadge variant={l.status as any} /></td>
                  <td className="text-right">
                    <PageActions>
                      <IconButton
                        icon={Eye}
                        label="Lihat"
                        showLabel={true}
                        onClick={() => openDetail(l.id)}
                      />
                      {l.status === 'approved' && (
                        <IconButton
                          icon={CircleDollarSign}
                          label="Cairkan"
                          showLabel={true}
                          variant="primary"
                          onClick={() => { setApprovingId(l.id); setConfirmOpen(true) }}
                        />
                      )}
                    </PageActions>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={loans.length}
            pageSize={pageSize}
          />
        </DataTable>
      )}

      <CreateLoanModal
        open={modalOpen}
        onClose={resetModal}
        members={members}
        jenisList={jenisList}
        step1Values={step1Values}
        step={modalStep}
        error={error}
        fieldErrors={fieldErrors}
        onStep1Change={handleNextStep}
        onStep2Change={handleSave}
        onBack={() => setModalStep(1)}
        onCloseWithReset={resetModal}
      />

      <LoanDetailModal
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setDetail(null); clearErrors() }}
        detail={detail}
        error={error}
        onApprove={() => { setApprovingId(detail!.id); setConfirmOpen(true) }}
        isMobile={isMobile}
      />

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => { setConfirmOpen(false); setApprovingId(null) }}
        onConfirm={handleApprove}
        title="Cairkan Pinjaman?"
        message="Pinjaman akan dicairkan dan angsuran aktif. Lanjutkan?"
        confirmText="Cairkan"
        variant="primary"
      />
    </div>
  )
}
