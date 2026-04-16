import { FormField } from '../../components/ui/FormField'
import type { FormEvent } from 'react'

interface CreateLoanStep1Props {
  members: Array<{ id: number; code: string; name: string }>
  jenisList: Array<{ id: number; name: string; interestRate: number }>
  errors: Record<string, string>
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
}

export function CreateLoanStep1({ members, jenisList, errors, onSubmit }: CreateLoanStep1Props) {
  return (
    <form id="pinjamanStep1" onSubmit={onSubmit} className="space-y-4" noValidate>
      <FormField
        label="Anggota"
        htmlFor="memberId"
        error={errors.memberId}
      >
        <select id="memberId" name="memberId" required>
          <option value="">Pilih anggota</option>
          {members.map((m) => (
            <option key={m.id} value={m.id}>{m.code} - {m.name}</option>
          ))}
        </select>
      </FormField>

      <FormField
        label="Jenis Pinjaman"
        htmlFor="jenisPinjamanId"
        error={errors.jenisPinjamanId}
      >
        <select id="jenisPinjamanId" name="jenisPinjamanId" required>
          <option value="">Pilih jenis</option>
          {jenisList.map((j) => (
            <option key={j.id} value={j.id}>{j.name} ({j.interestRate}%/thn)</option>
          ))}
        </select>
      </FormField>
    </form>
  )
}
