import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { Camera, Check, ShieldCheck, UserPlus } from 'lucide-react'

import { AppTopBar } from '@/components/app-top-bar'
import { useSession } from '@/lib/session'
import { getProfile, updateProfile } from '@/server/profile.functions'

export const Route = createFileRoute('/_app/profile')({
  loader: async () => {
    return await getProfile()
  },
  component: ProfilePage,
})

function ProfilePage() {
  const initialData = Route.useLoaderData()
  const router = useRouter()
  const { activeUser, isWatcher, updateActiveUser } = useSession()

  const [profileData, setProfileData] = useState(initialData)
  const [name, setName] = useState(initialData?.user?.name || '')
  const [grade, setGrade] = useState(initialData?.user?.grade || '')
  const [address, setAddress] = useState(initialData?.user?.address || '')
  const [phone, setPhone] = useState(initialData?.user?.phone || '')
  const [bio, setBio] = useState(initialData?.user?.bio || '')
  const [photo, setPhoto] = useState<string | null>(initialData?.user?.avatarUrl || null)
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // When active user changes, load their profile
  useEffect(() => {
    if (!activeUser?.id) return
    getProfile({ data: { userId: activeUser.id } }).then((data) => {
      setProfileData(data)
      if (data?.user) {
        setName(data.user.name || '')
        setGrade(data.user.grade || '')
        setAddress(data.user.address || '')
        setPhone(data.user.phone || '')
        setBio(data.user.bio || '')
        setPhoto(data.user.avatarUrl || null)
      }
    })
  }, [activeUser?.id])

  const handlePhoto = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPhoto(reader.result as string)
    reader.readAsDataURL(file)
  }

  const save = async () => {
    if (!activeUser?.id) return
    setIsSaving(true)
    try {
      await updateProfile({
        data: {
          userId: activeUser.id,
          name,
          grade,
          address,
          phone,
          bio,
          avatarUrl: photo,
        },
      })
      updateActiveUser({ name, grade, address, phone, bio })
      setSaved(true)
      await router.invalidate()
      setTimeout(() => setSaved(false), 2200)
    } finally {
      setIsSaving(false)
    }
  }

  if (!activeUser) {
    return (
      <div>
        <AppTopBar title="Profil Pengguna" subtitle="Pengaturan identitas" />
        <div className="px-4 py-8">
          <div className="rounded-2xl border border-dashed border-[#d8c7a3] bg-paper-warm/80 p-6 text-center">
            <UserPlus className="mx-auto h-10 w-10 text-forest-dark" />
            <h2 className="font-display mt-3 text-lg font-bold text-ink">Memuat Profil...</h2>
            <p className="mt-1 text-sm text-ink-soft">
              Sedang menyiapkan akun tunggal perangkat Anda.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <AppTopBar title="Profil Saya" subtitle="Data untuk guru BK dan komunitas" />

      {/* Permanent Single Account Badge */}
      <div className="mx-4 mt-3 flex items-center justify-between rounded-2xl border border-[#e4d7bd] bg-paper-warm p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-forest/15 text-forest-dark">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-[11.5px] font-bold text-ink">Akun Permanen Perangkat</p>
            <p className="text-[10.5px] text-ink-soft">1 Orang · 1 Akun (Tidak dapat berganti akun)</p>
          </div>
        </div>
        <span className="rounded-full bg-forest/10 px-2.5 py-1 text-[10px] font-bold text-forest-dark">
          Terkunci
        </span>
      </div>

      <div className="flex flex-col items-center px-4 pt-4">
        <label className="relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-forest text-2xl font-bold text-paper-warm shadow-xs">
          {photo ? (
            <img src={photo} alt="Foto profil" className="h-full w-full object-cover" />
          ) : (
            name ? name.charAt(0).toUpperCase() : '?'
          )}
          <span className="absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full bg-terracotta text-white">
            <Camera className="h-3.5 w-3.5" strokeWidth={2.5} />
          </span>
          <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
        </label>
        <div className="mt-2 flex items-center gap-1.5">
          <p className="font-display text-[17px] font-semibold text-ink">{name || 'Tanpa Nama'}</p>
          {isWatcher && (
            <span className="rounded-full bg-rose/15 px-2 py-0.5 text-[10px] font-bold text-rose">
              Guru BK / Watcher
            </span>
          )}
        </div>
        <p className="text-xs text-ink-soft/70">{profileData?.joinedLabel || 'Baru bergabung'}</p>

        <div className="mt-4 flex w-full gap-2">
          <StatCard label="Cerita" value={profileData?.storiesCount || 0} />
          <StatCard label="Suka diterima" value={profileData?.likesReceived || 0} />
        </div>
      </div>

      <div className="space-y-4 px-4 py-5">
        <Field label="Nama lengkap">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="w-full rounded-xl border border-[#e4d7bd] bg-paper-warm px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-forest"
          />
        </Field>

        <Field label={isWatcher ? 'Peran / Jabatan' : 'Kelas'}>
          <input
            value={grade}
            onChange={(event) => setGrade(event.target.value)}
            className="w-full rounded-xl border border-[#e4d7bd] bg-paper-warm px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-forest"
          />
        </Field>

        <Field label={isWatcher ? 'Lokasi Ruangan' : 'Alamat'}>
          <input
            value={address}
            onChange={(event) => setAddress(event.target.value)}
            className="w-full rounded-xl border border-[#e4d7bd] bg-paper-warm px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-forest"
          />
        </Field>

        <Field label="Nomor HP">
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="w-full rounded-xl border border-[#e4d7bd] bg-paper-warm px-3.5 py-2.5 text-[14px] text-ink outline-none focus:border-forest"
          />
        </Field>

        <Field label="Tentang saya">
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-xl border border-[#e4d7bd] bg-paper-warm px-3.5 py-2.5 text-[14px] leading-relaxed text-ink outline-none focus:border-forest"
          />
        </Field>

        <button
          onClick={save}
          disabled={isSaving}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-forest py-3 text-[14.5px] font-bold text-paper-warm shadow-[0_3px_0_var(--color-forest-dark)] transition-transform active:translate-y-[2px] active:shadow-none disabled:opacity-60"
        >
          {isSaving ? (
            'Menyimpan...'
          ) : saved ? (
            <>
              <Check className="h-4 w-4" strokeWidth={2.5} /> Tersimpan
            </>
          ) : (
            'Simpan Perubahan'
          )}
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex-1 rounded-xl bg-paper-warm px-3 py-2.5 text-center">
      <p className="font-display text-[19px] font-semibold text-forest-dark">{value}</p>
      <p className="text-[11px] font-medium text-ink-soft/70">{label}</p>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[12.5px] font-semibold uppercase tracking-wide text-ink-soft/70">
        {label}
      </span>
      {children}
    </label>
  )
}
