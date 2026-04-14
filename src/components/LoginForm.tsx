import { useState } from 'react'
import { useAuthStore } from '../stores/auth'
import { login } from '../lib/authFns'
import { FieldError } from './ui/FieldError'
import { Eye, EyeOff } from 'lucide-react'

export function LoginForm() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
    <div className="flex items-center justify-center px-5 min-h-screen bg-[var(--color-bg-soft)]">
      <div className="w-full max-w-sm card p-8 md:p-10 shadow-xl border-[var(--color-border)]">
        <div className="text-center mb-10">
          <div className="inline-flex p-4 rounded-2xl bg-white shadow-sm border border-[var(--color-border)] mb-6">
            <img src="/logo192.png" alt="Logo Koperasi" className="w-16 h-16 mx-auto" />
          </div>
          <h1 className="text-2xl font-extrabold text-[var(--color-primary)] tracking-tighter uppercase">Koperasi</h1>
          <h2 className="text-xl font-bold text-[var(--color-text)] tracking-tight">Simpan Pinjam</h2>
          <p className="text-sm text-[var(--color-text-soft)] mt-3 font-semibold uppercase tracking-wider">Silakan Masuk Akun</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--color-danger-light)] text-[var(--color-danger)] font-bold text-sm border border-[var(--color-danger)]/20 animate-in shake-1 duration-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div>
            <label htmlFor="username" className="text-[11px]">
              Username <span className="text-[var(--color-danger)] ml-0.5">*</span>
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Contoh: admin"
              className="text-sm font-semibold"
              required
            />
            <FieldError message={fieldErrors.username} />
          </div>

          <div>
            <label htmlFor="password" title="Password wajib diisi" className="text-[11px]">
              Password <span className="text-[var(--color-danger)] ml-0.5">*</span>
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="text-sm font-semibold pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-[var(--color-text-soft)] hover:text-[var(--color-text)] transition-colors"
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4 stroke-[2.5px]" /> : <Eye className="w-4 h-4 stroke-[2.5px]" />}
              </button>
            </div>
            <FieldError message={fieldErrors.password} />
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary w-full mt-4 text-sm font-extrabold uppercase tracking-widest h-12 shadow-lg shadow-[var(--color-primary)]/20"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <span className="spinner spinner-white w-5 h-5" /> MEMUAT...
              </span>
            ) : (
              'MASUK SEKARANG'
            )}
          </button>
        </form>

        <div className="mt-10 text-center text-[11px] text-[var(--color-text-soft)] bg-[var(--color-bg-soft)] p-5 rounded-xl border border-[var(--color-border)]">
          <p className="mb-2 font-extrabold text-[var(--color-text)] uppercase tracking-widest">Akses Demo:</p>
          <div className="flex justify-center gap-4 font-bold">
            <span className="text-[var(--color-primary)]">admin / admin123</span>
          </div>
          <div className="flex justify-center gap-4 font-bold mt-1">
            <span className="text-[var(--color-primary)]">teller / teller123</span>
          </div>
        </div>
      </div>
    </div>
  )
}
