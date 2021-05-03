import { PrismaClient } from '@prisma/client'

export default async () => {
  console.log('teardown')
  // const prisma = new PrismaClient()
  // await prisma.currency.deleteMany({})
  // await prisma.$disconnect()
}
