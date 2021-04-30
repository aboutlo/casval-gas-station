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
    /*
    DB_USER=postgresql
    DB_PASS=kGMOrzkFmomD51ca
    DB_NAME=gas-station
    DB_SOCKET_PATH=/cloudsql
    DB_HOST=34.76.183.169
    CLOUD_SQL_CONNECTION_NAME=casval-308710:europe-west1:db-staging*/

    // const host = process.env.DB_HOST ? process.env.DB_HOST :`${process.env.DB_SOCKET_PATH}/${process.env.CLOUD_SQL_CONNECTION_NAME}`
    // console.log(`${process.env.DB_SOCKET_PATH}/${process.env.CLOUD_SQL_CONNECTION_NAME}`)
    // const url = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@${host}:5432/${process.env.DB_NAME}?schema=public`
    // const url = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:5432/${process.env.DB_NAME}?host=${host}`
    // const url = `postgresql://${process.env.DB_USER}:${process.env.DB_PASS}@localhost:5432/${process.env.DB_NAME}?schema=public&host=${process.env.DB_HOST}`
    console.log('DATABASE_URL:', process.env.DATABASE_URL)
    const prisma = new PrismaClient()
    /*{
        datasources: {
          db: {
            url,
          },
        },
      }*/

    /*{log: ['query']}{
      log: [
        {
          emit: "event",
          level: "query",
        },
      ],
    }*/
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
