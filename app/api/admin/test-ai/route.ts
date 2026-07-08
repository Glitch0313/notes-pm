import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getUserFromRequest } from '@/lib/auth'

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ success: false, error: 'غير مصرح لك للقيام بهذا الإجراء' }, { status: 401 })
  }

  try {
    const { key, model } = await request.json()
    const apiKey = key || process.env.GEMINI_API_KEY

    if (!apiKey) {
      return NextResponse.json({ success: false, error: 'لم يتم توفير مفتاح API' })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const aiModel = genAI.getGenerativeModel({ model: model || 'gemini-1.5-flash' })
    
    // Test simple generation
    const response = await aiModel.generateContent('Please reply with exactly the word "SUCCESS"')
    const text = response.response.text()

    if (text) {
      return NextResponse.json({ success: true, message: 'Connection successful' })
    }
    
    return NextResponse.json({ success: false, error: 'لم يتم استلام استجابة صالحة' })
  } catch (error: any) {
    console.error('[test-ai]', error)
    return NextResponse.json({ success: false, error: error.message || 'خطأ أثناء الاتصال بالنموذج المختار' })
  }
}
