// lib/api-handler.ts — معالجة الأخطاء الموحدة لـ Route Handlers
import { Prisma } from '@prisma/client'
import type { ApiResponse } from '@/types'

type RouteHandler = (req: Request, ctx?: any) => Promise<Response>

/**
 * withErrorHandler — wrapper يلتقط أخطاء Prisma والأخطاء العامة
 * ويُعيد استجابات بنمط ApiResponse<T> الموحد
 *
 * أخطاء Prisma المعالَجة:
 *  - P2002 (unique constraint violation) → 409 "سجل مكرر"
 *  - P2025 (record not found)            → 404 "السجل غير موجود"
 * أي خطأ آخر → 500 "خطأ داخلي في الخادم"
 */
export function withErrorHandler(handler: RouteHandler): RouteHandler {
  return async (req: Request, ctx?: any): Promise<Response> => {
    try {
      return await handler(req, ctx)
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          const body: ApiResponse<never> = { success: false, error: 'سجل مكرر', code: 'P2002' }
          return Response.json(body, { status: 409 })
        }
        if (error.code === 'P2025') {
          const body: ApiResponse<never> = { success: false, error: 'السجل غير موجود', code: 'P2025' }
          return Response.json(body, { status: 404 })
        }
      }

      console.error('[API Error]', error)
      const body: ApiResponse<never> = { success: false, error: 'خطأ داخلي في الخادم' }
      return Response.json(body, { status: 500 })
    }
  }
}
