import { createFileRoute, useRouter } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import {
  CalendarCheck,
  Clock,
  Send,
  CheckCircle,
  XCircle,
  Hourglass,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
} from 'lucide-react'

import { AppTopBar } from '@/components/app-top-bar'
import { useSession } from '@/lib/session'
import {
  getCounselingRequests,
  createCounselingRequest,
  updateCounselingStatus,
} from '@/server/counseling.functions'

export const Route = createFileRoute('/_app/counseling')({
  loader: async () => {
    return { requests: await getCounselingRequests() }
  },
  component: CounselingPage,
})

type CounselingRequest = {
  id: string
  studentId: string
  studentName: string
  counselorId: string | null
  counselorName: string | null
  topic: string
  message: string
  preferredDate: string
  preferredTime: string
  status: string
  counselorNote: string | null
  createdAt: Date | string
  updatedAt: Date | string
}

type StatusFilter = 'semua' | 'pending' | 'accepted' | 'rejected'

const TOPIC_OPTIONS = [
  'Akademik',
  'Pertemanan',
  'Keluarga',
  'Karier',
  'Kesehatan Mental',
  'Lainnya',
]

function CounselingPage() {
  const { requests: initialRequests } = Route.useLoaderData()
  const router = useRouter()
  const { activeUser, isWatcher, getOrCreateUser } = useSession()

  const [requests, setRequests] = useState<CounselingRequest[]>(initialRequests as CounselingRequest[])
  const [showForm, setShowForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('semua')

  // Form state
  const [topic, setTopic] = useState('Akademik')
  const [message, setMessage] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Refresh when user loads
  useEffect(() => {
    if (!activeUser?.id) return
    getCounselingRequests({
      data: {
        userId: activeUser.id,
        role: activeUser.role,
      },
    }).then((list) => {
      if (list) setRequests(list as CounselingRequest[])
    })
  }, [activeUser?.id, activeUser?.role])

  const filteredRequests =
    statusFilter === 'semua'
      ? requests
      : requests.filter((r) => r.status === statusFilter)

  const handleSubmit = async () => {
    if (isSubmitting) return
    setError('')

    if (!topic || !message.trim()) {
      setError('Topik dan pesan wajib diisi.')
      return
    }
    if (!preferredDate || !preferredTime) {
      setError('Pilih tanggal dan jam konseling.')
      return
    }

    setIsSubmitting(true)
    try {
      const user = await getOrCreateUser()
      const result = await createCounselingRequest({
        data: {
          studentId: user.id,
          studentName: user.name,
          topic,
          message: message.trim(),
          preferredDate,
          preferredTime,
        },
      })
      setRequests((prev) => [result as CounselingRequest, ...prev])
      setShowForm(false)
      setTopic('Akademik')
      setMessage('')
      setPreferredDate('')
      setPreferredTime('')
      await router.invalidate()
    } catch (err: any) {
      setError(err?.message || 'Gagal mengirim request. Coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get today's date as minimum for date picker
  const today = new Date().toISOString().split('T')[0]

  return (
    <div>
      <AppTopBar title="Konseling Privat" subtitle="Buat janji konseling dengan Guru BK" />

      {/* Watcher banner */}
      {isWatcher && (
        <div className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-rose/30 bg-rose/10 px-3 py-2 text-rose">
          <ShieldCheck className="h-4 w-4 shrink-0" />
          <p className="text-[11.5px] font-medium leading-tight">
            <strong>Mode Guru BK:</strong> Kelola permintaan konseling dari siswa di bawah ini.
          </p>
        </div>
      )}

      {/* Filter tabs for Guru BK */}
      {isWatcher && (
        <div className="px-4 pt-4">
          <div className="flex gap-1 rounded-full bg-[#efe4cd] p-1">
            {(
              [
                { key: 'semua', label: 'Semua' },
                { key: 'pending', label: '⏳ Menunggu' },
                { key: 'accepted', label: '✅ Diterima' },
                { key: 'rejected', label: '❌ Ditolak' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex-1 rounded-full py-2 text-[11.5px] font-semibold transition-colors ${
                  statusFilter === tab.key
                    ? 'bg-forest text-paper-warm shadow-sm'
                    : 'text-ink-soft/70'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Request list */}
      <div className="space-y-3 px-4 py-4">
        {filteredRequests.length === 0 ? (
          <EmptyState isWatcher={isWatcher} />
        ) : (
          filteredRequests.map((req) => (
            <RequestCard
              key={req.id}
              request={req}
              isWatcher={isWatcher}
              activeUser={activeUser}
              onStatusChange={async (requestId, status, note) => {
                if (!activeUser) return
                await updateCounselingStatus({
                  data: {
                    requestId,
                    status,
                    counselorNote: note,
                    counselorId: activeUser.id,
                    counselorName: activeUser.name,
                  },
                })
                setRequests((prev) =>
                  prev.map((r) =>
                    r.id === requestId
                      ? {
                          ...r,
                          status,
                          counselorNote: note || null,
                          counselorId: activeUser.id,
                          counselorName: activeUser.name,
                        }
                      : r,
                  ),
                )
              }}
            />
          ))
        )}
      </div>

      {/* Create request button (students only) */}
      {!isWatcher && (
        <div className="px-4 pb-4">
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-forest/30 bg-forest/5 py-3.5 text-[13.5px] font-semibold text-forest-dark transition-colors hover:bg-forest/10"
          >
            <CalendarCheck className="h-4.5 w-4.5" />
            {showForm ? 'Tutup Form' : '+ Buat Janji Konseling'}
          </button>
        </div>
      )}

      {/* Create request form (students only) */}
      {!isWatcher && showForm && (
        <div className="mx-4 mb-6 rounded-2xl border border-[#e4d7bd] bg-paper-warm p-4 shadow-2xs">
          <h3 className="font-display mb-3 text-[15px] font-semibold text-ink">
            📋 Form Janji Konseling
          </h3>

          {error && (
            <div className="mb-3 rounded-xl bg-rose/10 px-3 py-2 text-[12px] font-semibold text-rose">
              {error}
            </div>
          )}

          {/* Topic */}
          <label className="mb-1 block text-[12px] font-semibold text-ink-soft">
            Topik Konseling
          </label>
          <select
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="mb-3 w-full rounded-xl border border-[#e4d7bd] bg-paper px-3 py-2.5 text-[13px] text-ink outline-none focus:border-forest"
          >
            {TOPIC_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {/* Message */}
          <label className="mb-1 block text-[12px] font-semibold text-ink-soft">
            Pesan / Keluhan Singkat
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Ceritakan secara singkat apa yang ingin kamu konsultasikan..."
            className="mb-3 w-full resize-none rounded-xl border border-[#e4d7bd] bg-paper px-3 py-2.5 text-[13px] text-ink outline-none placeholder:text-ink-soft/50 focus:border-forest"
          />

          {/* Date & Time */}
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-ink-soft">
                📅 Tanggal
              </label>
              <input
                type="date"
                value={preferredDate}
                min={today}
                onChange={(e) => setPreferredDate(e.target.value)}
                className="w-full rounded-xl border border-[#e4d7bd] bg-paper px-3 py-2.5 text-[13px] text-ink outline-none focus:border-forest"
              />
            </div>
            <div>
              <label className="mb-1 block text-[12px] font-semibold text-ink-soft">
                🕐 Jam
              </label>
              <input
                type="time"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                className="w-full rounded-xl border border-[#e4d7bd] bg-paper px-3 py-2.5 text-[13px] text-ink outline-none focus:border-forest"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-forest py-3 text-[13.5px] font-semibold text-paper-warm shadow-xs transition-transform active:scale-[0.98] disabled:opacity-50"
          >
            <Send className="h-4 w-4" strokeWidth={2.25} />
            {isSubmitting ? 'Mengirim...' : 'Kirim Permintaan'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ── Request Card ── */

function RequestCard({
  request,
  isWatcher,
  activeUser,
  onStatusChange,
}: {
  request: CounselingRequest
  isWatcher: boolean
  activeUser: any
  onStatusChange: (id: string, status: 'accepted' | 'rejected', note?: string) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [note, setNote] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const statusConfig = {
    pending: {
      icon: <Hourglass className="h-3.5 w-3.5" />,
      label: 'Menunggu',
      color: 'bg-gold/15 text-gold border-gold/30',
    },
    accepted: {
      icon: <CheckCircle className="h-3.5 w-3.5" />,
      label: 'Diterima',
      color: 'bg-forest/10 text-forest-dark border-forest/30',
    },
    rejected: {
      icon: <XCircle className="h-3.5 w-3.5" />,
      label: 'Ditolak',
      color: 'bg-rose/10 text-rose border-rose/30',
    },
  }[request.status] || {
    icon: <Hourglass className="h-3.5 w-3.5" />,
    label: request.status,
    color: 'bg-ink/5 text-ink-soft border-ink/10',
  }

  const formattedDate = (() => {
    try {
      const [y, m, d] = request.preferredDate.split('-')
      const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun',
        'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
      ]
      return `${parseInt(d)} ${months[parseInt(m) - 1]} ${y}`
    } catch {
      return request.preferredDate
    }
  })()

  const handleAction = async (status: 'accepted' | 'rejected') => {
    setIsUpdating(true)
    try {
      await onStatusChange(request.id, status, note)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="rise-in rounded-2xl border border-[#e4d7bd] bg-paper-warm p-4 shadow-[0_2px_0_#e4d7bd]">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[12px] font-bold text-white"
              style={{ backgroundColor: `hsl(${request.studentName.charCodeAt(0) * 7} 38% 42%)` }}
            >
              {request.studentName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="truncate text-[13.5px] font-bold text-ink">{request.studentName}</p>
              <p className="text-[11px] text-ink-soft/60">
                {formattedDate} • {request.preferredTime}
              </p>
            </div>
          </div>
        </div>
        <span
          className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${statusConfig.color}`}
        >
          {statusConfig.icon}
          {statusConfig.label}
        </span>
      </div>

      {/* Topic chip */}
      <div className="mt-2.5">
        <span className="inline-flex items-center rounded-full bg-[#e4ecdf] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-forest-dark">
          {request.topic}
        </span>
      </div>

      {/* Message */}
      <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{request.message}</p>

      {/* Counselor note (if any) */}
      {request.counselorNote && (
        <div className="mt-2.5 rounded-xl border border-forest/20 bg-forest/5 px-3 py-2">
          <p className="text-[11px] font-semibold text-forest-dark">
            💬 Catatan dari {request.counselorName || 'Guru BK'}:
          </p>
          <p className="mt-0.5 text-[12.5px] leading-relaxed text-ink-soft">
            {request.counselorNote}
          </p>
        </div>
      )}

      {/* Action buttons for Guru BK on pending requests */}
      {isWatcher && request.status === 'pending' && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center justify-center gap-1 text-[12px] font-semibold text-forest-dark"
          >
            {expanded ? (
              <>
                Tutup <ChevronUp className="h-3.5 w-3.5" />
              </>
            ) : (
              <>
                Tanggapi Permintaan <ChevronDown className="h-3.5 w-3.5" />
              </>
            )}
          </button>

          {expanded && (
            <div className="mt-2.5 space-y-2.5">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                placeholder="Catatan opsional untuk siswa (tempat, ruangan, dll.)..."
                className="w-full resize-none rounded-xl border border-[#e4d7bd] bg-paper px-3 py-2 text-[12.5px] text-ink outline-none placeholder:text-ink-soft/50 focus:border-forest"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleAction('accepted')}
                  disabled={isUpdating}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-forest py-2.5 text-[12.5px] font-semibold text-paper-warm shadow-xs transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Terima
                </button>
                <button
                  onClick={() => handleAction('rejected')}
                  disabled={isUpdating}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose/30 bg-rose/10 py-2.5 text-[12.5px] font-semibold text-rose transition-transform active:scale-[0.98] disabled:opacity-50"
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Tolak
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

/* ── Empty State ── */

function EmptyState({ isWatcher }: { isWatcher: boolean }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#d8c7a3] bg-paper-warm/60 px-6 py-10 text-center">
      <CalendarCheck className="mx-auto h-6 w-6 text-terracotta" strokeWidth={2} />
      <p className="font-display mt-3 text-[15px] font-semibold text-ink">
        {isWatcher ? 'Belum ada permintaan konseling' : 'Belum ada janji konseling'}
      </p>
      <p className="mt-1 text-[13px] text-ink-soft/80">
        {isWatcher
          ? 'Permintaan konseling dari siswa akan muncul di sini. Kamu bisa menerima atau menolaknya.'
          : 'Kamu bisa membuat janji konseling privat dengan Guru BK lewat tombol di bawah. Semuanya rahasia dan aman.'}
      </p>
    </div>
  )
}
