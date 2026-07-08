// app/api/ai/assist/route.ts — AI writing assistant powered by Gemini

import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { getUserFromRequest } from '@/lib/auth'
import prisma from '@/lib/prisma'

const VALID_CATEGORIES = ['GENERAL', 'TECHNOLOGY', 'SCIENCE', 'LITERATURE', 'PHILOSOPHY', 'HISTORY', 'ART', 'BUSINESS']

type RegularAction = 'summarize' | 'improve' | 'suggest_tags' | 'suggest_title' | 'expand' | 'translate' | 'review'
type AssistAction = RegularAction | 'autofill'

const REGULAR_PROMPTS: Record<RegularAction, (content: string, title?: string, siteContext?: string) => string> = {
  summarize: (content) =>
    `قم بتلخيص النص التالي في فقرة واحدة موجزة باللغة العربية:\n\n${content}`,

  improve: (content) =>
    `حسّن أسلوب الكتابة في النص التالي مع الحفاظ على المعنى الأصلي. أرجع النص المحسّن فقط بدون تعليقات:\n\n${content}`,

  suggest_tags: (content, title) =>
    `بناءً على عنوان المذكرة "${title || ''}" ومحتواها:\n\n${content}\n\nاقترح من 3 إلى 6 وسوم مناسبة باللغة العربية. أرجع الوسوم فقط مفصولة بفاصلة، بدون رموز # وبدون تعليقات.`,

  suggest_title: (content) =>
    `بناءً على المحتوى التالي، اقترح عنواناً جذاباً ومناسباً باللغة العربية. أرجع العنوان فقط بدون تعليقات:\n\n${content}`,

  expand: (content) =>
    `قم بتوسيع النص التالي وإثرائه بمزيد من التفاصيل والأفكار مع الحفاظ على الأسلوب والمعنى. أرجع النص الموسّع فقط:\n\n${content}`,

  translate: (content) =>
    `ترجم النص التالي إلى اللغة الإنجليزية بأسلوب احترافي:\n\n${content}`,

  review: (content, title, siteContext) =>
    `${siteContext ? `أنت محرر محتوى في منصة "${siteContext}". ` : ''}أنت محرر محتوى محترف. قيّم المقال التالي بعنوان "${title || 'بدون عنوان'}":\n\n${content}\n\nاكتب تقييماً موجزاً يشمل:\n1. مستوى الجودة: (ممتاز / جيد / يحتاج تحسين)\n2. نقاط القوة\n3. نقاط الضعف\n4. توصية: (قبول / رفض / يحتاج تعديل)`,
}



function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
}

function buildAutofillPrompt(topic: string, siteContext?: string): string {
  return `${siteContext ? `أنت كاتب محتوى في منصة "${siteContext}". ` : ''}أنت كاتب محتوى عربي متخصص ومحترف. اكتب مقالاً متكاملاً ومفيداً عن: "${topic}"

أرجع الرد بصيغة JSON صحيحة فقط، بدون أي نص قبله أو بعده، وبدون markdown code blocks:

{
  "title": "عنوان جذاب واحترافي للمقال",
  "content": "محتوى المقال بصيغة HTML احترافية جداً. استخدم: <h2> للعناوين، <p> للفقرات، <ul><li> للقوائم. **هام جداً**: إذا كان المقال تقنياً ويحتوي على أكواد برمجة، ضع الكود داخل <pre><code>...</code></pre> بأسلوب المطورين المحترفين. لا تستخدم Markdown (مثل # أو ##) أبداً.",
  "tags": ["وسم1", "وسم2", "وسم3", "وسم4"],
  "category": "إحدى هذه القيم فقط: GENERAL أو TECHNOLOGY أو SCIENCE أو LITERATURE أو PHILOSOPHY أو HISTORY أو ART أو BUSINESS",
  "imageQuery": "كلمات بالإنجليزية لبحث Unsplash عن صورة مناسبة للموضوع، مثال: artificial intelligence technology"
}

اجعل المحتوى غنياً بالمعلومات ومنظماً بعناوين فرعية وفقرات واضحة.`
}

