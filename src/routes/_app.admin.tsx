import { createFileRoute, useNavigate, useRouter } from '@tanstack/react-router'
import { useState } from 'react'
import {
  UserPlus,
  Shield,
  Trash2,
  CheckCircle2,
  Sparkles,
  UserCheck,
  HeartHandshake,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'

import { AppTopBar } from '@/components/app-top-bar'
import { useSession } from '@/lib/session'
import { getUsersList, createMember, deleteMember } from '@/server/admin.functions'
import { generateDailyInspirations } from '@/server/inspiration.functions'

export const Route = createFileRoute('/_app/admin')({
  loader: async () => {
    return { users: await getUsersList() }
  },
  component: AdminPage,
})

function AdminPage() {
  const { users } = Route.useLoaderData()
  const router = useRouter()
  const navigate = useNavigate()
  const { activeUser, switchUser, refreshUsers } = useSession()

  // Form state
  const [name, setName] = useState('')
  const [role, setRole] = useState<'siswa' | 'guru_bk'>('siswa')
  const [grade, setGrade] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  // AI Generation state
  const [isGeneratingInspo, setIsGeneratingInspo] = useState(false)
  const [inspoSuccess, setInspoSuccess] = useState(false)

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !grade.trim()) {
      setErrorMsg('Nama dan Kelas/Jabatan wajib diisi.')
      return
    }

    setErrorMsg('')
    setSuccessMsg('')
    setIsSubmitting(true)

    try {
      const newUser = await createMember({
        data: {
          name: name.trim(),
          role,
          grade: grade.trim(),
          phone: phone.trim(),
          bio: bio.trim(),
        },
      })

      setName('')
      setGrade('')
      setPhone('')
      setBio('')
      setSuccessMsg(`Berhasil mendaftarkan ${newUser.name} sebagai ${role === 'guru_bk' ? 'Watcher / Guru BK' : 'Siswa'}.`)

      await refreshUsers()
      await router.invalidate()

      // Auto switch if this is the first user
      if (!activeUser) {
        switchUser(newUser.id)
      }

      setTimeout(() => setSuccessMsg(''), 4000)
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err?.message || 'Gagal mendaftarkan anggota baru.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteMember = async (userId: string, userName: string) => {
    const confirm = window.confirm(`Apakah Anda yakin ingin menghapus akun "${userName}"?`)
    if (!confirm) return

    try {
      await deleteMember({ data: { userId } })
      await refreshUsers()
      await router.invalidate()
    } catch (err: any) {
      alert(err?.message || 'Gagal menghapus anggota.')
    }
  }

  const handleGenerateInspirations = async () => {
    setIsGeneratingInspo(true)
    setInspoSuccess(false)
    try {
      await generateDailyInspirations()
      setInspoSuccess(true)
      setTimeout(() => setInspoSuccess(false), 3500)
    } catch (err: any) {
      alert('Gagal menghasilkan inspirasi: ' + (err?.message || 'Periksa koneksi Groq API.'))
    } finally {
      setIsGeneratingInspo(false)
    }
  }

  return (
    <div className="pb-10">
      <AppTopBar title="Portal Admin & Satgas" subtitle="Kelola pengguna & pengawasan BK" />

      <div className="space-y-5 px-4 py-4">
        {/* Banner Info */}
        <div className="rounded-2xl border border-[#e4d7bd] bg-paper-warm/80 p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-forest/15 text-forest-dark">
              <Shield className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-display text-[15px] font-bold text-ink">Manajemen Anggota Komunitas</h2>
              <p className="mt-0.5 text-[12px] leading-relaxed text-ink-soft">
                Daftarkan siswa atau guru pembimbing (Watcher/Satgas). Akun Watcher memiliki hak khusus melindungi cerita dari bullying dan menghapus komentar kasar.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Groq AI Generation Card */}
        <div className="rounded-2xl border border-amber-600/30 bg-amber-50/80 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-700" />
              <h3 className="font-display text-[14.5px] font-bold text-amber-950">AI Generator Inspirasi Mental</h3>
            </div>
            <button
              onClick={() => navigate({ to: '/inspiration' })}
              className="flex items-center gap-1 text-[11px] font-semibold text-amber-800 hover:underline"
            >
              <span>Buka Menu</span>
              <ExternalLink className="h-3 w-3" />
            </button>
          </div>
          <p className="mt-1 text-[12px] leading-relaxed text-amber-900/80">
            Hasilkan 2 postingan harian otomatis berisi pertolongan mental breakdown, tips grounding, dan motivasi psikologis via Groq AI.
          </p>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={handleGenerateInspirations}
              disabled={isGeneratingInspo}
              className="flex items-center gap-2 rounded-xl bg-amber-700 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-800 active:scale-95 disabled:opacity-60"
            >
              <Sparkles className="h-4 w-4" />
              <span>{isGeneratingInspo ? 'Menghasilkan 2 Postingan...' : 'Generate 2 Inspirasi Hari Ini'}</span>
            </button>
            {inspoSuccess && (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                Berhasil dibuat!
              </span>
            )}
          </div>
        </div>

        {/* Form Tambah Anggota */}
        <div className="rounded-2xl border border-[#e4d7bd] bg-paper-warm p-4 shadow-2xs">
          <div className="flex items-center gap-2 border-b border-[#e4d7bd]/60 pb-3">
            <UserPlus className="h-4.5 w-4.5 text-terracotta" />
            <h3 className="font-display text-[15px] font-bold text-ink">Daftarkan Anggota Baru</h3>
          </div>

          <form onSubmit={handleCreateMember} className="mt-3.5 space-y-3.5">
            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-rose/15 p-2.5 text-xs font-medium text-rose">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/15 p-2.5 text-xs font-medium text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                Peran Pengguna
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('siswa')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
                    role === 'siswa'
                      ? 'border-forest bg-forest text-paper-warm shadow-xs'
                      : 'border-[#e4d7bd] bg-paper text-ink-soft hover:bg-[#efe4cd]'
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  <span>Siswa</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('guru_bk')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-2.5 text-xs font-bold transition ${
                    role === 'guru_bk'
                      ? 'border-rose bg-rose text-white shadow-xs'
                      : 'border-[#e4d7bd] bg-paper text-ink-soft hover:bg-[#efe4cd]'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                  <span>Guru BK / Satgas</span>
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                Nama Lengkap *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={role === 'guru_bk' ? 'Contoh: Ibu Rina Melati, S.Pd' : 'Contoh: Arya Bagus'}
                className="w-full rounded-xl border border-[#e4d7bd] bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:border-forest focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                {role === 'guru_bk' ? 'Jabatan / Tim *' : 'Kelas / Tingkat *'}
              </label>
              <input
                type="text"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder={role === 'guru_bk' ? 'Contoh: Guru BK & Satgas Anti-Perundungan' : 'Contoh: Kelas XI IPS 1'}
                className="w-full rounded-xl border border-[#e4d7bd] bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:border-forest focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  Nomor HP (Opsional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="08123456789"
                  className="w-full rounded-xl border border-[#e4d7bd] bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:border-forest focus:outline-none"
                />
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-bold uppercase tracking-wider text-ink-soft">
                  Catatan Singkat (Bio)
                </label>
                <input
                  type="text"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Siswa atau konselor..."
                  className="w-full rounded-xl border border-[#e4d7bd] bg-paper px-3 py-2 text-sm text-ink placeholder:text-ink-soft/50 focus:border-forest focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-2.5 text-sm font-bold text-paper-warm shadow-[0_3px_0_var(--color-forest-dark)] transition active:translate-y-[2px] active:shadow-none disabled:opacity-60"
            >
              <UserPlus className="h-4 w-4" />
              <span>{isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Anggota'}</span>
            </button>
          </form>
        </div>

        {/* Daftar Anggota Terdaftar */}
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <h3 className="font-display text-[15px] font-bold text-ink">
              Anggota Terdaftar ({users.length})
            </h3>
            {activeUser && (
              <span className="text-[11px] text-ink-soft">
                Aktif: <strong className="text-forest-dark">{activeUser.name}</strong>
              </span>
            )}
          </div>

          {users.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#d8c7a3] bg-paper-warm/60 px-4 py-8 text-center">
              <HeartHandshake className="mx-auto h-7 w-7 text-ink-soft/60" />
              <p className="mt-2 text-sm font-semibold text-ink">Belum ada akun terdaftar</p>
              <p className="mt-0.5 text-xs text-ink-soft">
                Gunakan formulir di atas untuk mendaftarkan Siswa atau Guru BK pertama.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {users.map((u) => {
                const isActive = activeUser?.id === u.id
                const isGuru = u.role === 'guru_bk'

                return (
                  <div
                    key={u.id}
                    className={`rounded-2xl border p-3.5 transition ${
                      isActive
                        ? 'border-forest/50 bg-forest/5 shadow-xs'
                        : 'border-[#e4d7bd] bg-paper-warm'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                              isGuru ? 'bg-rose' : 'bg-forest'
                            }`}
                          >
                            {u.name.charAt(0)}
                          </span>
                          <p className="truncate text-[14px] font-bold text-ink">{u.name}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                              isGuru
                                ? 'border border-rose/30 bg-rose/10 text-rose'
                                : 'border border-forest/30 bg-forest/10 text-forest-dark'
                            }`}
                          >
                            {isGuru ? 'Watcher / Guru BK' : 'Siswa'}
                          </span>
                        </div>

                        <p className="mt-1 text-xs text-ink-soft">
                          {u.grade} {u.phone ? `· ${u.phone}` : ''}
                        </p>
                        {u.bio && (
                          <p className="mt-0.5 line-clamp-1 text-[11px] italic text-ink-soft/70">
                            "{u.bio}"
                          </p>
                        )}
                        <p className="mt-1 text-[10.5px] font-medium text-ink-soft/70">
                          {u.storiesCount} cerita dibagikan
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {isActive ? (
                          <span className="flex items-center gap-1 rounded-full bg-forest px-2.5 py-1 text-[10.5px] font-bold text-paper-warm">
                            <CheckCircle2 className="h-3 w-3" />
                            Sedang Aktif
                          </span>
                        ) : (
                          <button
                            onClick={() => switchUser(u.id)}
                            className="rounded-full border border-forest/30 bg-paper px-2.5 py-1 text-[11px] font-semibold text-forest-dark transition hover:bg-forest hover:text-white"
                          >
                            Pilih Akun Ini
                          </button>
                        )}

                        <button
                          onClick={() => handleDeleteMember(u.id, u.name)}
                          className="flex items-center gap-1 text-[11px] font-medium text-rose/80 hover:text-rose hover:underline"
                        >
                          <Trash2 className="h-3 w-3" />
                          Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
