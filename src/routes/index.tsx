import { createFileRoute, Link } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../stores/auth'
import { getDashboardStats, getDashboardChartData } from '../lib/dashboardFns'
import { MetricCard } from '../components/ui/MetricCard'
import { ChartCard } from '../components/ui/ChartCard'
import { EmptyState } from '../components/ui/EmptyState'
import {
  AlertTriangle,
  Users,
  Wallet,
  FileText,
  Receipt,
  TrendingUp,
  ArrowRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
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
    <div className="space-y-4 md:space-y-5">
      {loading ? (
        <p className="text-[15px] text-[var(--color-text-soft)]">Memuat data beranda...</p>
      ) : (
        <>
          {/* Stat cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <MetricCard
              label="Anggota Aktif"
              value={stats.activeMembers}
              subtext="Jumlah anggota terdaftar"
              tone="default"
              icon={Users}
            />
            <MetricCard
              label="Total Simpanan"
              value={formatCurrency(stats.totalSimpanan)}
              subtext="Total uang tabungan anggota"
              tone="success"
              icon={Wallet}
            />
            <MetricCard
              label="Pinjaman Aktif"
              value={formatCurrency(stats.totalPinjaman)}
              subtext="Total pinjaman yang sedang berjalan"
              tone="danger"
              icon={FileText}
            />
            <MetricCard
              label="Angsuran Hari Ini"
              value={formatCurrency(stats.angsuranHariIni)}
              subtext="Pembayaran masuk hari ini"
              tone="warning"
              icon={Receipt}
            />
          </div>

          {/* Chart */}
          <ChartCard title="Tren 6 Bulan Terakhir">
            {chartEmpty ? (
              <div className="h-full flex items-center justify-center">
                <EmptyState
                  icon={TrendingUp}
                  message="Belum ada data tren untuk 6 bulan terakhir."
                  className="w-full"
                />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="colorSimpanan" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#16a34a" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPinjaman" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#dc2626" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `Rp ${(v / 1000000).toFixed(0)}jt`}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(Number(value || 0)), '']}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid var(--color-border)',
                      fontSize: 13,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="simpanan"
                    name="Simpanan"
                    stroke="#16a34a"
                    fillOpacity={1}
                    fill="url(#colorSimpanan)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="pinjaman"
                    name="Pinjaman"
                    stroke="#dc2626"
                    fillOpacity={1}
                    fill="url(#colorPinjaman)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Tunggakan alert */}
          {stats.tunggakan > 0 && (
            <div className="card p-4 border-l-4 border-[var(--color-warning)] bg-white">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-full bg-[var(--color-warning-light)] text-[var(--color-warning-dark)] shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-[var(--color-text)]">
                    Perhatian: Ada {stats.tunggakan} angsuran menunggak
                  </p>
                  <p className="text-[13px] text-[var(--color-text-soft)] mt-0.5">
                    Segera cek detail tunggakan agar tidak semakin bertambah.
                  </p>
                  <Link
                    to="/laporan"
                    className="inline-flex items-center gap-1 mt-2 text-sm font-semibold text-[var(--color-warning-dark)] hover:underline"
                  >
                    Lihat Detail <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
