import { createFileRoute, useSearch } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useAuthStore } from '../../stores/auth'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePagination } from '../../hooks/usePagination'
import { reportSimpanan, reportPinjaman, reportAngsuran, reportTunggakan } from '../../lib/reportsFns'
import { ReportTabs } from './-ReportTabs'
import { DateRangePicker } from './-DateRangePicker'
import { SimpananReport } from './-SimpananReport'
import { PinjamanReport } from './-PinjamanReport'
import { AngsuranReport } from './-AngsuranReport'
import { TunggakanReport } from './-TunggakanReport'
import { BarChart3, Receipt, Calendar, AlertTriangle } from 'lucide-react'
import { ERROR_MESSAGES } from '../../constants/messages'

export const Route = createFileRoute('/laporan/')({
  component: LaporanPage,
})

const tabs = [
  { key: 'simpanan', label: 'Simpanan', icon: BarChart3 },
  { key: 'pinjaman', label: 'Pinjaman', icon: Receipt },
  { key: 'angsuran', label: 'Angsuran', icon: Calendar },
  { key: 'tunggakan', label: 'Tunggakan', icon: AlertTriangle },
] as const

function parseDate(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).getTime()
}

function parseEndDate(dateStr: string): number {
  const [year, month, day] = dateStr.split('-').map(Number)
  const end = new Date(year, month - 1, day)
  end.setHours(23, 59, 59, 999)
  return end.getTime()
}

function LaporanPage() {
  const token = useAuthStore((s) => s.token)!
  const isMobile = useIsMobile()
  const searchParams = useSearch({ from: '/laporan/' }) as any
  const initialTab = tabs.find(t => t.key === searchParams?.tab)?.key || 'simpanan'
  const [tab, setTab] = useState<'simpanan' | 'pinjaman' | 'angsuran' | 'tunggakan'>(initialTab)
  const [from, setFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0])
  const [to, setTo] = useState(new Date().toISOString().split('T')[0])
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { page, setPage, totalPages } = usePagination(data?.rows || [])

  useEffect(() => {
    setPage(1)
  }, [data, setPage])

  const fetchReport = async () => {
    setLoading(true)
    setError('')
    try {
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
    } catch (err: any) {
      setError(err?.message || ERROR_MESSAGES.FETCH_FAILED)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    setData(null)
    setLoading(true)
    fetchReport()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab])

  if (loading) return <div className="flex items-center justify-center py-12">Memuat...</div>

  return (
    <div className="space-y-4">
      <ReportTabs currentTab={tab} onTabChange={(t) => { setData(null); setTab(t) }} isMobile={isMobile} />

      {tab !== 'tunggakan' && (
        <DateRangePicker
          from={from}
          to={to}
          onFromChange={setFrom}
          onToChange={setTo}
          onShow={() => setShowDatePicker(prev => !prev)}
          showDatePicker={showDatePicker}
          onFetch={fetchReport}
          isMobile={isMobile}
        />
      )}

      {error && <div className="text-red-600 font-medium">{error}</div>}

      {tab === 'simpanan' && data && (
        <SimpananReport
          data={data}
          isMobile={isMobile}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {tab === 'pinjaman' && data && (
        <PinjamanReport
          data={data}
          isMobile={isMobile}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {tab === 'angsuran' && data && (
        <AngsuranReport
          data={data}
          isMobile={isMobile}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {tab === 'tunggakan' && data && (
        <TunggakanReport
          data={data}
          isMobile={isMobile}
          error={error}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}
    </div>
  )
}
