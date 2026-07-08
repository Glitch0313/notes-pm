import Sidebar from '@/components/layout/Sidebar'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-dark flex min-h-screen bg-slate-950 text-slate-100" dir="rtl">
      <Sidebar />
      <main className="flex-1 overflow-auto min-w-0 px-4 sm:px-6 lg:px-8 py-6">{children}</main>
    </div>
  )
}
