import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4" dir="rtl">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-indigo-600 mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">الصفحة غير موجودة</h1>
        <p className="text-gray-500 mb-8 text-sm">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها.
        </p>
        <div className="flex gap-3 justify-center">
          <Link
            href="/dashboard"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            الرئيسية
          </Link>
          <Link
            href="/marketplace"
            className="bg-white hover:bg-gray-50 text-gray-700 font-medium px-5 py-2.5 rounded-lg text-sm border border-gray-300 transition-colors"
          >
            تصفح المذكرات
          </Link>
        </div>
      </div>
    </div>
  )
}
