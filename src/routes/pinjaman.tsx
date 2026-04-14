import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '../stores/auth'
import { useIsMobile } from '../hooks/useIsMobile'
import { useToast } from '../components/ui/ToastProvider'
import { listMembers } from '../lib/membersFns'
import { listJenisPinjaman, listPinjaman, createPinjaman, getPinjaman, approvePinjaman } from '../lib/pinjamanFns'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
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
import { IconButton } from '../components/ui/IconButton'
import { Plus, FileText, Eye, Wallet, Users, CircleDollarSign, ChevronLeft, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export const Route = createFileRoute('/pinjaman')({
  component: PinjamanPage,
})

type PinjamanItem = Awaited<ReturnType<typeof listPinjaman>>[number]
type Member = Awaited<ReturnType<typeof listMembers>>[number]
type Jenis = Awaited<ReturnType<typeof listJenisPinjaman>>[number]
type PinjamanDetail = Awaited<ReturnType<typeof getPinjaman>>

function formatCurrency(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

const PAGE_SIZE = 10

function PinjamanPage() {
  const token = useAuthStore((s) => s.token)!
  const isMobile = useIsMobile()
  const { success, error: showError } = useToast()
  const [loans, setLoans] = useState<PinjamanItem[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [jenisList, setJenisList] = useState<Jenis[]>([])
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalStep, setModalStep] = useState<1 | 2>(1)
  const [step1Values, setStep1Values] = useState({ memberId: '', jenisPinjamanId: '' })
  const [detailOpen, setDetailOpen] = useState(false)
  const [detail, setDetail] = useState<PinjamanDetail | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [approvingId, setApprovingId] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [loanData, memberData, jenisData] = await Promise.all([
        listPinjaman({ data: { token, search: search || undefined } }),
        listMembers({ data: { token } }),
        listJenisPinjaman({ data: { token } }),
      ])
      setLoans(loanData)
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

  const totalPengajuan = loans.reduce((sum, l) => sum + l.principal, 0)
  const totalDicairkan = loans.filter((l) => l.status === 'disbursed').reduce((sum, l) => sum + l.principal, 0)
  const uniqueBorrowers = new Set(loans.map((l) => l.memberId)).size

  const paginated = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return loans.slice(start, start + PAGE_SIZE)
  }, [loans, page])

  const totalPages = Math.ceil(loans.length / PAGE_SIZE) || 1

  const resetModal = () => {
    setModalOpen(false)
    setModalStep(1)
    setStep1Values({ memberId: '', jenisPinjamanId: '' })
    setError('')
    setFieldErrors({})
  }

  const handleNextStep = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const form = e.currentTarget
    const formData = new FormData(form)
    const memberId = Number(formData.get('memberId'))
    const jenisPinjamanId = Number(formData.get('jenisPinjamanId'))

    const errors: Record<string, string> = {}
    if (!memberId) errors.memberId = 'Pilih anggota'
    if (!jenisPinjamanId) errors.jenisPinjamanId = 'Pilih jenis pinjaman'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})
    setStep1Values({ memberId: String(memberId), jenisPinjamanId: String(jenisPinjamanId) })
    setModalStep(2)
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
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
    
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    
    setFieldErrors({})

    try {
      await createPinjaman({ data: { token, ...payload } })
      resetModal()
      success('Pinjaman berhasil diajukan')
      await fetchData()
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan')
      showError(err?.message || 'Gagal menyimpan')
    }
  }

  const openDetail = async (id: number) => {
    setError('')
    try {
      const p = await getPinjaman({ data: { token, id } })
      setDetail(p)
      setDetailOpen(true)
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat detail')
    }
  }

  const handleApprove = async () => {
    if (!approvingId) return
    setError('')
    try {
      await approvePinjaman({ data: { token, id: approvingId } })
      setConfirmOpen(false)
      setApprovingId(null)
      success('Pinjaman berhasil dicairkan')
      await fetchData()
      if (detail && detail.id === approvingId) {
        const p = await getPinjaman({ data: { token, id: detail.id } })
        setDetail(p)
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal mencairkan')
      showError(err?.message || 'Gagal mencairkan')
    }
  }

  const todayStr = format(new Date(), 'yyyy-MM-dd')

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
          {loans.map((l) => (
            <EntityCard
              key={l.id}
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
        </div>
      ) : (
        <DataTable>
          <table>
            <thead>
              <tr>
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
              {paginated.map((l) => (
                <tr key={l.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <Avatar name={l.member?.name || '?'} size="sm" />
                      <span className="font-medium">{l.member?.name}</span>
                    </div>
                  </td>
                  <td>{l.jenis?.name}</td>
                  <td className="text-right font-semibold tabular-nums">{formatCurrency(l.principal)}</td>
                  <td className="text-right font-semibold tabular-nums">{formatCurrency(l.installmentAmount)}</td>
                  <td className="text-center text-[var(--color-text-soft)]">{l.tenorMonths} bln</td>
                  <td><StatusBadge variant={l.status as any} /></td>
                  <td className="text-right">
                    <span className="inline-flex items-center gap-2">
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
                    </span>
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
            pageSize={PAGE_SIZE}
          />
        </DataTable>
      )}

      {/* Create Modal - 2 Step */}
      <Modal
        open={modalOpen}
        onClose={resetModal}
        title={modalStep === 1 ? 'Tambah Pinjaman' : 'Detail Pinjaman'}
        footer={
          modalStep === 1 ? (
            <div className="flex gap-2">
              <button type="button" onClick={resetModal} className="btn btn-secondary flex-1">Batal</button>
              <button type="submit" form="pinjamanStep1" className="btn btn-primary flex-1">Lanjut</button>
            </div>
          ) : (
            <div className="flex flex-col-reverse sm:flex-row gap-2">
              <button type="button" onClick={() => setModalStep(1)} className="btn btn-secondary flex-1 flex items-center justify-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>
              <button type="submit" form="pinjamanStep2" className="btn btn-primary flex-1">Simpan Pengajuan</button>
            </div>
          )
        }
      >
        {error && modalOpen && <ErrorAlert message={error} className="mb-3" />}
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className={['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', modalStep >= 1 ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-soft)] text-[var(--color-text-soft)]'].join(' ')}>1</span>
          <div className={['h-1 w-8 rounded-full', modalStep >= 2 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-soft)]'].join(' ')} />
          <span className={['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', modalStep >= 2 ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-soft)] text-[var(--color-text-soft)]'].join(' ')}>2</span>
        </div>

        {modalStep === 1 ? (
          <form id="pinjamanStep1" onSubmit={handleNextStep} className="space-y-4" noValidate>
            <div>
              <label htmlFor="memberId">Anggota <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
              <select id="memberId" name="memberId" required>
                <option value="">Pilih anggota</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
                ))}
              </select>
              <FieldError message={fieldErrors.memberId} />
            </div>
            <div>
              <label htmlFor="jenisPinjamanId">Jenis Pinjaman <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
              <select id="jenisPinjamanId" name="jenisPinjamanId" required>
                <option value="">Pilih jenis</option>
                {jenisList.map((j) => (
                  <option key={j.id} value={j.id}>{j.name} ({j.interestRate}%/thn)</option>
                ))}
              </select>
              <FieldError message={fieldErrors.jenisPinjamanId} />
            </div>
          </form>
        ) : (
          <form id="pinjamanStep2" onSubmit={handleSave} className="space-y-4" noValidate>
            <div>
              <label htmlFor="principal">Pokok Pinjaman (Rp) <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
              <input id="principal" name="principal" type="number" inputMode="numeric" step="1" placeholder="Contoh: 5000000" required />
              <p className="text-[12px] text-[var(--color-text-soft)] mt-1">Jumlah pokok yang akan dipinjamkan</p>
              <FieldError message={fieldErrors.principal} />
            </div>
            <div>
              <label htmlFor="tenorMonths">Tenor (bulan) <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
              <input id="tenorMonths" name="tenorMonths" type="number" inputMode="numeric" step="1" placeholder="Contoh: 12" required />
              <p className="text-[12px] text-[var(--color-text-soft)] mt-1">Jumlah bulan untuk melunasi pinjaman</p>
              <FieldError message={fieldErrors.tenorMonths} />
            </div>
            <div>
              <label htmlFor="applicationDate">Tanggal Pengajuan <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
              <input id="applicationDate" name="applicationDate" type="date" defaultValue={todayStr} required />
              <FieldError message={fieldErrors.applicationDate} />
            </div>
            <div>
              <label htmlFor="notes">Keterangan</label>
              <textarea id="notes" name="notes" placeholder="Keterangan tambahan" rows={2} />
            </div>
          </form>
        )}
      </Modal>

      <Modal open={detailOpen} onClose={() => { setDetailOpen(false); setDetail(null); setError('') }} title="Detail Pinjaman" size="lg">
        {error && detailOpen && <ErrorAlert message={error} className="mb-3" />}
        {detail && (
          <div className="space-y-3">
            <div className="card p-3 bg-[var(--color-bg-soft)]">
              <div className="flex items-center gap-3">
                <Avatar name={detail.member?.name || '?'} size="md" />
                <div>
                  <p className="text-sm font-bold">{detail.member?.name}</p>
                  <p className="text-[12px] text-[var(--color-text-soft)]">{detail.jenis?.name}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div><p className="text-[11px] text-[var(--color-text-soft)]">Pokok</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(detail.principal)}</p></div>
                <div><p className="text-[11px] text-[var(--color-text-soft)]">Bunga</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(detail.totalInterest)}</p></div>
                <div><p className="text-[11px] text-[var(--color-text-soft)]">Total</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(detail.totalPayment)}</p></div>
                <div><p className="text-[11px] text-[var(--color-text-soft)]">Angsuran</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(detail.installmentAmount)}</p></div>
              </div>
            </div>

            <h3 className="text-sm font-bold">Jadwal Angsuran</h3>
            <div className="max-h-72 overflow-y-auto rounded-lg">
              {isMobile ? (
                <div className="space-y-2">
                  {detail.angsuran.map((a) => (
                    <div key={a.id} className="card p-3 text-[13px]">
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
                <div className="border border-[var(--color-border)] rounded-lg">
                  <table className="text-[13px]">
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
                </div>
              )}
            </div>

            {detail.status === 'approved' && (
              <button
                onClick={() => { setApprovingId(detail.id); setConfirmOpen(true) }}
                className="btn btn-primary w-full"
              >
                <CheckCircle className="w-4 h-4" /> Cairkan Pinjaman
              </button>
            )}
          </div>
        )}
      </Modal>

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
