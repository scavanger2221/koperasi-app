import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState, useEffect, useMemo } from 'react'
import { useAuthStore } from '../stores/auth'
import { useIsMobile } from '../hooks/useIsMobile'
import { reportSimpanan, reportPinjaman, reportAngsuran, reportTunggakan } from '../lib/reportsFns'
import { MetricCard } from '../components/ui/MetricCard'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import { EmptyState } from '../components/ui/EmptyState'
import { StatusBadge } from '../components/ui/StatusBadge'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import { TablePagination } from '../components/ui/TablePagination'
import { Avatar } from '../components/ui/Avatar'
import { EntityCard } from '../components/ui/EntityCard'
import { Calendar, BarChart3, Receipt, AlertTriangle, Filter, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export const Route = createFileRoute('/laporan')({
  component: LaporanPage,
})

function formatCurrency(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

const tabs = [
  { key: 'simpanan', label: 'Simpanan', icon: BarChart3 },
  { key: 'pinjaman', label: 'Pinjaman', icon: Receipt },
  { key: 'angsuran', label: 'Angsuran', icon: Calendar },
  { key: 'tunggakan', label: 'Tunggakan', icon: AlertTriangle },
] as const

const PAGE_SIZE = 10

function LaporanPage() {
  const token = useAuthStore((s) => s.token)!
  const isMobile = useIsMobile()
  const searchParams = useSearch({ from: '/laporan' }) as any
  const initialTab = tabs.find(t => t.key === searchParams?.tab)?.key || 'simpanan'
  const [tab, setTab] = useState<'simpanan' | 'pinjaman' | 'angsuran' | 'tunggakan'>(initialTab)
  const [from, setFrom] = useState(format(new Date(), 'yyyy-MM') + '-01')
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [data, setData] = useState<any>(null)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchReport = async () => {
    setLoading(true)
    setError('')
    try {
      // Convert date strings (YYYY-MM-DD) to UTC timestamps to match DB storage
      const parseDate = (dateStr: string): number => {
        const [year, month, day] = dateStr.split('-').map(Number)
        return Date.UTC(year, month - 1, day)
      }
      const parseEndDate = (dateStr: string): number => {
        const [year, month, day] = dateStr.split('-').map(Number)
        return Date.UTC(year, month - 1, day, 23, 59, 59, 999)
      }
      const fromTimestamp = parseDate(from)
      const toTimestamp = parseEndDate(to)

      let result
      if (tab === 'simpanan') {
        result = await reportSimpanan({ data: { token, from: fromTimestamp, to: toTimestamp } })
      } else if (tab === 'pinjaman') {
        result = await reportPinjaman({ data: { token, from: fromTimestamp, to: toTimestamp } })
      } else if (tab === 'angsuran') {
        result = await reportAngsuran({ data: { token, from: fromTimestamp, to: toTimestamp } })
      } else {
        result = await reportTunggakan({ data: { token } })
      }
      setData(result)
      setPage(1)
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat laporan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const paginatedRows = useMemo(() => {
    if (!data?.rows) return []
    const start = (page - 1) * PAGE_SIZE
    return data.rows.slice(start, start + PAGE_SIZE)
  }, [data, page])

  const totalPages = Math.ceil((data?.rows?.length || 0) / PAGE_SIZE) || 1

  return (
    <div className="space-y-4">
      {/* Tab Navigation */}
      <div className={isMobile ? 'flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide' : 'flex gap-2 flex-wrap'}>
        {tabs.map((t) => {
          const Icon = t.icon
          const active = tab === t.key
          return (
            <button
              key={t.key}
              onClick={() => { setTab(t.key); setData(null) }}
              className={[
                'flex items-center gap-1.5 px-3 py-2 rounded-md font-medium text-sm shrink-0',
                active
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-white border border-[var(--color-border)] text-[var(--color-text)] hover:bg-[var(--color-bg-soft)]',
              ].join(' ')}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* Filter Bar - Desktop */}
      {!isMobile && tab !== 'tunggakan' && (
        <div className="flex items-center gap-3 p-3 bg-white border border-[var(--color-border)] rounded-xl">
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-soft)]">
            <Filter className="w-4 h-4" />
            <span>Filter Tanggal:</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] text-[var(--color-text-soft)] font-medium">Dari</label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-auto text-sm py-1.5 px-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
            <div className="flex items-end pb-1.5 text-[var(--color-text-soft)] text-sm">s/d</div>
            <div className="flex flex-col gap-0.5">
              <label className="text-[11px] text-[var(--color-text-soft)] font-medium">Sampai</label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-auto text-sm py-1.5 px-2 border border-[var(--color-border)] rounded-md focus:outline-none focus:border-[var(--color-primary)]"
              />
            </div>
          </div>
          <div className="ml-auto">
            <button onClick={fetchReport} className="btn btn-primary flex items-center gap-1.5">
              <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
              Tampilkan
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar - Mobile */}
      {isMobile && tab !== 'tunggakan' && (
        <div className="space-y-2">
          <button
            onClick={() => setShowDatePicker((v) => !v)}
            className="w-full flex items-center justify-between p-3 bg-white border border-[var(--color-border)] rounded-xl"
          >
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[var(--color-text-soft)]" />
              <span>{format(new Date(from), 'dd MMM yyyy', { locale: id })} – {format(new Date(to), 'dd MMM yyyy', { locale: id })}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-[var(--color-text-soft)] transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
          </button>
          {showDatePicker && (
            <div className="p-3 bg-white border border-[var(--color-border)] rounded-xl space-y-2">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[12px] text-[var(--color-text-soft)] font-medium mb-1">Dari</label>
                  <input
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    className="w-full text-sm py-2 px-3 border border-[var(--color-border)] rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-[12px] text-[var(--color-text-soft)] font-medium mb-1">Sampai</label>
                  <input
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    className="w-full text-sm py-2 px-3 border border-[var(--color-border)] rounded-md"
                  />
                </div>
              </div>
              <button
                onClick={() => { fetchReport(); setShowDatePicker(false) }}
                className="w-full btn btn-primary py-2.5"
              >
                Tampilkan
              </button>
            </div>
          )}
        </div>
      )}

      {error && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          {tab === 'simpanan' && data && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <MetricCard label="Total Setoran" value={formatCurrency(data.totalDeposit)} tone="success" />
                <MetricCard label="Total Penarikan" value={formatCurrency(data.totalWithdrawal)} tone="danger" />
                <MetricCard label="Sisa Simpanan" value={formatCurrency(data.net)} />
              </div>
              
              {isMobile ? (
                <div className="space-y-3">
                  {data.rows.map((r: any) => (
                    <EntityCard
                      key={r.id}
                      title={r.member?.name}
                      subtitle={format(new Date(r.date), 'dd MMM yyyy', { locale: id })}
                      badge={<StatusBadge variant={r.type === 'deposit' ? 'deposit' : 'withdrawal'} />}
                      meta={[
                        { label: 'Jenis', value: r.jenis?.name },
                        { label: 'Jumlah', value: formatCurrency(r.amount), className: r.type === 'deposit' ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]' },
                      ]}
                    />
                  ))}
                  {data.rows.length === 0 && <EmptyState icon={BarChart3} message="Tidak ada data laporan simpanan." />}
                </div>
              ) : (
                <div className="card overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-soft)]">
                          <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Tanggal</th>
                          <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Anggota</th>
                          <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Jenis</th>
                          <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Tipe</th>
                          <th className="text-right px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Jumlah</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRows.map((r: any) => (
                          <tr key={r.id} className="border-b border-[var(--color-border)] last:border-b-0">
                            <td className="px-4 py-3 text-sm">{format(new Date(r.date), 'dd/MM/yyyy', { locale: id })}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-3">
                                <Avatar name={r.member?.name || '?'} size="sm" />
                                <span className="font-medium">{r.member?.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">{r.jenis?.name}</td>
                            <td className="px-4 py-3 text-sm">
                              <StatusBadge variant={r.type === 'deposit' ? 'deposit' : 'withdrawal'} />
                            </td>
                            <td className="px-4 py-3 text-sm text-right font-semibold tabular-nums">{formatCurrency(r.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.rows.length === 0 && (
                      <div className="text-center py-8 text-[var(--color-text-soft)]">Tidak ada data</div>
                    )}
                  </div>
                  {data.rows.length > 0 && (
                    <TablePagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      totalItems={data.rows.length}
                      pageSize={PAGE_SIZE}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'pinjaman' && data && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MetricCard label="Total Pokok" value={formatCurrency(data.totalPrincipal)} />
                <MetricCard label="Total Bunga" value={formatCurrency(data.totalInterest)} tone="warning" />
              </div>

              {isMobile ? (
                <div className="space-y-3">
                  {data.rows.map((r: any) => (
                    <EntityCard
                      key={r.id}
                      title={r.member?.name}
                      subtitle={format(new Date(r.applicationDate), 'dd MMM yyyy', { locale: id })}
                      badge={<StatusBadge variant={r.status as any} />}
                      meta={[
                        { label: 'Jenis', value: r.jenis?.name },
                        { label: 'Pokok', value: formatCurrency(r.principal) },
                      ]}
                    />
                  ))}
                  {data.rows.length === 0 && <EmptyState icon={Receipt} message="Tidak ada data laporan pinjaman." />}
                </div>
              ) : (
                <div className="card overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-soft)]">
                          <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Tanggal</th>
                          <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Anggota</th>
                          <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Jenis</th>
                          <th className="text-right px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Pokok</th>
                          <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRows.map((r: any) => (
                          <tr key={r.id} className="border-b border-[var(--color-border)] last:border-b-0">
                            <td className="px-4 py-3 text-sm">{format(new Date(r.applicationDate), 'dd/MM/yyyy', { locale: id })}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-3">
                                <Avatar name={r.member?.name || '?'} size="sm" />
                                <span className="font-medium">{r.member?.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">{r.jenis?.name}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold tabular-nums">{formatCurrency(r.principal)}</td>
                            <td className="px-4 py-3 text-sm"><StatusBadge variant={r.status as any} /></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.rows.length === 0 && (
                      <div className="text-center py-8 text-[var(--color-text-soft)]">Tidak ada data</div>
                    )}
                  </div>
                  {data.rows.length > 0 && (
                    <TablePagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      totalItems={data.rows.length}
                      pageSize={PAGE_SIZE}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'angsuran' && data && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MetricCard label="Total Diterima" value={formatCurrency(data.totalPaid)} tone="success" />
                <MetricCard label="Total Denda" value={formatCurrency(data.totalPenalty)} tone="warning" />
              </div>

              {isMobile ? (
                <div className="space-y-3">
                  {data.rows.map((r: any) => (
                    <EntityCard
                      key={r.id}
                      title={r.pinjaman?.member?.name}
                      subtitle={`Angsuran ke-${r.installmentNumber}`}
                      meta={[
                        { label: 'Tanggal Bayar', value: r.paidDate ? format(new Date(r.paidDate), 'dd MMM yyyy', { locale: id }) : '-' },
                        { label: 'Denda', value: r.penaltyAmount > 0 ? formatCurrency(r.penaltyAmount) : '-' },
                        { label: 'Jumlah Bayar', value: formatCurrency(r.paidAmount), className: 'text-[var(--color-success)]' },
                      ]}
                    />
                  ))}
                  {data.rows.length === 0 && <EmptyState icon={Calendar} message="Tidak ada data laporan angsuran." />}
                </div>
              ) : (
                <div className="card overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-soft)]">
                          <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Tanggal Bayar</th>
                          <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Anggota</th>
                          <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Ke</th>
                          <th className="text-right px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Bayar</th>
                          <th className="text-right px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Denda</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRows.map((r: any) => (
                          <tr key={r.id} className="border-b border-[var(--color-border)] last:border-b-0">
                            <td className="px-4 py-3 text-sm">{r.paidDate ? format(new Date(r.paidDate), 'dd/MM/yyyy', { locale: id }) : '-'}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-3">
                                <Avatar name={r.pinjaman?.member?.name || '?'} size="sm" />
                                <span className="font-medium">{r.pinjaman?.member?.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">{r.installmentNumber}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold tabular-nums">{formatCurrency(r.paidAmount)}</td>
                            <td className="px-4 py-3 text-sm text-right">{r.penaltyAmount > 0 ? formatCurrency(r.penaltyAmount) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.rows.length === 0 && (
                      <div className="text-center py-8 text-[var(--color-text-soft)]">Tidak ada data</div>
                    )}
                  </div>
                  {data.rows.length > 0 && (
                    <TablePagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      totalItems={data.rows.length}
                      pageSize={PAGE_SIZE}
                    />
                  )}
                </div>
              )}
            </div>
          )}

          {tab === 'tunggakan' && data && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <MetricCard label="Jumlah Tunggakan" value={data.count} subtext="angsuran" tone="danger" />
                <MetricCard label="Total Tunggakan" value={formatCurrency(data.totalDue)} tone="danger" />
              </div>

              {isMobile ? (
                <div className="space-y-3">
                  {data.rows.map((r: any) => (
                    <EntityCard
                      key={r.id}
                      title={r.pinjaman?.member?.name}
                      subtitle={`Angsuran ke-${r.installmentNumber}`}
                      meta={[
                        { label: 'Jatuh Tempo', value: format(new Date(r.dueDate), 'dd MMM yyyy', { locale: id }) },
                        { label: 'Total', value: formatCurrency(r.totalAmount), className: 'text-[var(--color-danger)]' },
                      ]}
                    />
                  ))}
                  {data.rows.length === 0 && <EmptyState icon={AlertTriangle} message="Tidak ada data tunggakan." />}
                </div>
              ) : (
                <div className="card overflow-hidden p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-soft)]">
                          <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Jatuh Tempo</th>
                          <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Anggota</th>
                          <th className="text-left px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Ke</th>
                          <th className="text-right px-4 py-3 text-[12px] font-semibold uppercase tracking-wider">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedRows.map((r: any) => (
                          <tr key={r.id} className="border-b border-[var(--color-border)] last:border-b-0">
                            <td className="px-4 py-3 text-sm">{format(new Date(r.dueDate), 'dd/MM/yyyy', { locale: id })}</td>
                            <td className="px-4 py-3 text-sm">
                              <div className="flex items-center gap-3">
                                <Avatar name={r.pinjaman?.member?.name || '?'} size="sm" />
                                <span className="font-medium">{r.pinjaman?.member?.name}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm">{r.installmentNumber}</td>
                            <td className="px-4 py-3 text-sm text-right font-semibold tabular-nums">{formatCurrency(r.totalAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {data.rows.length === 0 && (
                      <div className="text-center py-8 text-[var(--color-text-soft)]">Tidak ada data</div>
                    )}
                  </div>
                  {data.rows.length > 0 && (
                    <TablePagination
                      currentPage={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
                      totalItems={data.rows.length}
                      pageSize={PAGE_SIZE}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
