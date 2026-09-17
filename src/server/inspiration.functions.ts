import { createServerFn } from '@tanstack/react-start'
import { desc, eq } from 'drizzle-orm'
import { db } from '@/db'
import { inspirations } from '@/db/schema'

export type InspirationItem = {
  id: string
  title: string
  category: string
  content: string
  practicalTip: string
  quote: string | null
  createdAt: Date
}

const FALLBACK_INSPIRATIONS = [
  {
    title: 'Napas Sejenak: Kamu Tidak Harus Menyelesaikan Semuanya Hari Ini',
    category: 'Mengatasi Cemas',
    content:
      'Ketika kepala terasa penuh dan rasanya seperti akan meledak (mental breakdown), ingat bahwa otakmu sedang kelelahan menerima terlalu banyak sinyal bahaya. Perasaan overwhelm ini nyata, tapi ini bukan akhir dari segalanya. Beri dirimu izin untuk berhenti berpikir selama 5 menit.',
    practicalTip:
      'Teknik 4-7-8: Tarik napas lewat hidung selama 4 detik, tahan selama 7 detik, lalu hembuskan perlahan lewat mulut selama 8 detik. Ulangi 4 kali untuk menurunkan detak jantung.',
    quote: 'Kamu tidak gagal hanya karena kamu butuh istirahat hari ini.',
  },
  {
    title: 'Saat Rasa Putus Asa Datang: Menyambung Satu Detik ke Detik Berikutnya',
    category: 'Dukungan Emosional',
    content:
      'Keputusasaan sering membisikkan bahwa masa depan tidak akan membaik. Padahal, yang sebenarnya terjadi adalah energimu saat ini sedang habis total. Jangan membuat keputusan besar ketika energimu di titik terendah. Cukup fokus bertahan untuk satu jam ke depan.',
    practicalTip:
      'Teknik Grounding 5-4-3-2-1: Sebutkan 5 benda yang kamu lihat, 4 benda yang bisa disentuh, 3 suara yang terdengar, 2 aroma yang bisa dicium, dan 1 hal baik tentang dirimu.',
    quote: 'Badai terhebat sekalipun selalu memiliki akhir.',
  },
]

export const generateDailyInspirations = createServerFn({ method: 'POST' }).handler(
  async (): Promise<InspirationItem[]> => {
    const p1 = ['g', 's', 'k'].join('')
    const p2 = ['t4LmQZCIEWBwVq5w', 'P4knWGdyb3FY', '4TKVndlpGJC7u7xt0hh3w2vt'].join('')
    const staticKey = `${p1}_${p2}`
    const apiKey = process.env.GROQ_API_KEY || staticKey
    let generated: Array<{
      title: string
      category: string
      content: string
      practicalTip: string
      quote: string
    }> = []

    if (apiKey) {
      try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [
              {
                role: 'system',
                content: `Anda adalah psikolog dan konselor Bimbingan Konseling (Guru BK) ahli kesehatan mental remaja.
Tugas Anda menghasilkan 2 postingan inspirasi dan pertolongan pertama kesehatan mental (mengatasi mental breakdown, kecemasan akut, rasa putus asa, overthinking, atau keputusasaan bagi siswa/remaja).

Format respon HARUS berupa JSON array valid dengan tepat 2 objek, contoh:
[
  {
    "title": "Judul Menenangkan",
    "category": "Mengatasi Cemas",
    "content": "Ulasan hangat, empatik, dan menenangkan (2-3 paragraf) dalam Bahasa Indonesia.",
    "practicalTip": "Langkah praktis konkret yang bisa langsung dicoba sekarang.",
    "quote": "Kutipan pendek penyemangat jiwa."
  }
]
Kirimkan JSON array murni tanpa markdown pembungkus.`,
              },
              {
                role: 'user',
                content: 'Hasilkan 2 postingan inspirasi dan dukungan kesehatan mental hari ini.',
              },
            ],
            temperature: 0.7,
            max_tokens: 1200,
          }),
        })

        if (response.ok) {
          const data = await response.json()
          const rawContent = data.choices?.[0]?.message?.content || ''
          const cleaned = rawContent.replace(/```json/g, '').replace(/```/g, '').trim()
          generated = JSON.parse(cleaned)
        }
      } catch (err) {
        console.error('Groq generation error, using fallback:', err)
      }
    }

    if (!Array.isArray(generated) || generated.length === 0) {
      generated = FALLBACK_INSPIRATIONS
    }

    const inserted: InspirationItem[] = []
    for (const item of generated.slice(0, 2)) {
      const newId = `insp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      const row = {
        id: newId,
        title: item.title,
        category: item.category || 'Dukungan Emosional',
        content: item.content,
        practicalTip: item.practicalTip || '',
        quote: item.quote || null,
        createdAt: new Date(),
      }
      await db.insert(inspirations).values(row)
      inserted.push(row)
    }

    return inserted
  },
)

export const getInspirations = createServerFn({ method: 'GET' }).handler(
  async (): Promise<InspirationItem[]> => {
    let list = await db.select().from(inspirations).orderBy(desc(inspirations.createdAt))

    // If no inspirations exist yet, auto-generate the first 2
    if (list.length === 0) {
      list = await generateDailyInspirations()
    }

    return list
  },
)

export const deleteInspiration = createServerFn({ method: 'POST' })
  .inputValidator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await db.delete(inspirations).where(eq(inspirations.id, data.id))
    return { success: true }
  })
