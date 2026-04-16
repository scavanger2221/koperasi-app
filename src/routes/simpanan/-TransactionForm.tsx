import { FormField } from '../../components/ui/FormField'
import type { FormEvent } from 'react'

interface TransactionFormProps {
  members: Array<{ id: number; code: string; name: string }>
  jenisList: Array<{ id: number; name: string }>
  errors: Record<string, string>
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
}

export function TransactionForm({ members, jenisList, errors, onSubmit }: TransactionFormProps) {
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <form id="simpananForm" onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormField
        label="Anggota"
        htmlFor="memberId"
        error={errors.memberId}
      >
        <select id="memberId" name="memberId" required>
          <option value="">Pilih anggota</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>
              {m.code} - {m.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Jenis Simpanan"
        htmlFor="jenisSimpananId"
        error={errors.jenisSimpananId}
      >
        <select id="jenisSimpananId" name="jenisSimpananId" required>
          <option value="">Pilih jenis</option>
          {jenisList.map((j) => (
            <option key={j.id} value={j.id}>
              {j.name}
            </option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Tipe Transaksi"
        htmlFor="type"
      >
        <select id="type" name="type" required>
          <option value="deposit">Setoran (Deposit)</option>
          <option value="withdrawal">Penarikan (Withdrawal)</option>
        </select>
      </FormField>

      <FormField
        label="Jumlah (Rp)"
        htmlFor="amount"
        error={errors.amount}
      >
        <input id="amount" name="amount" type="number" inputMode="numeric" step="1" placeholder="Contoh: 100000" required />
      </FormField>

      <FormField
        label="Tanggal"
        htmlFor="date"
        error={errors.date}
      >
        <input id="date" name="date" type="date" defaultValue={todayStr} required />
      </FormField>

      <FormField
        label="Keterangan"
        htmlFor="notes"
      >
        <textarea id="notes" name="notes" placeholder="Keterangan tambahan" rows={2} />
      </FormField>
    </form>
  )
}
