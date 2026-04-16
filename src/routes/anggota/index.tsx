import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo, useEffect } from 'react'
import { useAuthStore } from '../../stores/auth'
import { useIsMobile } from '../../hooks/useIsMobile'
import { usePagination } from '../../hooks/usePagination'
import { useLoadMore } from '../../hooks/useLoadMore'
import { useToast } from '../../components/ui/ToastProvider'
import { listMembers, createMember, updateMember, deactivateMember } from '../../lib/membersFns'
import { Modal } from '../../components/ui/Modal'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { MetricCard } from '../../components/ui/MetricCard'
import { Toolbar } from '../../components/ui/Toolbar'
import { SearchInput } from '../../components/ui/SearchInput'
import { EmptyState } from '../../components/ui/EmptyState'
import { ErrorAlert } from '../../components/ui/ErrorAlert'
import { StatusBadge } from '../../components/ui/StatusBadge'
import { DataTable } from '../../components/ui/DataTable'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { TablePagination } from '../../components/ui/TablePagination'
import { EntityCard } from '../../components/ui/EntityCard'
import { PageActions } from '../../components/ui/PageActions'
import { IconButton } from '../../components/ui/IconButton'
import { ModalFooter } from '../../components/ui/ModalFooter'
import { FormField } from '../../components/ui/FormField'
import { CellNumber, CellMember } from '../../components/ui/table-cells'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { Plus, Pencil, UserX, User, Users, Activity } from 'lucide-react'
import { ERROR_MESSAGES } from '../../constants/messages'

export const Route = createFileRoute('/anggota/')({
  component: AnggotaPage,
})

type Member = Awaited<ReturnType<typeof listMembers>>[number]

const columnHelper = createColumnHelper<Member>()

