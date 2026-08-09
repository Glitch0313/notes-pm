import type { Metadata } from 'next'
import Sidebar from '@/components/layout/Sidebar'
import MobileAppHeader from '@/components/layout/MobileAppHeader'
import MobileBottomBar from '@/components/layout/MobileBottomBar'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-dark flex min-h-screen bg-slate-950 text-slate-100 relative" dir="rtl">
      <Sidebar />
      <MobileAppHeader />
      <main className="flex-1 overflow-auto min-w-0 px-4 sm:px-6 lg:px-8 pt-16 pb-24 md:py-6 md:pb-6">{children}</main>
      <MobileBottomBar />
    </div>
  )
}
