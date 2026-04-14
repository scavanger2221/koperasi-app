import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/auth'
import { useIsMobile } from '../hooks/useIsMobile'
import { reportSimpanan, reportPinjaman, reportAngsuran, reportTunggakan } from '../lib/reportsFns'
import { MetricCard } from '../components/ui/MetricCard'
import { ErrorAlert } from '../components/ui/ErrorAlert'
import { MobileRow } from '../components/ui/MobileRow'
import { StatusBadge } from '../components/ui/StatusBadge'
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

function LaporanPage() {
  const token = useAuthStore((s) => s.token)!
  const isMobile = useIsMobile()
  const [tab, setTab] = useState<'simpanan' | 'pinjaman' | 'angsuran' | 'tunggakan'>('simpanan')
  const [from, setFrom] = useState(format(new Date(), 'yyyy-MM') + '-01')
  const [to, setTo] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchReport = async () => {
    setLoading(true)
    setError('')
    try {
      let result
      if (tab === 'simpanan') {
        result = await reportSimpanan({ data: { token, from, to } })
      } else if (tab === 'pinjaman') {
        result = await reportPinjaman({ data: { token, from, to } })
      } else if (tab === 'angsuran') {
        result = await reportAngsuran({ data: { token, from, to } })
      } else {
        result = await reportTunggakan({ data: { token } })
      }
      setData(result)
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat laporan')
    } finally {
      setLoading(false)
    }
  }

  // Auto-fetch on tab change
  useEffect(() => {
    fetchReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  const currentTab = tabs.find(t => t.key === tab)!

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
        <div className="flex items-center gap-3 p-3 bg-white border border-[var(--color-border)] rounded-lg">
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
            className="w-full flex items-center justify-between p-3 bg-white border border-[var(--color-border)] rounded-lg"
          >
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="w-4 h-4 text-[var(--color-text-soft)]" />
              <span>{format(new Date(from), 'dd MMM yyyy', { locale: id })} – {format(new Date(to), 'dd MMM yyyy', { locale: id })}</span>
            </div>
            <ChevronDown className={`w-4 h-4 text-[var(--color-text-soft)] transition-transform ${showDatePicker ? 'rotate-180' : ''}`} />
          </button>
          {showDatePicker && (
            <div className="p-3 bg-white border border-[var(--color-border)] rounded-lg space-y-2">
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

      {/* Mobile Quick Action (non-tunggakan) */}
      {isMobile && tab !== 'tunggakan' && !showDatePicker && (
        <button onClick={fetchReport} className="w-full btn btn-primary flex items-center justify-center gap-2">
          <Filter className="w-4 h-4" />
          Tampilkan Laporan
        </button>
      )}

      {error && <ErrorAlert message={error} />}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <p className="text-[13px] text-[var(--color-text-soft)]">Memuat...</p>
        </div>
      )}

      {!loading && data && tab === 'simpanan' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <MetricCard label="Total Setoran" value={formatCurrency(data.totalDeposit)} tone="success" />
            <MetricCard label="Total Penarikan" value={formatCurrency(data.totalWithdrawal)} tone="danger" />
            <MetricCard label="Netto" value={formatCurrency(data.net)} />
          </div>
          
          {isMobile ? (
            <div className="space-y-2">
              {data.rows.map((r: any) => (
                <div key={r.id} className="card p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold">{r.member?.name}</span>
                    <StatusBadge variant={r.type === 'deposit' ? 'deposit' : 'withdrawal'}>
                      {r.type === 'deposit' ? 'Setor' : 'Tarik'}
                    </StatusBadge>
                  </div>
                  <div className="flex justify-between text-xs text-[var(--color-text-soft)]">
                    <span>{format(new Date(r.date), 'dd MMM yyyy', { locale: id })}</span>
                    <span>{r.jenis?.name}</span>
                  </div>
                  <div className="text-right text-sm font-bold tabular-nums">
                    {formatCurrency(r.amount)}
                  </div>
                </div>
              ))}
              {data.rows.length === 0 && <EmptyState icon={BarChart3} message="Tidak ada data" />}
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
                    {data.rows.map((r: any) => (
                      <tr key={r.id} className="border-b border-[var(--color-border)] last:border-b-0">
                        <td className="px-4 py-3 text-sm">{format(new Date(r.date), 'dd/MM/yyyy', { locale: id })}</td>
                        <td className="px-4 py-3 text-sm font-medium">{r.member?.name}</td>
                        <td className="px-4 py-3 text-sm">{r.jenis?.name}</td>
                        <td className="px-4 py-3 text-sm">
                          <StatusBadge variant={r.type === 'deposit' ? 'deposit' : 'withdrawal'}>
                            {r.type === 'deposit' ? 'Setor' : 'Tarik'}
                          </StatusBadge>
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
            </div>
          )}
        </div>
      )}

      {!loading && data && tab === 'pinjaman' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MetricCard label="Total Pokok" value={formatCurrency(data.totalPrincipal)} />
            <MetricCard label="Total Bunga" value={formatCurrency(data.totalInterest)} tone="warning" />
          </div>

          {isMobile ? (
            <div className="space-y-2">
              {data.rows.map((r: any) => (
                <div key={r.id} className="card p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold">{r.member?.name}</span>
                    <StatusBadge variant={r.status as any} />
                  </div>
                  <div className="flex justify-between text-xs text-[var(--color-text-soft)]">
                    <span>{format(new Date(r.applicationDate), 'dd MMM yyyy', { locale: id })}</span>
                    <span>{r.jenis?.name}</span>
                  </div>
                  <div className="text-right text-sm font-bold tabular-nums">
                    {formatCurrency(r.principal)}
                  </div>
                </div>
              ))}
              {data.rows.length === 0 && <EmptyState icon={Receipt} message="Tidak ada data" />}
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
                    {data.rows.map((r: any) => (
                      <tr key={r.id} className="border-b border-[var(--color-border)] last:border-b-0">
                        <td className="px-4 py-3 text-sm">{format(new Date(r.applicationDate), 'dd/MM/yyyy', { locale: id })}</td>
                        <td className="px-4 py-3 text-sm font-medium">{r.member?.name}</td>
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
            </div>
          )}
        </div>
      )}

      {!loading && data && tab === 'angsuran' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MetricCard label="Total Diterima" value={formatCurrency(data.totalPaid)} tone="success" />
            <MetricCard label="Total Denda" value={formatCurrency(data.totalPenalty)} tone="warning" />
          </div>

          {isMobile ? (
            <div className="space-y-2">
              {data.rows.map((r: any) => (
                <div key={r.id} className="card p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold">{r.pinjaman?.member?.name}</span>
                    <span className="text-xs font-medium">Ke-{r.installmentNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[var(--color-text-soft)]">
                    <span>{r.paidDate ? format(new Date(r.paidDate), 'dd MMM yyyy', { locale: id }) : '-'}</span>
                    <span>Denda: {r.penaltyAmount > 0 ? formatCurrency(r.penaltyAmount) : '-'}</span>
                  </div>
                  <div className="text-right text-sm font-bold tabular-nums">
                    {formatCurrency(r.paidAmount)}
                  </div>
                </div>
              ))}
              {data.rows.length === 0 && <EmptyState icon={Calendar} message="Tidak ada data" />}
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
                    {data.rows.map((r: any) => (
                      <tr key={r.id} className="border-b border-[var(--color-border)] last:border-b-0">
                        <td className="px-4 py-3 text-sm">{r.paidDate ? format(new Date(r.paidDate), 'dd/MM/yyyy', { locale: id }) : '-'}</td>
                        <td className="px-4 py-3 text-sm font-medium">{r.pinjaman?.member?.name}</td>
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
            </div>
          )}
        </div>
      )}

      {!loading && data && tab === 'tunggakan' && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <MetricCard label="Jumlah Tunggakan" value={`${data.count} angsuran`} tone="danger" />
            <MetricCard label="Total Tunggakan" value={formatCurrency(data.totalDue)} tone="danger" />
          </div>

          {isMobile ? (
            <div className="space-y-2">
              {data.rows.map((r: any) => (
                <div key={r.id} className="card p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold">{r.pinjaman?.member?.name}</span>
                    <span className="text-xs font-medium">Ke-{r.installmentNumber}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[var(--color-text-soft)]">
                    <span>Jatuh Tempo: {format(new Date(r.dueDate), 'dd MMM yyyy', { locale: id })}</span>
                  </div>
                  <div className="text-right text-sm font-bold tabular-nums">
                    {formatCurrency(r.totalAmount)}
                  </div>
                </div>
              ))}
              {data.rows.length === 0 && <EmptyState icon={AlertTriangle} message="Tidak ada data" />}
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
                    {data.rows.map((r: any) => (
                      <tr key={r.id} className="border-b border-[var(--color-border)] last:border-b-0">
                        <td className="px-4 py-3 text-sm">{format(new Date(r.dueDate), 'dd/MM/yyyy', { locale: id })}</td>
                        <td className="px-4 py-3 text-sm font-medium">{r.pinjaman?.member?.name}</td>
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
            </div>
          )}
        </div>
      )}
    </div>
  )
}
