import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'

// Override global database URL if it points to SQLite while we expect MySQL
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('file:')) {
  try {
    const envPath = path.join(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8')
      const match = envContent.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m)
      if (match && match[1]) {
        process.env.DATABASE_URL = match[1]
      }
    }
  } catch (e) {
    console.error('Failed to override DATABASE_URL:', e)
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma

