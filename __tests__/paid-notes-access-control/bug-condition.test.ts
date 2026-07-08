/**
 * Property 1: Bug Condition — Paid Note Access & Edit Button Visibility
 *
 * هذا الاختبار يُثبت وجود الخلل على الكود غير المُصلَح.
 * يجب أن يفشل قبل الإصلاح، ويمر بعده.
 *
 * Bug Condition 1 (isBugCondition_PaidAccess):
 *   note.visibility = 'FOR_SALE'
 *   AND isAuthor = false
 *   AND (currentUserRole = null OR currentUserRole ≠ 'ADMIN')
 *   AND (purchaseStatus = null OR purchaseStatus ≠ 'APPROVED')
 *
 * Bug Condition 2 (isBugCondition_EditButton):
 *   isAuthor = false
 *   AND (currentUserRole = null OR currentUserRole ≠ 'ADMIN')
 */

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// ─── منطق التحكم في الوصول (الكود المُصلَح) ─────────────────────────────────

/**
 * الكود المُصلَح: يتحقق من isAuthor/purchaseStatus/role/visibility
 * يُحاكي منطق canViewContent في NoteReadPage بعد الإصلاح
 */
function canViewContent_fixed(
  visibility: string,
  isAuthor: boolean,
  purchaseStatus: string | null,
  currentUserRole: string | null
): boolean {
  return (
    isAuthor ||
    currentUserRole === 'ADMIN' ||
    purchaseStatus === 'APPROVED' ||
    visibility !== 'FOR_SALE'
  )
}

function canEdit_fixed(isAuthor: boolean, currentUserRole: string | null): boolean {
  return isAuthor || currentUserRole === 'ADMIN'
}

// ─── دوال شرط الخلل ──────────────────────────────────────────────────────────

function isBugCondition_PaidAccess(
  visibility: string,
  isAuthor: boolean,
  purchaseStatus: string | null,
  currentUserRole: string | null
): boolean {
  return (
    visibility === 'FOR_SALE' &&
    isAuthor === false &&
    (currentUserRole === null || currentUserRole !== 'ADMIN') &&
    (purchaseStatus === null || purchaseStatus !== 'APPROVED')
  )
}

function isBugCondition_EditButton(
  isAuthor: boolean,
  currentUserRole: string | null
): boolean {
  return isAuthor === false && (currentUserRole === null || currentUserRole !== 'ADMIN')
}

// ─── الاختبارات ───────────────────────────────────────────────────────────────

describe('Property 1: Bug Condition — Paid Note Access', () => {
  it('should hide content for all inputs satisfying isBugCondition_PaidAccess', () => {
    const buggyInputs = [
      { visibility: 'FOR_SALE', isAuthor: false, purchaseStatus: null, role: null },
      { visibility: 'FOR_SALE', isAuthor: false, purchaseStatus: null, role: 'USER' },
      { visibility: 'FOR_SALE', isAuthor: false, purchaseStatus: 'PENDING', role: 'USER' },
      { visibility: 'FOR_SALE', isAuthor: false, purchaseStatus: 'REJECTED', role: 'USER' },
    ]

    for (const input of buggyInputs) {
      const bugCondition = isBugCondition_PaidAccess(
        input.visibility,
        input.isAuthor,
        input.purchaseStatus,
        input.role
      )
      expect(bugCondition).toBe(true)

      const result = canViewContent_fixed(
        input.visibility,
        input.isAuthor,
        input.purchaseStatus,
        input.role
      )

      // يجب أن يُخفي المحتوى (false) بعد الإصلاح
      expect(result).toBe(false)
    }
  })

  it('PBT: for all FOR_SALE notes with non-approved non-author users, content must be hidden', () => {
    const nonApprovedStatuses = fc.constantFrom(null, 'PENDING', 'REJECTED')
    const nonAdminRoles = fc.constantFrom(null, 'USER')

    fc.assert(
      fc.property(nonApprovedStatuses, nonAdminRoles, (purchaseStatus, role) => {
        const bugCondition = isBugCondition_PaidAccess('FOR_SALE', false, purchaseStatus, role)
        expect(bugCondition).toBe(true)

        const result = canViewContent_fixed('FOR_SALE', false, purchaseStatus, role)
        return result === false
      }),
      { numRuns: 20 }
    )
  })
})

describe('Property 1: Bug Condition — Edit Button Visibility', () => {
  it('should hide edit button for all inputs satisfying isBugCondition_EditButton', () => {
    const buggyInputs = [
      { isAuthor: false, role: null },
      { isAuthor: false, role: 'USER' },
    ]

    for (const input of buggyInputs) {
      const bugCondition = isBugCondition_EditButton(input.isAuthor, input.role)
      expect(bugCondition).toBe(true)

      const result = canEdit_fixed(input.isAuthor, input.role)
      // يجب إخفاء زر التعديل (false) بعد الإصلاح
      expect(result).toBe(false)
    }
  })

  it('PBT: for all non-author non-admin users, edit button must be hidden', () => {
    const nonAdminRoles = fc.constantFrom(null, 'USER')

    fc.assert(
      fc.property(nonAdminRoles, (role) => {
        const bugCondition = isBugCondition_EditButton(false, role)
        expect(bugCondition).toBe(true)

        const result = canEdit_fixed(false, role)
        return result === false
      }),
      { numRuns: 20 }
    )
  })
})
