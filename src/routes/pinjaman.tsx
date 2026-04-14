import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/auth'
import { useIsMobile } from '../hooks/useIsMobile'
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
import { IconButton } from '../components/ui/IconButton'
import { MobileRow } from '../components/ui/MobileRow'
import { Plus, FileText, Eye, Wallet, Users, CheckCircle } from 'lucide-react'
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

function PinjamanPage() {
  const token = useAuthStore((s) => s.token)!
  const isMobile = useIsMobile()
  const [loans, setLoans] = useState<PinjamanItem[]>([])
  const [members, setMembers] = useState<Member[]>([])
  const [jenisList, setJenisList] = useState<Jenis[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
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
        listPinjaman({ data: { token } }),
        listMembers({ data: { token } }),
        listJenisPinjaman({ data: { token } }),
      ])
      setLoans(loanData)
      setMembers(memberData)
      setJenisList(jenisData)
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [search])

  const filtered = loans.filter((l) =>
    l.member?.name.toLowerCase().includes(search.toLowerCase())
  )

  const totalPengajuan = filtered.reduce((sum, l) => sum + l.principal, 0)
  const totalDicairkan = filtered.filter((l) => l.status === 'disbursed').reduce((sum, l) => sum + l.principal, 0)
  const uniqueBorrowers = new Set(filtered.map((l) => l.memberId)).size

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const form = e.currentTarget
    const formData = new FormData(form)
    const payload = {
      memberId: Number(formData.get('memberId')),
      jenisPinjamanId: Number(formData.get('jenisPinjamanId')),
      principal: Number(formData.get('principal')),
      tenorMonths: Number(formData.get('tenorMonths')),
      applicationDate: String(formData.get('applicationDate')),
      notes: String(formData.get('notes') || ''),
    }

    const errors: Record<string, string> = {}
    if (!payload.memberId) errors.memberId = 'Pilih anggota'
    if (!payload.jenisPinjamanId) errors.jenisPinjamanId = 'Pilih jenis pinjaman'
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
      setModalOpen(false)
      setFieldErrors({})
      await fetchData()
    } catch (err: any) {
      setError(err?.message || 'Gagal menyimpan')
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
      await fetchData()
      if (detail && detail.id === approvingId) {
        const p = await getPinjaman({ data: { token, id: detail.id } })
        setDetail(p)
      }
    } catch (err: any) {
      setError(err?.message || 'Gagal menyetujui')
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
        <MetricCard label="Total Pengajuan" value={formatCurrency(totalPengajuan)} icon={FileText} />
        <MetricCard label="Total Dicairkan" value={formatCurrency(totalDicairkan)} tone="success" icon={Wallet} />
        <MetricCard label="Jumlah Peminjam" value={uniqueBorrowers} icon={Users} />
      </div>

      {error && !modalOpen && !detailOpen && !confirmOpen && <ErrorAlert message={error} />}

      {loading ? (
        <p className="text-[13px] text-[var(--color-text-soft)]">Memuat...</p>
      ) : filtered.length === 0 ? (
        <EmptyState icon={FileText} message="Belum ada pinjaman." />
      ) : isMobile ? (
        <div className="space-y-2">
          {filtered.map((l) => (
            <MobileRow
              key={l.id}
              header={l.member?.name}
              meta={l.jenis?.name}
              badge={<StatusBadge variant={l.status as any} />}
              actions={
                <>
                  <IconButton
                    icon={Eye}
                    label="Detail"
                    onClick={() => openDetail(l.id)}
                  />
                  {l.status === 'approved' && (
                    <IconButton
                      icon={CheckCircle}
                      label="Cairkan"
                      variant="primary"
                      onClick={() => { setApprovingId(l.id); setConfirmOpen(true) }}
                    />
                  )}
                </>
              }
            >
              <div className="space-y-1 text-[12px]">
                <div className="flex justify-between"><span className="text-[var(--color-text-soft)]">Pokok</span><span className="font-semibold tabular-nums">{formatCurrency(l.principal)}</span></div>
                <div className="flex justify-between"><span className="text-[var(--color-text-soft)]">Angsuran</span><span className="font-semibold tabular-nums">{formatCurrency(l.installmentAmount)}</span></div>
                <div className="flex justify-between"><span className="text-[var(--color-text-soft)]">Tenor</span><span>{l.tenorMonths} bulan</span></div>
              </div>
            </MobileRow>
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
                <th className="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l) => (
                <tr key={l.id}>
                  <td className="font-medium">{l.member?.name}</td>
                  <td>{l.jenis?.name}</td>
                  <td className="text-right font-semibold tabular-nums">{formatCurrency(l.principal)}</td>
                  <td className="text-right font-semibold tabular-nums">{formatCurrency(l.installmentAmount)}</td>
                  <td className="text-center text-[var(--color-text-soft)]">{l.tenorMonths} bln</td>
                  <td><StatusBadge variant={l.status as any} /></td>
                  <td className="text-right">
                    <span className="inline-flex items-center gap-1">
                      <IconButton
                        icon={Eye}
                        label="Detail"
                        onClick={() => openDetail(l.id)}
                      />
                      {l.status === 'approved' && (
                        <IconButton
                          icon={CheckCircle}
                          label="Cairkan"
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
        </DataTable>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setError(''); setFieldErrors({}) }} title="Tambah Pinjaman">
        {error && modalOpen && <ErrorAlert message={error} className="mb-3" />}
        <form onSubmit={handleSave} className="space-y-4" noValidate>
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
          <div>
            <label htmlFor="principal">Pokok Pinjaman (Rp) <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
            <input id="principal" name="principal" type="number" placeholder="Contoh: 5000000" required />
            <FieldError message={fieldErrors.principal} />
          </div>
          <div>
            <label htmlFor="tenorMonths">Tenor (bulan) <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
            <input id="tenorMonths" name="tenorMonths" type="number" placeholder="Contoh: 12" required />
            <FieldError message={fieldErrors.tenorMonths} />
          </div>
          <div>
            <label htmlFor="applicationDate">Tanggal Pengajuan <span className="text-[var(--color-danger)] ml-0.5">*</span></label>
            <input id="applicationDate" name="applicationDate" type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} required />
            <FieldError message={fieldErrors.applicationDate} />
          </div>
          <div>
            <label htmlFor="notes">Keterangan</label>
            <textarea id="notes" name="notes" placeholder="Keterangan tambahan" rows={2} />
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-2">
            <button type="button" onClick={() => { setModalOpen(false); setError(''); setFieldErrors({}) }} className="btn btn-secondary flex-1">Batal</button>
            <button type="submit" className="btn btn-primary flex-1">Simpan</button>
          </div>
        </form>
      </Modal>

      <Modal open={detailOpen} onClose={() => { setDetailOpen(false); setDetail(null); setError('') }} title="Detail Pinjaman" size="lg">
        {error && detailOpen && <ErrorAlert message={error} className="mb-3" />}
        {detail && (
          <div className="space-y-3">
            <div className="card p-3 bg-[var(--color-bg-soft)]">
              <p className="text-sm font-medium">{detail.member?.name}</p>
              <p className="text-[12px] text-[var(--color-text-soft)]">{detail.jenis?.name}</p>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div><p className="text-[11px] text-[var(--color-text-soft)]">Pokok</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(detail.principal)}</p></div>
                <div><p className="text-[11px] text-[var(--color-text-soft)]">Bunga</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(detail.totalInterest)}</p></div>
                <div><p className="text-[11px] text-[var(--color-text-soft)]">Total</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(detail.totalPayment)}</p></div>
                <div><p className="text-[11px] text-[var(--color-text-soft)]">Angsuran</p><p className="text-sm font-semibold tabular-nums">{formatCurrency(detail.installmentAmount)}</p></div>
              </div>
            </div>

            <h3 className="text-sm font-semibold">Jadwal Angsuran</h3>
            <div className="max-h-72 overflow-y-auto rounded-lg">
              {isMobile ? (
                <div className="space-y-2">
                  {detail.angsuran.map((a) => (
                    <div key={a.id} className="card p-3 border border-[var(--color-border)] text-[13px]">
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
