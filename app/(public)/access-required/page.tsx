import Link from 'next/link'

export default function AccessRequiredPage() {
  return (
    <div dir="rtl" className="min-h-[80vh] flex items-center justify-center bg-[#f8f9ff] px-4">
      <div className="text-center max-w-md">

        {/* رقم شبه 404 */}
        <p className="text-[120px] font-black leading-none text-indigo-100 select-none">
          🔒
        </p>

        <h1 className="text-2xl font-black text-gray-900 mt-2 mb-3">
          هذا المحتوى للأعضاء فقط
        </h1>

        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          لقراءة هذه المذكرة والوصول إلى كامل المحتوى،
          <br />
          يلزمك تسجيل الدخول أو إنشاء حساب مجاناً.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/register"
            className="px-8 py-3 bg-gradient-to-l from-indigo-500 to-violet-500 text-white font-bold rounded-2xl hover:opacity-90 transition shadow-lg shadow-indigo-200 text-sm"
          >
            إنشاء حساب مجاناً
          </Link>
          <Link
            href="/login"
            className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition text-sm"
          >
            تسجيل الدخول
          </Link>
        </div>

        <Link
          href="/"
          className="inline-block mt-6 text-xs text-gray-400 hover:text-indigo-500 transition-colors"
        >
          ← العودة للرئيسية
        </Link>
      </div>
    </div>
  )
}
