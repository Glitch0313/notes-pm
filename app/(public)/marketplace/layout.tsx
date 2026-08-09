import type { Metadata } from 'next'

const title = 'السوق العام — تصفح مذكرات المجتمع'
const description = 'استكشف مئات المذكرات المنشورة من كتّاب المجتمع في NoteVaultPro، صنّفها حسب التصنيف، وحمّل أو اشترِ ما يعجبك.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/marketplace' },
  openGraph: {
    title: `${title} | NoteVaultPro`,
    description,
    url: '/marketplace',
  },
}

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return children
}
