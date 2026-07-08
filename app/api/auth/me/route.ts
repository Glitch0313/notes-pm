// app/api/auth/me/route.ts — التحقق من حالة المصادقة
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: Request) {
  const user = getUserFromRequest(request)

  if (!user) {
    return Response.json({ authenticated: false }, { status: 200 })
  }
  return Response.json({ authenticated: true, userId: user.userId, username: user.username, role: user.role })
}
