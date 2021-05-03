import { PrismaClient } from '@prisma/client'
import { buildFakeCurrency } from './utils'

export default async () => {
  console.log('beforeAll')
  const prisma = new PrismaClient()
  await prisma.currency.createMany({
    data: [
      buildFakeCurrency({
        name: 'Euro',
        symbol: 'EUR',
        chainId: null,
        decimals: 6,
      }),
      buildFakeCurrency({
        name: 'Dai Multicollateral',
        symbol: 'DAI',
        chainId: 1,
        decimals: 18,
      }),
    ],
  })
  await prisma.$disconnect()
}
