export type Category =
  | 'Akademik'
  | 'Pertemanan'
  | 'Keluarga'
  | 'Karier'
  | 'Kesehatan Mental'

export type Comment = {
  id: string
  author: string
  authorId?: string | null
  timeAgo: string
  text: string
  canDelete?: boolean
}

export type Story = {
  id: string
  author: string
  authorId?: string | null
  isAnonymous: boolean
  grade: string
  avatarLetter: string
  avatarHue: number
  timeAgo: string
  title: string
  excerpt: string
  content: string[]
  tag: Category
  likes: number
  mine: boolean
  isProtected?: boolean
  canDelete?: boolean
  comments: Comment[]
}

export const currentUser = {
  name: 'Ratna Ayu Wulandari',
  grade: 'Kelas 11 IPA 2',
  address: 'Jl. Kenanga No. 14, Sleman, Yogyakarta',
  phone: '0821-3456-7781',
  bio: 'Suka menulis jurnal tiap malam sebelum tidur. Masih belajar berani bicara di kelas.',
  storiesCount: 6,
  likesReceived: 214,
  joinedLabel: 'Bergabung Agustus 2025',
}

export const stories: Story[] = [
  {
    id: 'cerita-1',
    author: 'Anonim',
    isAnonymous: true,
    grade: 'Kelas 12 IPS 1',
    avatarLetter: '?',
    avatarHue: 28,
    timeAgo: '2 jam lalu',
    title: 'Takut mengecewakan orang tua soal jurusan kuliah',
    excerpt:
      'Aku diterima di jurusan yang aku mau, tapi orang tuaku diam-diam kecewa. Sampai sekarang aku bingung harus ikut kata siapa.',
    content: [
      'Sejak kelas 10 aku sudah tahu mau ambil Desain Komunikasi Visual. Tapi bapak selalu bilang "cari yang jelas kerjanya" tiap kali topik ini muncul di meja makan.',
      'Minggu lalu pengumuman SNBP keluar dan aku lolos di jurusan yang aku mau. Seharusnya senang, tapi bapak cuma manggut-manggut lalu masuk kamar. Ibu bilang bapak butuh waktu.',
      'Aku nggak tahu harus gimana. Rasanya prestasi ini malah jadi beban baru di rumah.',
    ],
    tag: 'Keluarga',
    likes: 47,
    mine: false,
    comments: [
      {
        id: 'c1',
        author: 'Kak Dinda (Guru BK)',
        timeAgo: '1 jam lalu',
        text: 'Terima kasih sudah berani cerita. Boleh kita ngobrol pelan-pelan soal ini pas jam bimbingan besok? Nggak perlu diselesaikan sendirian.',
      },
      {
        id: 'c2',
        author: 'Bimo S.',
        timeAgo: '38 menit lalu',
        text: 'Aku juga ngalamin ini pas ambil jurusan seni. Lama-lama orang tua luluh kok kalau kita konsisten nunjukin progres.',
      },
    ],
  },
  {
    id: 'cerita-2',
    author: 'Galih Nararya P.',
    isAnonymous: false,
    grade: 'Kelas 10 IPA 3',
    avatarLetter: 'G',
    avatarHue: 152,
    timeAgo: '5 jam lalu',
    title: 'Akhirnya berani duduk sebangku sama teman baru',
    excerpt:
      'Tiga minggu pertama sekolah aku selalu makan siang sendirian di kantin belakang. Hari ini akhirnya ada yang nyapa duluan.',
    content: [
      'Pindahan dari Bandung ke Jogja bikin aku kehilangan semua circle lama. Tiga minggu pertama rasanya berat banget, tiap istirahat cuma scroll HP di kantin belakang biar nggak keliatan sendirian.',
      'Hari ini pas lagi antre di kantin, ada anak dari kelas sebelah namanya Rangga nawarin duduk bareng karena kursi lain penuh. Ngobrol soal game doang tapi rasanya lega banget.',
      'Kecil sih kelihatannya, tapi buat aku ini kemajuan besar minggu ini.',
    ],
    tag: 'Pertemanan',
    likes: 89,
    mine: true,
    comments: [
      {
        id: 'c3',
        author: 'Salsa F.',
        timeAgo: '4 jam lalu',
        text: 'Selamat ya! Circle baru itu suka datang dari momen kecil kok, bukan usaha besar-besaran.',
      },
    ],
  },
  {
    id: 'cerita-3',
    author: 'Anonim',
    isAnonymous: true,
    grade: 'Kelas 12 IPA 1',
    avatarLetter: '?',
    avatarHue: 340,
    timeAgo: '1 hari lalu',
    title: 'Insomnia tiap mendekati try out',
    excerpt:
      'Dua minggu sebelum try out aku selalu tidur jam 2 pagi karena kepala penuh angka-angka nilai. Ada yang ngalamin sama?',
    content: [
      'Setiap kali mendekati try out, otakku otomatis muter itungan skor terus sampai jam 2 pagi. Padahal udah coba matiin lampu dari jam 10.',
      'Efeknya besoknya jadi gampang emosi ke adik dan susah fokus di kelas. Orang tua cuma bilang "jangan mikir berat-berat" tapi ya nggak semudah itu.',
      'Aku sadar ini nggak sehat tapi nggak tahu cara berhentinya.',
    ],
    tag: 'Kesehatan Mental',
    likes: 132,
    mine: false,
    comments: [
      {
        id: 'c4',
        author: 'Kak Dinda (Guru BK)',
        timeAgo: '20 jam lalu',
        text: 'Ini pola yang banyak dialami kelas 12 menjelang try out. Coba mulai catat kekhawatiran di kertas sebelum tidur — kadang otak berhenti mengulang kalau sudah "dikeluarkan". Yuk lanjut cerita di ruang konseling.',
      },
      {
        id: 'c5',
        author: 'Wisnu A.',
        timeAgo: '15 jam lalu',
        text: 'Sama, aku pakai musik hujan pelan sebelum tidur, agak membantu sih.',
      },
    ],
  },
  {
    id: 'cerita-4',
    author: 'Anggun Larasati',
    isAnonymous: false,
    grade: 'Kelas 11 IPS 2',
    avatarLetter: 'A',
    avatarHue: 205,
    timeAgo: '1 hari lalu',
    title: 'Bingung pilih ekskul atau fokus akademik saja',
    excerpt:
      'Nilai matematikaku turun sejak ikut ekskul tari. Tapi ekskul ini satu-satunya hal yang bikin aku semangat ke sekolah.',
    content: [
      'Nilai PTS Matematika turun dari 82 ke 68 semester ini. Wali kelas nyaranin berhenti dulu dari ekskul tari sampai nilai stabil.',
      'Tapi jujur, latihan tari tiap Selasa-Kamis itu satu-satunya alasan aku masih semangat bangun pagi buat sekolah. Kalau berhenti, aku takut kehilangan itu juga.',
      'Sekarang aku coba atur ulang jadwal belajar malam biar dua-duanya bisa jalan.',
    ],
    tag: 'Akademik',
    likes: 61,
    mine: true,
    comments: [],
  },
  {
    id: 'cerita-5',
    author: 'Anonim',
    isAnonymous: true,
    grade: 'Kelas 10 IPS 1',
    avatarLetter: '?',
    avatarHue: 40,
    timeAgo: '2 hari lalu',
    title: 'Belum tahu mau jadi apa setelah SMA',
    excerpt:
      'Semua teman sekelas udah punya rencana kuliah, aku masih kosong. Rasanya ketinggalan sendiri.',
    content: [
      'Di grup kelas semua udah bahas target kampus masing-masing. Ada yang mau kedokteran, ada yang teknik, ada yang bisnis.',
      'Aku sendiri belum kebayang mau jadi apa. Bukan males, tapi beneran nggak tahu apa yang aku suka selain main musik pas weekend.',
      'Kadang takut dianggap nggak serius sama teman-teman padahal aku juga pengen punya arah yang jelas.',
    ],
    tag: 'Karier',
    likes: 74,
    mine: false,
    comments: [
      {
        id: 'c6',
        author: 'Kak Dinda (Guru BK)',
        timeAgo: '1 hari lalu',
        text: 'Belum tahu itu wajar banget di kelas 10, bukan ketinggalan. Yuk kita coba tes penjajakan minat pas sesi bimbingan klasikal minggu depan.',
      },
    ],
  },
  {
    id: 'cerita-6',
    author: 'Reza Firmansyah',
    isAnonymous: false,
    grade: 'Kelas 12 IPA 4',
    avatarLetter: 'R',
    avatarHue: 265,
    timeAgo: '3 hari lalu',
    title: 'Rekonsiliasi dengan sahabat setelah 4 bulan diam',
    excerpt:
      'Kami berantem gara-gara salah paham soal grup tugas. Minggu ini akhirnya kami ngobrol lagi setelah 4 bulan saling diemin.',
    content: [
      'April lalu aku dan Fajar berantem gara-gara dia ngerasa aku nggak bagi tugas kelompok dengan adil. Sejak itu kami saling diemin, bahkan pas satu meja di kelas.',
      'Minggu ini pas acara perpisahan panitia OSIS, kami kebetulan ditugaskan bareng lagi. Awalnya kaku, tapi akhirnya kami ngobrol jujur soal apa yang bikin sakit hati waktu itu.',
      'Nggak semua langsung normal, tapi setidaknya sekarang kami udah bisa saling sapa lagi.',
    ],
    tag: 'Pertemanan',
    likes: 103,
    mine: true,
    comments: [
      {
        id: 'c7',
        author: 'Kak Dinda (Guru BK)',
        timeAgo: '2 hari lalu',
        text: 'Bagus sekali beraninya mengambil langkah pertama untuk ngobrol jujur. Itu bukan hal kecil.',
      },
    ],
  },
]

export const categories: Category[] = [
  'Akademik',
  'Pertemanan',
  'Keluarga',
  'Karier',
  'Kesehatan Mental',
]

export function findStory(id: string) {
  return stories.find((story) => story.id === id)
}
