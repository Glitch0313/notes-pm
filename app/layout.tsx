import type { Metadata, Viewport } from 'next'
import { Cairo } from 'next/font/google'
import './globals.css'

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-cairo',
  display: 'swap',
})

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
const siteName = 'NoteVaultPro'
const siteDescription = 'نظّم أفكارك، اكتب مذكراتك باحترافية، وشاركها مع مجتمع عربي واسع — أو حوّلها إلى مصدر دخل عبر سوق NoteVaultPro المتكامل.'

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: 'NoteVaultPro — منصة إدارة ومشاركة المذكرات',
    template: '%s | NoteVaultPro',
  },
  description: siteDescription,
  keywords: ['مذكرات', 'كتابة', 'سوق', 'NoteVaultPro', 'تدوين', 'محرر نصوص عربي', 'بيع المحتوى', 'منصة عربية'],
  authors: [{ name: 'NoteVaultPro' }],
  creator: 'NoteVaultPro',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'ar_AR',
    url: '/',
    siteName,
    title: 'NoteVaultPro — نظّم أفكارك، وشارك إبداعك',
    description: siteDescription,
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: siteName }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NoteVaultPro — نظّم أفكارك، وشارك إبداعك',
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
}

export const viewport: Viewport = {
  themeColor: '#08080c',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${cairo.variable} font-cairo min-h-screen bg-[#08080c] text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  )
}
