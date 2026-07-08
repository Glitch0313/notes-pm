import type { Metadata } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'NoteVaultPro',
    template: '%s | NoteVaultPro',
  },
  description: 'منصة احترافية لإدارة المذكرات ومشاركتها وبيعها',
  keywords: ['مذكرات', 'كتابة', 'سوق', 'NoteVaultPro'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo min-h-screen bg-slate-50 text-slate-900 antialiased`}>
        {children}
      </body>
    </html>
  )
}
