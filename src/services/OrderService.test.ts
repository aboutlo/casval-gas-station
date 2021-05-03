import { PrismaClient } from '@prisma/client'

import { buildFakeCurrency, buildFakeOrder } from '../test/utils'

import boot from '../app'
import { OrderService } from './OrderService'

async function build() {
  // const app = Fastify()
  //
  // // fastify-plugin ensures that all decorators
  // // are exposed for testing purposes, this is
  // // different from the production setup
  // void app.register(fp(App))
  const app = await boot()
  await app.ready()

  return app
}

export const mockedLogger = () =>
  ({
    child: () => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    }),
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  } as any)

describe('OrderService', () => {
  let service: OrderService
  const prisma = new PrismaClient()

  /*beforeAll(() => {
    return prisma.currency.createMany({
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
  })

  afterAll(() => prisma.currency.deleteMany({}))*/

  beforeEach(() => {
    service = new OrderService({ prisma, logger: mockedLogger() })
  })

  afterEach(() => prisma.order.deleteMany({}))

  it('creates an order', async () => {
    await expect(service.create(buildFakeOrder())).resolves.toEqual(
      expect.any(String)
    )
  })
})
