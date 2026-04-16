import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/auth'
import { getDashboardStats, getDashboardChartData } from '../lib/dashboardFns'
import { MetricCard } from '../components/ui/MetricCard'
import { ChartCard } from '../components/ui/ChartCard'
import { EmptyState } from '../components/ui/EmptyState'
import { LoadingSpinner } from '../components/ui/LoadingSpinner'
import {
  AlertTriangle,
  Users,
  Wallet,
  FileText,
  Receipt,
  TrendingUp,
  ArrowRight,
  BarChart3,
  PiggyBank,
  Search,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
export const Route = createFileRoute('/')({
  component: DashboardPage,
})

function formatCurrency(n: number) {
  return `Rp ${n.toLocaleString('id-ID')}`
}

function isChartEmpty(data: { label: string; simpanan: number; pinjaman: number }[]) {
  return data.every((d) => d.simpanan === 0 && d.pinjaman === 0)
}

function DashboardPage() {
  const token = useAuthStore((s) => s.token)!
  const user = useAuthStore((s) => s.user)
  const [stats, setStats] = useState({
    activeMembers: 0,
    totalSimpanan: 0,
    totalPinjaman: 0,
    angsuranHariIni: 0,
    tunggakan: 0,
  })
  const [chartData, setChartData] = useState<{ label: string; simpanan: number; pinjaman: number }[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      getDashboardStats({ data: { token } }),
      getDashboardChartData({ data: { token } }),
    ])
      .then(([s, c]) => {
        setStats(s)
        setChartData(c)
      })
      .finally(() => setLoading(false))
  }, [token])

  const chartEmpty = isChartEmpty(chartData)

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 border-b border-[var(--color-border)] pb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[var(--color-text)] tracking-tighter uppercase">
            Selamat datang, <span className="text-[var(--color-primary)]">{user?.name?.split(' ')[0] || 'Pengguna'}</span>
          </h2>
          <p className="text-sm font-bold text-[var(--color-text-soft)] uppercase tracking-widest mt-2 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[var(--color-primary)]" /> Ringkasan Koperasi Hari Ini
          </p>
        </div>
        <div className="hidden md:block">
          <div className="text-xs font-extrabold text-[var(--color-text-soft)] uppercase tracking-widest bg-[var(--color-bg-soft)] px-4 py-2 rounded-md border border-[var(--color-border)]">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Menyiapkan data dashboard..." />
      ) : (
        <>
          {/* URGENT: Tunggakan Alert (Responsive Compact Bar) */}
          {stats.tunggakan > 0 && (
            <div className="card border-l-4 border-[var(--color-danger)] bg-[var(--color-bg)] overflow-hidden animate-in slide-in-from-top-4 duration-500 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-5 sm:py-3 gap-4 relative">
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-10 h-10 rounded-md bg-[var(--color-danger-light)] text-[var(--color-danger)] flex items-center justify-center shrink-0 border border-[var(--color-danger)]/10">
                    <AlertTriangle className="w-5 h-5" strokeWidth={2.5} />
                  </div>
                  <div className="flex flex-row items-center gap-3">
                    <span className="text-xl font-black text-[var(--color-danger)] tabular-nums leading-none">
                      {stats.tunggakan}
                    </span>
                    <h3 className="text-sm font-extrabold text-[var(--color-text)] tracking-tight uppercase leading-none">
                      Angsuran Menunggak
                    </h3>
                    <div className="hidden lg:block w-px h-4 bg-[var(--color-border)] mx-1" />
                    <p className="hidden lg:block text-xs font-bold text-[var(--color-text-soft)] uppercase tracking-widest">
                      Segera tinjau laporan untuk menjaga arus kas
                    </p>
                  </div>
                </div>

                <div className="shrink-0 relative z-10 w-full sm:w-auto">
                  <Link
                    to="/laporan"
                    search={{ tab: 'tunggakan' }}
                    className="btn btn-danger btn-sm w-full sm:w-auto px-6 text-2xs font-black uppercase tracking-widest min-h-[40px] sm:min-h-[36px]"
                  >
                    Tinjau Laporan <ArrowRight className="w-4 h-4 ml-2" strokeWidth={3.5} />
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
            <MetricCard
              label="Anggota Aktif"
              value={stats.activeMembers}
              subtext="Total terdaftar"
              tone="default"
              icon={Users}
            />
            <MetricCard
              label="Total Simpanan"
              value={formatCurrency(stats.totalSimpanan)}
              subtext="Tabungan anggota"
              tone="success"
              icon={Wallet}
            />
            <MetricCard
              label="Pinjaman Aktif"
              value={formatCurrency(stats.totalPinjaman)}
              subtext="Sedang berjalan"
              tone="danger"
              icon={FileText}
            />
            <MetricCard
              label="Angsuran Hari Ini"
              value={formatCurrency(stats.angsuranHariIni)}
              subtext="Masuk hari ini"
              tone="warning"
              icon={Receipt}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2">
              <ChartCard title="Statistik Pertumbuhan (6 Bulan)">
                {chartEmpty ? (
                  <div className="h-full flex items-center justify-center">
                    <EmptyState
                      icon={TrendingUp}
                      message="Belum ada data statistik."
                      className="w-full border-none shadow-none bg-transparent"
                    />
                  </div>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height={280}>
                      <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                        <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--color-border)" opacity={0.5} />
                        <XAxis 
                          dataKey="label" 
                          axisLine={false} 
                          tickLine={false} 
                          tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--color-text-soft)' }} 
                          dy={10}
                        />
                        <YAxis
                          axisLine={false}
                          tickLine={false}
                          tick={{ fontSize: 11, fontWeight: 700, fill: 'var(--color-text-soft)' }}
                          tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(0)}jt`}
                        />
                        <Tooltip
                          formatter={(value) => [formatCurrency(Number(value || 0)), '']}
                          contentStyle={{
                            borderRadius: 8,
                            border: '1px solid var(--color-border)',
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '12px',
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="simpanan"
                          name="Simpanan"
                          stroke="var(--color-success)"
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="pinjaman"
                          name="Pinjaman"
                          stroke="var(--color-danger)"
                          strokeWidth={3}
                          dot={false}
                          activeDot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <div className="flex items-center justify-center gap-6 mt-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-success)]" />
                        <span className="text-xs font-extrabold text-[var(--color-text-soft)] uppercase tracking-widest">Simpanan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-[var(--color-danger)]" />
                        <span className="text-xs font-extrabold text-[var(--color-text-soft)] uppercase tracking-widest">Pinjaman</span>
                      </div>
                    </div>
                  </>
                )}
              </ChartCard>
            </div>

            {/* Quick Actions & Alerts */}
            <div className="space-y-6">
              <div className="flex flex-col gap-3">
                <p className="text-xs font-extrabold text-[var(--color-text-soft)] uppercase tracking-widest px-1">Akses Cepat</p>
                <Link to="/laporan" search={{ tab: 'simpanan' }} className="card p-5 flex items-center gap-4 hover:border-[var(--color-primary)] transition-all group bg-[var(--color-bg)]">
                  <div className="w-12 h-12 rounded-md bg-[var(--color-success-light)] text-[var(--color-success)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <PiggyBank className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-[var(--color-text)] leading-tight">Laporan Simpanan</p>
                    <p className="text-xs font-bold text-[var(--color-text-soft)] mt-1 uppercase tracking-tighter">Detail Transaksi</p>
                  </div>
                </Link>
                <Link to="/laporan" search={{ tab: 'pinjaman' }} className="card p-5 flex items-center gap-4 hover:border-[var(--color-primary)] transition-all group bg-[var(--color-bg)]">
                  <div className="w-12 h-12 rounded-md bg-[var(--color-danger-light)] text-[var(--color-danger)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <BarChart3 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-[var(--color-text)] leading-tight">Laporan Pinjaman</p>
                    <p className="text-xs font-bold text-[var(--color-text-soft)] mt-1 uppercase tracking-tighter">Detail Pinjaman</p>
                  </div>
                </Link>
                <Link to="/angsuran" className="card p-5 flex items-center gap-4 hover:border-[var(--color-primary)] transition-all group bg-[var(--color-bg)]">
                  <div className="w-12 h-12 rounded-md bg-[var(--color-warning-light)] text-[var(--color-warning)] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Search className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-[var(--color-text)] leading-tight">Cek Angsuran</p>
                    <p className="text-xs font-bold text-[var(--color-text-soft)] mt-1 uppercase tracking-tighter">Pantau Pembayaran</p>
                  </div>
                </Link>
              </div>

            </div>
          </div>
        </>
      )}
    </div>
  )
}
