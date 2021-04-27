import fp from 'fastify-plugin'
import { TransakOrderService } from '../services/transak/orders'
import { OrderService } from '../services/OrderService'
import { PrismaClient } from '@prisma/client'
import { CurrencyService } from '../services/CurrencyService'
import { Decimal } from '@prisma/client/runtime'

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(
  async (fastify, opts): Promise<void> => {
    const { TRANSAK_BASE_URL, TRANSAK_API_KEY, TRANSAK_SECRET } = fastify.config
    const transakOrderService = new TransakOrderService({
      logger: fastify.log,
      baseURL: TRANSAK_BASE_URL,
      secret: TRANSAK_SECRET,
    })
    Decimal.set({precision: 30})
    const prisma = new PrismaClient(
      /*{log: ['query']}{
      log: [
        {
          emit: "event",
          level: "query",
        },
      ],
    }*/)
    // prisma.$on("query", async (e) => {
    //   console.log(`${e.query} ${e.params}`)
    // });
    const orderService = new OrderService({ logger: fastify.log, prisma })
    const currencyService = new CurrencyService({ logger: fastify.log, prisma })
    fastify.decorate('transakOrderService', transakOrderService)
    fastify.decorate('orderService', orderService)
    fastify.decorate('currencyService', currencyService)
  },
  { name: 'services' }
)

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    transakOrderService: TransakOrderService
    orderService: OrderService
    currencyService: CurrencyService
  }
}
