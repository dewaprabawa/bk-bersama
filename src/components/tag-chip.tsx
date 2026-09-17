import type { Category } from '@/lib/fixtures'

const TAG_STYLES: Record<Category, string> = {
  Akademik: 'bg-[#e4ecdf] text-forest-dark',
  Pertemanan: 'bg-[#f4e2c9] text-terracotta-dark',
  Keluarga: 'bg-[#f0dbdb] text-rose',
  Karier: 'bg-[#dde6ef] text-[#2b4a63]',
  'Kesehatan Mental': 'bg-[#e9ddf0] text-[#5b3a75]',
}

export function TagChip({ tag }: { tag: Category }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${TAG_STYLES[tag]}`}
    >
      {tag}
    </span>
  )
}
