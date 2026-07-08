import type { JWTPayload } from '@/types'

export interface AdminActionError {
  error: string
  status: number
}

export function validateAdminAction(
  requester: JWTPayload | null,
  targetId: string
): AdminActionError | null {
  if (!requester) return { error: 'غير مصادق', status: 401 }
  if (requester.role !== 'ADMIN') return { error: 'غير مصرح', status: 403 }
  if (requester.userId === targetId) return { error: 'لا يمكنك تعديل حسابك الخاص', status: 400 }
  return null
}
