import { useState } from 'react'
import { LogIn, UserPlus, Shield, Sparkles, Lock, User } from 'lucide-react'
import { useSession } from '@/lib/session'

export function AuthScreen() {
  const { login, register } = useSession()
  const [tab, setTab] = useState<'login' | 'register'>('login')

  // Login form state
  const [loginName, setLoginName] = useState('')
  const [loginPin, setLoginPin] = useState('')
  const [loginError, setLoginError] = useState('')
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Register form state
  const [regName, setRegName] = useState('')
  const [regRole, setRegRole] = useState<'siswa' | 'guru_bk'>('siswa')
  const [regGrade, setRegGrade] = useState('')
  const [regPin, setRegPin] = useState('')
  const [regPinConfirm, setRegPinConfirm] = useState('')
  const [regError, setRegError] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError('')

    if (!loginName.trim()) {
      setLoginError('Nama lengkap wajib diisi.')
      return
    }
    if (!loginPin.trim()) {
      setLoginError('PIN akun wajib diisi.')
      return
    }

    setIsLoggingIn(true)
    try {
      await login(loginName.trim(), loginPin.trim())
    } catch (err: any) {
      setLoginError(err?.message || 'Gagal masuk. Periksa kembali nama dan PIN Anda.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegError('')

    if (!regName.trim()) {
      setRegError('Nama lengkap wajib diisi.')
      return
    }
    if (!regGrade.trim()) {
      setRegError(regRole === 'guru_bk' ? 'Jabatan/Bidang wajib diisi.' : 'Kelas wajib diisi.')
      return
    }
    if (!regPin.trim() || regPin.length < 4) {
      setRegError('PIN harus minimal 4 digit.')
      return
    }
    if (regPin !== regPinConfirm) {
      setRegError('Konfirmasi PIN tidak cocok.')
      return
    }

    setIsRegistering(true)
    try {
      await register(regName.trim(), regGrade.trim(), regRole, regPin.trim())
    } catch (err: any) {
      setRegError(err?.message || 'Gagal membuat akun. Silakan coba lagi.')
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="flex flex-1 flex-col justify-between overflow-y-auto px-5 py-8">
      <div>
        {/* Header Branding */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-forest text-2xl font-bold text-paper-warm shadow-md">
            BK
          </div>
          <h1 className="font-display mt-3 text-2xl font-bold tracking-tight text-ink">
            BK Bersama
          </h1>
          <p className="mt-1 text-[13px] text-ink-soft/80">
            Ruang aman berbagi cerita dan bimbingan konseling
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex rounded-full bg-[#efe4cd] p-1 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setTab('login')
              setLoginError('')
            }}
            className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-all ${
              tab === 'login'
                ? 'bg-forest text-paper-warm shadow-sm'
                : 'text-ink-soft/70 hover:text-ink'
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('register')
              setRegError('')
            }}
            className={`flex-1 rounded-full py-2 text-[13px] font-semibold transition-all ${
              tab === 'register'
                ? 'bg-forest text-paper-warm shadow-sm'
                : 'text-ink-soft/70 hover:text-ink'
            }`}
          >
            Daftar Akun
          </button>
        </div>

        {/* Login Form */}
        {tab === 'login' && (
          <form onSubmit={handleLogin} className="mt-5 space-y-3.5">
            {loginError && (
              <div className="rounded-xl border border-rose/30 bg-rose/10 p-3 text-[12.5px] font-medium text-rose">
                {loginError}
              </div>
            )}

            <div>
              <label className="mb-1 block text-[12px] font-semibold text-ink-soft">
                Nama Lengkap
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-ink-soft/40" />
                <input
                  type="text"
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder="Nama akun terdaftar"
                  disabled={isLoggingIn}
                  className="w-full rounded-xl border border-[#e4d7bd] bg-paper-warm pl-10 pr-3.5 py-2.5 text-[14px] text-ink outline-none transition focus:border-forest"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-semibold text-ink-soft">
                PIN Akun (Minimal 4 Angka)
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3.5 h-4 w-4 text-ink-soft/40" />
                <input
                  type="password"
                  inputMode="numeric"
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="PIN Anda"
                  disabled={isLoggingIn}
                  className="w-full rounded-xl border border-[#e4d7bd] bg-paper-warm pl-10 pr-3.5 py-2.5 text-[14px] text-ink outline-none transition focus:border-forest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 text-[14px] font-bold text-paper-warm shadow-[0_2px_0_var(--color-forest-dark)] transition-transform active:scale-[0.99] disabled:opacity-60"
            >
              <LogIn className="h-4 w-4" />
              {isLoggingIn ? 'Memproses Masuk...' : 'Masuk Sekarang'}
            </button>

            <p className="text-center text-[12px] text-ink-soft/70">
              Belum punya akun?{' '}
              <button
                type="button"
                onClick={() => setTab('register')}
                className="font-bold text-forest underline"
              >
                Daftar di sini
              </button>
            </p>
          </form>
        )}

        {/* Register Form */}
        {tab === 'register' && (
          <form onSubmit={handleRegister} className="mt-5 space-y-3">
            {regError && (
              <div className="rounded-xl border border-rose/30 bg-rose/10 p-3 text-[12.5px] font-medium text-rose">
                {regError}
              </div>
            )}

            {/* Role Selection */}
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-ink-soft">
                Peran Pengguna
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setRegRole('siswa')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-[12.5px] font-semibold transition ${
                    regRole === 'siswa'
                      ? 'border-forest bg-forest/10 text-forest-dark font-bold'
                      : 'border-[#e4d7bd] bg-paper-warm text-ink-soft'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Siswa
                </button>
                <button
                  type="button"
                  onClick={() => setRegRole('guru_bk')}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border py-2 text-[12.5px] font-semibold transition ${
                    regRole === 'guru_bk'
                      ? 'border-rose bg-rose/10 text-rose font-bold'
                      : 'border-[#e4d7bd] bg-paper-warm text-ink-soft'
                  }`}
                >
                  <Shield className="h-3.5 w-3.5" />
                  Guru BK
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-semibold text-ink-soft">
                Nama Lengkap
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 h-4 w-4 text-ink-soft/40" />
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Misal: Budi Santoso"
                  disabled={isRegistering}
                  className="w-full rounded-xl border border-[#e4d7bd] bg-paper-warm pl-10 pr-3.5 py-2 text-[13.5px] text-ink outline-none transition focus:border-forest"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[12px] font-semibold text-ink-soft">
                {regRole === 'guru_bk' ? 'Jabatan / Bidang' : 'Kelas / Tingkat'}
              </label>
              <input
                type="text"
                value={regGrade}
                onChange={(e) => setRegGrade(e.target.value)}
                placeholder={regRole === 'guru_bk' ? 'Misal: Guru Pembina BK' : 'Misal: Kelas 11 IPA 2'}
                disabled={isRegistering}
                className="w-full rounded-xl border border-[#e4d7bd] bg-paper-warm px-3.5 py-2 text-[13.5px] text-ink outline-none transition focus:border-forest"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="mb-1 block text-[12px] font-semibold text-ink-soft">
                  PIN (4 Digit)
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={regPin}
                  onChange={(e) => setRegPin(e.target.value)}
                  placeholder="Misal: 1234"
                  disabled={isRegistering}
                  className="w-full rounded-xl border border-[#e4d7bd] bg-paper-warm px-3 py-2 text-[13.5px] text-ink outline-none transition focus:border-forest"
                />
              </div>
              <div>
                <label className="mb-1 block text-[12px] font-semibold text-ink-soft">
                  Ulangi PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  value={regPinConfirm}
                  onChange={(e) => setRegPinConfirm(e.target.value)}
                  placeholder="Ulangi PIN"
                  disabled={isRegistering}
                  className="w-full rounded-xl border border-[#e4d7bd] bg-paper-warm px-3 py-2 text-[13.5px] text-ink outline-none transition focus:border-forest"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isRegistering}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 text-[14px] font-bold text-paper-warm shadow-[0_2px_0_var(--color-forest-dark)] transition-transform active:scale-[0.99] disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              {isRegistering ? 'Mendaftarkan Akun...' : 'Daftar & Masuk'}
            </button>

            <p className="text-center text-[12px] text-ink-soft/70">
              Sudah punya akun?{' '}
              <button
                type="button"
                onClick={() => setTab('login')}
                className="font-bold text-forest underline"
              >
                Masuk di sini
              </button>
            </p>
          </form>
        )}
      </div>

      {/* Safety notice footer */}
      <div className="mt-8 rounded-2xl border border-[#e4d7bd]/60 bg-[#efe4cd]/40 p-3 text-center">
        <p className="text-[11px] leading-relaxed text-ink-soft/80">
          🔒 Ruang konseling dan cerita Anda dijaga kerahasiaannya bersama tim Bimbingan Konseling sekolah.
        </p>
      </div>
    </div>
  )
}