export async function POST(request: NextRequest) {
  const user = getUserFromRequest(request)
  if (!user) {
    return NextResponse.json({ success: false, error: 'يجب تسجيل الدخول' }, { status: 401 })
  }



  let body: { action: AssistAction; content?: string; title?: string; topic?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ success: false, error: 'بيانات غير صالحة' }, { status: 400 })
  }

  const { action, content, title, topic } = body

  if (!action) {
    return NextResponse.json({ success: false, error: 'الإجراء مطلوب' }, { status: 400 })
  }

  // Fetch site settings
  const settings = await (prisma as any).setting.findMany({
    where: { key: { in: ['site_name', 'site_description', 'gemini_api_key', 'gemini_model'] } }
  })
  const settingsMap: Record<string, string> = {}
  settings.forEach((r: any) => { settingsMap[r.key] = r.value })
  const siteContext = settingsMap.site_name ? `${settingsMap.site_name}${settingsMap.site_description ? ` - ${settingsMap.site_description}` : ''}` : ''

  const apiKey = settingsMap.gemini_api_key || process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json({ success: false, error: 'مفتاح GEMINI_API_KEY غير مُضاف في الإعدادات أو البيئة' }, { status: 503 })
  }

  const genAIClient = new GoogleGenerativeAI(apiKey)
  const currentModelStr = settingsMap.gemini_model || 'gemini-1.5-flash'
  
  const primaryModel = genAIClient.getGenerativeModel({ model: currentModelStr })
  const fallbackModel = genAIClient.getGenerativeModel({ model: 'gemini-2.5-flash' })

  async function generateContentWithFallback(prompt: string) {
    try {
      return await primaryModel.generateContent(prompt)
    } catch (error: any) {
      console.warn('[ai/assist] Primary model failed (possibly high demand), trying fallback:', error.message)
      return await fallbackModel.generateContent(prompt)
    }
  }

  // ── Autofill: generate a full note ──────────────────────────────────────────
  if (action === 'autofill') {
    const resolvedTopic = topic?.trim() || 'موضوع مثير للاهتمام في عالم التقنية والمعرفة'

    try {
      const response = await generateContentWithFallback(buildAutofillPrompt(resolvedTopic, siteContext))
      let raw = response.response.text().trim()

      // Strip markdown code block if Gemini wraps in ```json ... ```
      raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

      const parsed = JSON.parse(raw)

      const category = VALID_CATEGORIES.includes(parsed.category) ? parsed.category : 'GENERAL'

      return NextResponse.json({
        success: true,
        data: {
          action: 'autofill',
          autofill: {
            title: String(parsed.title || '').trim(),
            content: String(parsed.content || '').trim(),
            tags: Array.isArray(parsed.tags) ? parsed.tags.map((t: unknown) => String(t).trim()).filter(Boolean) : [],
            category,
            imageQuery: String(parsed.imageQuery || '').trim(),
          },
        },
      })
    } catch (error: any) {
      console.error('[ai/autofill]', error)
      return NextResponse.json({ success: false, error: 'فشل توليد المذكرة — حاول مرة أخرى' }, { status: 500 })
    }
  }

  // ── Regular actions ──────────────────────────────────────────────────────────
  if (!REGULAR_PROMPTS[action as RegularAction]) {
    return NextResponse.json({ success: false, error: `إجراء غير معروف: ${action}` }, { status: 400 })
  }

  const plainText = content ? stripHtml(content) : ''
  const needsContent = action !== 'suggest_title'
  if (needsContent && plainText.length < 10) {
    return NextResponse.json({ success: false, error: 'المحتوى قصير جداً — اكتب على الأقل جملة أو اثنتين أولاً' }, { status: 400 })
  }

  try {
    const prompt = REGULAR_PROMPTS[action as RegularAction](plainText, title, siteContext)
    const response = await generateContentWithFallback(prompt)
    const result = response.response.text().trim()

    return NextResponse.json({ success: true, data: { result, action } })
  } catch (error: any) {
    console.error('[ai/assist]', error)
    return NextResponse.json({ success: false, error: 'خطأ في الاتصال بخدمة الذكاء الاصطناعي' }, { status: 500 })
  }
}
