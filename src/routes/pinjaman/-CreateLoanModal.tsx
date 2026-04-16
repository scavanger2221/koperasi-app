import { Modal } from '../../components/ui/Modal'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { ModalFooter } from '../../components/ui/ModalFooter'
import { CreateLoanStep1 } from './-CreateLoanStep1'
import { CreateLoanStep2 } from './-CreateLoanStep2'
import { ChevronLeft } from 'lucide-react'
import { cn } from '../../lib/utils'

interface CreateLoanModalProps {
  open: boolean
  onClose: () => void
  members: Array<{ id: number; code: string; name: string }>
  jenisList: Array<{ id: number; name: string; interestRate: number }>
  step1Values: { memberId: string; jenisPinjamanId: string }
  step: 1 | 2
  error: string
  fieldErrors: Record<string, string>
  onStep1Change: (e: React.FormEvent<HTMLFormElement>) => void
  onStep2Change: (e: React.FormEvent<HTMLFormElement>) => void
  onBack: () => void
  onCloseWithReset: () => void
}

export function CreateLoanModal({
  open,
  onClose,
  members,
  jenisList,
  step1Values: _step1Values,
  step,
  error,
  fieldErrors,
  onStep1Change,
  onStep2Change,
  onBack,
  onCloseWithReset,
}: CreateLoanModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={step === 1 ? 'Tambah Pinjaman' : 'Detail Pinjaman'}
      footer={
        step === 1 ? (
          <ModalFooter
            secondaryLabel="Batal"
            onSecondary={onCloseWithReset}
            primaryLabel="Lanjut"
            onPrimary={() => {}}
            primaryType="submit"
            form="pinjamanStep1"
          />
        ) : (
          <ModalFooter
            showSecondary={false}
            primaryLabel="Simpan Pengajuan"
            onPrimary={() => {}}
            primaryType="submit"
            form="pinjamanStep2"
            extra={
              <button type="button" onClick={onBack} className="btn btn-secondary flex-1 flex items-center justify-center gap-1">
                <ChevronLeft className="w-4 h-4" /> Kembali
              </button>
            }
          />
        )
      }
    >
      {error && <ErrorAlert message={error} className="mb-3" />}
      <div className="flex items-center justify-center gap-2 mb-4">
        <span className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', step >= 1 ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-soft)] text-[var(--color-text-soft)]')}>1</span>
        <div className={cn('h-1 w-8 rounded-full', step >= 2 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-soft)]')} />
        <span className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold', step >= 2 ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-bg-soft)] text-[var(--color-text-soft)]')}>2</span>
      </div>

      {step === 1 ? (
        <CreateLoanStep1 members={members} jenisList={jenisList} errors={fieldErrors} onSubmit={onStep1Change} />
      ) : (
        <CreateLoanStep2 errors={fieldErrors} onSubmit={onStep2Change} />
      )}
    </Modal>
  )
}
