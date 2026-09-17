import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'


import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'BK Bersama — Tempat berbagi dan bertumbuh',
      },
      {
        name: 'description',
        content:
          'BK Bersama adalah ruang berbagi cerita untuk siswa dan guru BK — akademik, pertemanan, keluarga, karier, dan kesehatan mental, dirancang mobile-first.',
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <HeadContent />
      </head>
      <body className="min-h-screen">
        <div className="grain-overlay" />
        <main>{children}</main>
        <Scripts />
      </body>
    </html>
  )
}
