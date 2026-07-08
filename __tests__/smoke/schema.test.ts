/**
 * Smoke Tests — التحقق من صحة بنية المشروع والـ schema
 * Requirements: 9.1, 9.3
 */

import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('Database Schema Smoke Tests', () => {
  const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma')
  let schemaContent: string

  try {
    schemaContent = readFileSync(schemaPath, 'utf-8')
  } catch {
    schemaContent = ''
  }

  it('يجب أن يكون ملف schema.prisma موجوداً', () => {
    expect(schemaContent).not.toBe('')
  })

  it('يجب أن يحتوي الـ schema على نموذج User', () => {
    expect(schemaContent).toContain('model User {')
  })

  it('يجب أن يحتوي الـ schema على نموذج Note', () => {
    expect(schemaContent).toContain('model Note {')
  })

  it('يجب أن يحتوي الـ schema على نموذج Notification', () => {
    expect(schemaContent).toContain('model Notification {')
  })

  it('يجب أن يحتوي الـ schema على نموذج Purchase', () => {
    expect(schemaContent).toContain('model Purchase {')
  })

  it('يجب أن يحتوي الـ schema على enum Category', () => {
    expect(schemaContent).toContain('enum Category {')
  })

  it('يجب أن يحتوي الـ schema على enum Visibility', () => {
    expect(schemaContent).toContain('enum Visibility {')
  })

  it('يجب أن يحتوي الـ schema على enum NotificationType', () => {
    expect(schemaContent).toContain('enum NotificationType {')
  })

  it('يجب أن يحتوي الـ schema على onDelete: Cascade للعلاقات', () => {
    expect(schemaContent).toContain('onDelete: Cascade')
  })

  it('يجب أن يحتوي الـ schema على فهرس user_id في جدول notes', () => {
    expect(schemaContent).toContain('@@index([authorId])')
  })

  it('يجب أن يحتوي الـ schema على فهرس is_public في جدول notes', () => {
    expect(schemaContent).toContain('@@index([isPublic])')
  })

  it('يجب أن يحتوي الـ schema على فهرس user_id في جدول notifications', () => {
    expect(schemaContent).toContain('@@index([userId])')
  })

  it('يجب أن يحتوي الـ schema على fulltext index للبحث النصي', () => {
    expect(schemaContent).toContain('@@fulltext([title, content])')
  })

  it('يجب أن يحتوي الـ schema على @@unique([buyerId, noteId]) لمنع الشراء المكرر', () => {
    expect(schemaContent).toContain('@@unique([buyerId, noteId])')
  })
})

describe('Types/DTOs Smoke Tests', () => {
  const typesPath = join(process.cwd(), 'types', 'index.ts')
  let typesContent: string

  try {
    typesContent = readFileSync(typesPath, 'utf-8')
  } catch {
    typesContent = ''
  }

  it('يجب أن يكون ملف types/index.ts موجوداً', () => {
    expect(typesContent).not.toBe('')
  })

  it('يجب أن يحتوي على UserDTO', () => {
    expect(typesContent).toContain('UserDTO')
  })

  it('يجب أن يحتوي على NoteDTO', () => {
    expect(typesContent).toContain('NoteDTO')
  })

  it('يجب أن يحتوي على NotificationDTO', () => {
    expect(typesContent).toContain('NotificationDTO')
  })

  it('يجب أن يحتوي على PurchaseDTO', () => {
    expect(typesContent).toContain('PurchaseDTO')
  })
})

describe('Project Structure Smoke Tests', () => {
  it('يجب أن يكون ملف lib/prisma.ts موجوداً', () => {
    const prismaPath = join(process.cwd(), 'lib', 'prisma.ts')
    const content = readFileSync(prismaPath, 'utf-8')
    expect(content).toContain('PrismaClient')
    expect(content).toContain('globalForPrisma')
  })

  it('يجب أن يكون ملف .env.example موجوداً', () => {
    const envPath = join(process.cwd(), '.env.example')
    const content = readFileSync(envPath, 'utf-8')
    expect(content).toContain('DATABASE_URL')
    expect(content).toContain('JWT_SECRET')
  })

  it('يجب أن يكون ملف vitest.config.ts موجوداً', () => {
    const vitestPath = join(process.cwd(), 'vitest.config.ts')
    const content = readFileSync(vitestPath, 'utf-8')
    expect(content).toContain('vitest')
  })
})
