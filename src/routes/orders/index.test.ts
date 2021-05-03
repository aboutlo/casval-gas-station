import Fastify, { FastifyInstance } from 'fastify'
import { PrismaClient, Order } from '@prisma/client'
import {
  buildFakeCurrency,
  buildFakeOrder,
  OrderUtil,
  WalletRepoUtils,
} from '../../test/utils'
import boot from '../../app'

async function config() {
  return {}
}

async function build() {
  const app = await boot()
  await app.ready()

  return app
}

describe('Orders', () => {
  let prisma: PrismaClient
  const buyerWallet = '0x40dc2F9Ef3eb24002197EaDfC820a0a2a78BE6cF'
  let app: FastifyInstance

  beforeAll(async () => {
    prisma = new PrismaClient()
    app = await build()
  })

  afterAll(async () => app.close())

  afterEach(async () =>
    prisma.order.deleteMany({
      where: { buyerWallet },
    })
  )

  it('returns a list of orders', async () => {
    await prisma.order.createMany({
      data: [
        buildFakeOrder({
          id: '1babe884-a514-4216-9a76-aac9b42c8c82',
          buyerWallet,
          supplierId: '1',
        }),
        buildFakeOrder({
          id: '8e4c6f6a-0127-4720-952e-62da10b39a82',
          buyerWallet,
          supplierId: '2',
        }),
        buildFakeOrder({
          id: 'd77714b5-b46d-43aa-b5e1-b561edbccf87',
          buyerWallet: '0x01',
          supplierId: '3',
        }),
      ],
    })

    await expect(OrderUtil.findAll(app, buyerWallet)).resolves.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          buyerWallet,
        }),
      ])
    )
  })

  it.skip('throws missing or invalid signature', async () => {})

  it('throws a missing wallet error', async () => {
    await expect(OrderUtil.findAll(app, '')).resolves.toEqual({
      error: 'Bad Request',
      message: 'querystring.wallet should match pattern "0x[a-fA-F0-9]{40}"',
      statusCode: 400,
    })
  })
})
