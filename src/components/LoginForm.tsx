import { useState } from 'react'
import { useAuthStore } from '../stores/auth'
import { login } from '../lib/authFns'
import { FieldError } from './ui/FieldError'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({})
  const setAuth = useAuthStore((s) => s.setAuth)

  const validate = () => {
    const errors: { username?: string; password?: string } = {}
    if (!username.trim()) errors.username = 'Username wajib diisi'
    if (!password) errors.password = 'Password wajib diisi'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!validate()) return
    setLoading(true)
    try {
      const result = await login({ data: { username, password } })
      setAuth(result.token, result.user)
    } catch (err: any) {
      setError(err?.message || 'Gagal masuk. Silakan coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center px-5 h-screen">
      <div className="w-full max-w-sm card p-6 md:p-8 shadow-sm">
        <div className="text-center mb-8">
          <img src="/logo192.png" alt="Logo Koperasi" className="w-20 h-20 mx-auto mb-4 drop-shadow-sm" />
          <h1 className="text-2xl font-bold text-[var(--color-primary)] tracking-tight">Koperasi</h1>
          <h2 className="text-xl font-bold text-[var(--color-text)]">Simpan Pinjam</h2>
          <p className="text-base text-[var(--color-text-soft)] mt-2 font-medium">Masuk untuk melanjutkan</p>
        </div>

        {error && <div className="mb-6 p-4 rounded-xl bg-[var(--color-danger-light)] text-[var(--color-danger-dark)] font-bold text-sm border border-[var(--color-danger)]/20">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="username">
              Username <span className="text-[var(--color-danger)] ml-0.5">*</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: admin"
              className="text-base"
              required
            />
            <FieldError message={fieldErrors.username} />
          </div>

          <div>
            <label htmlFor="password">
              Password <span className="text-[var(--color-danger)] ml-0.5">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="text-base"
              required
            />
            <FieldError message={fieldErrors.password} />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-3 text-base h-12">
            {loading ? 'Memuat...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-[var(--color-text-soft)] bg-[var(--color-bg-soft)] p-4 rounded-xl">
          <p className="mb-2 font-bold text-[var(--color-text)]">Demo login:</p>
          <p className="font-medium">admin / admin123</p>
          <p className="font-medium mt-1">teller / teller123</p>
        </div>
      </div>
    </div>
  )
}
