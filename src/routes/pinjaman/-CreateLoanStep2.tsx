import { FormField } from '../../components/ui/FormField'
import type { FormEvent } from 'react'

interface CreateLoanStep2Props {
  errors: Record<string, string>
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
}

export function CreateLoanStep2({ errors, onSubmit }: CreateLoanStep2Props) {
  const todayStr = new Date().toISOString().split('T')[0]

  return (
    <form id="pinjamanStep2" onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormField
        label="Pokok Pinjaman (Rp)"
        htmlFor="principal"
        error={errors.principal}
      >
        <input id="principal" name="principal" type="number" inputMode="numeric" step="1" placeholder="Contoh: 5000000" required />
        <p className="text-xs text-[var(--color-text-soft)] mt-1">Jumlah pokok yang akan dipinjamkan</p>
      </FormField>

      <FormField
        label="Tenor (bulan)"
        htmlFor="tenorMonths"
        error={errors.tenorMonths}
      >
        <input id="tenorMonths" name="tenorMonths" type="number" inputMode="numeric" step="1" placeholder="Contoh: 12" required />
        <p className="text-xs text-[var(--color-text-soft)] mt-1">Jumlah bulan untuk melunasi pinjaman</p>
      </FormField>

      <FormField
        label="Tanggal Pengajuan"
        htmlFor="applicationDate"
        error={errors.applicationDate}
      >
        <input id="applicationDate" name="applicationDate" type="date" defaultValue={todayStr} required />
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