function AnggotaPage() {
  const token = useAuthStore((s) => s.token)!
  const isMobile = useIsMobile()
  const { success, error: showError } = useToast()
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Member | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deactivatingId, setDeactivatingId] = useState<number | null>(null)

  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const fetchMembers = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await listMembers({ data: { token, search: search || undefined } })
      setMembers(data)
    } catch (err: any) {
      setError(err?.message || 'Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMembers()
  }, [search])

  const { paginated: paginatedMembers, page, setPage, totalPages, pageSize } = usePagination(members)
  const { visible: visibleMembers, canLoadMore, loadMore } = useLoadMore(members)

  useEffect(() => {
    setPage(1)
  }, [members, setPage])

  const totalCount = members.length
  const activeCount = members.filter((m) => m.status === 'active').length

  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'no',
        header: 'No',
        cell: ({ row }) => (page - 1) * pageSize + row.index + 1,
      }),
      columnHelper.display({
        id: 'name',
        header: 'Nama',
        cell: ({ row }) => row.original.name,
      }),
      columnHelper.accessor('code', { header: 'Kode', cell: (info) => info.getValue() }),
      columnHelper.accessor('nik', { header: 'NIK', cell: (info) => info.getValue() || '-' }),
      columnHelper.accessor('phone', { header: 'Telepon', cell: (info) => info.getValue() || '-' }),
      columnHelper.accessor('status', {
        header: 'Status',
        cell: (info) => <StatusBadge variant={info.getValue() === 'active' ? 'active' : 'inactive'} />,
      }),
      columnHelper.display({
        id: 'actions',
        header: () => <div className="text-right">Kelola Data</div>,
        cell: ({ row }) => (
          <PageActions>
            <IconButton
              icon={Pencil}
              label="Ubah"
              showLabel={true}
              onClick={() => {
                setEditing(row.original)
                setModalOpen(true)
              }}
            />
            {row.original.status === 'active' && (
              <IconButton
                icon={UserX}
                label="Hapus"
                showLabel={true}
                variant="danger"
                onClick={() => {
                  setDeactivatingId(row.original.id)
                  setConfirmOpen(true)
                }}
              />
            )}
          </PageActions>
        ),
      }),
    ],
    [page, pageSize]
  )

  const table = useReactTable({
    data: paginatedMembers,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    const form = e.currentTarget
    const formData = new FormData(form)
    const values = {
      code: String(formData.get('code')),
      name: String(formData.get('name')),
      nik: String(formData.get('nik') || ''),
      address: String(formData.get('address') || ''),
      phone: String(formData.get('phone') || ''),
      status: (formData.get('status') as 'active' | 'inactive') || 'active',
    }

    const errors: Record<string, string> = {}
    if (!values.code.trim()) errors.code = 'Kode anggota wajib diisi'
    if (!values.name.trim()) errors.name = 'Nama lengkap wajib diisi'

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setFieldErrors({})

    try {
      if (editing) {
        await updateMember({ data: { token, id: editing.id, ...values } })
        success('Data anggota berhasil diperbarui')
      } else {
        await createMember({ data: { token, ...values } })
        success('Anggota berhasil ditambahkan')
      }
      setModalOpen(false)
      setEditing(null)
      setFieldErrors({})
      await fetchMembers()
    } catch (err: any) {
      setError(err?.message || ERROR_MESSAGES.SAVE_FAILED)
      showError(err?.message || ERROR_MESSAGES.SAVE_FAILED)
    }
  }

  const handleDeactivate = async () => {
    if (!deactivatingId) return
    setError('')
    try {
      await deactivateMember({ data: { token, id: deactivatingId } })
      setConfirmOpen(false)
      setDeactivatingId(null)
      success('Anggota dinonaktifkan')
      await fetchMembers()
    } catch (err: any) {
      setError(err?.message || ERROR_MESSAGES.DELETE_FAILED)
      showError(err?.message || ERROR_MESSAGES.DELETE_FAILED)
    }
  }

  return (
    <div className="space-y-4">
      <Toolbar>
        <div className="flex-1">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Cari nama, kode, atau NIK..."
          />
        </div>
        <button
          onClick={() => {
            setEditing(null)
            setModalOpen(true)
          }}
          className="btn btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </button>
      </Toolbar>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard label="Total Anggota" value={totalCount} icon={Users} />
        <MetricCard label="Anggota Aktif" value={activeCount} tone="success" icon={User} />
        <MetricCard label="Anggota Nonaktif" value={totalCount - activeCount} icon={User} />
        <MetricCard label="Persentase Aktif" value={`${totalCount ? Math.round((activeCount / totalCount) * 100) : 0}%`} icon={Activity} />
      </div>

      {error && !modalOpen && !confirmOpen && <ErrorAlert message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : members.length === 0 ? (
        <EmptyState
          icon={User}
          message={search ? `Tidak ditemukan hasil untuk "${search}"` : "Belum ada anggota yang terdaftar."}
          submessage={search ? "Coba kata kunci lain." : "Silakan tambah anggota baru."}
          action={
            search ? (
              <button onClick={() => setSearch('')} className="btn btn-secondary">Hapus Pencarian</button>
            ) : undefined
          }
        />
      ) : isMobile ? (
        <div className="space-y-3">
          {visibleMembers.map((m, idx) => (
            <EntityCard
              key={m.id}
              number={idx + 1}
              title={m.name}
              subtitle={[m.code, m.phone || 'Telepon tidak tersedia'].filter(Boolean).join(' • ')}
              badge={<StatusBadge variant={m.status === 'active' ? 'active' : 'inactive'} />}
              meta={[
                { label: 'NIK', value: m.nik || '-' },
              ]}
              actions={[
                {
                  label: 'Ubah',
                  variant: 'secondary',
                  onClick: () => {
                    setEditing(m)
                    setModalOpen(true)
                  },
                },
                ...(m.status === 'active'
                  ? [
                      {
                        label: 'Nonaktifkan',
                        variant: 'ghost' as const,
                        onClick: () => {
                          setDeactivatingId(m.id)
                          setConfirmOpen(true)
                        },
                      },
                    ]
                  : []),
              ]}
            />
          ))}
          {canLoadMore && (
            <button onClick={loadMore} className="w-full btn btn-secondary">
              Muat Lebih
            </button>
          )}
        </div>
      ) : (
        <DataTable>
          <table>
            <thead>
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th key={h.id} className={h.column.id === 'actions' ? 'text-right' : 'text-left'}>
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    if (cell.column.id === 'no') {
                      return <CellNumber key={cell.id}>{(page - 1) * pageSize + row.index + 1}</CellNumber>
                    }
                    if (cell.column.id === 'name') {
                      return <CellMember key={cell.id} name={row.original.name} />
                    }
                    if (cell.column.id === 'actions') {
                      return (
                        <td key={cell.id} className="text-right">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )
                    }
                    return <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <TablePagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={members.length}
            pageSize={pageSize}
          />
        </DataTable>
      )}

      <Modal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
          setError('')
          setFieldErrors({})
        }}
        title={editing ? 'Ubah Anggota' : 'Tambah Anggota'}
        footer={
          <ModalFooter
            secondaryLabel="Batal"
            onSecondary={() => {
              setModalOpen(false)
              setEditing(null)
              setError('')
              setFieldErrors({})
            }}
            primaryLabel="Simpan"
            onPrimary={() => {}}
            primaryType="submit"
            form="memberForm"
          />
        }
      >
        {error && modalOpen && <ErrorAlert message={error} className="mb-3" />}
        <form id="memberForm" onSubmit={handleSave} className="space-y-4" noValidate>
          <FormField label="Kode Anggota" htmlFor="code" error={fieldErrors.code}>
            <input id="code" name="code" defaultValue={editing?.code || ''} readOnly={!!editing} placeholder="Contoh: A001" required />
          </FormField>
          <FormField label="Nama Lengkap" htmlFor="name" error={fieldErrors.name}>
            <input id="name" name="name" defaultValue={editing?.name || ''} placeholder="Nama anggota" required />
          </FormField>
          <FormField label="NIK (KTP)" htmlFor="nik">
            <input id="nik" name="nik" defaultValue={editing?.nik || ''} placeholder="Nomor KTP" inputMode="numeric" pattern="[0-9]*" />
          </FormField>
          <FormField label="Telepon" htmlFor="phone">
            <input id="phone" name="phone" defaultValue={editing?.phone || ''} placeholder="08xx-xxxx-xxxx" inputMode="tel" />
          </FormField>
          <FormField label="Alamat" htmlFor="address">
            <textarea id="address" name="address" defaultValue={editing?.address || ''} placeholder="Alamat lengkap" rows={3} className="min-h-[72px]" />
          </FormField>
          {editing && (
            <FormField label="Status" htmlFor="status">
              <select id="status" name="status" defaultValue={editing.status}>
                <option value="active">Aktif</option>
                <option value="inactive">Nonaktif</option>
              </select>
            </FormField>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setDeactivatingId(null)
          setError('')
        }}
        onConfirm={handleDeactivate}
        title="Nonaktifkan Anggota?"
        message="Anggota tidak akan muncul di daftar aktif, tetapi riwayat transaksi tetap tersimpan."
        confirmText="Nonaktifkan"
        variant="danger"
      />
    </div>
  )
}
