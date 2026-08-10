import dotenv from 'dotenv'
dotenv.config()

import { prisma } from '../lib/prisma'

async function main() {
  try {
    const userCount = await prisma.user.count()
    console.log(`✅ Connected (users count: ${userCount})`)
  } catch (error) {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  } finally {
    if (typeof prisma.$disconnect === 'function') {
      await prisma.$disconnect()
    }
  }
}

main()
