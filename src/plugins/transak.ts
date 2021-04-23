import fp from 'fastify-plugin'
import { TransakOrderService } from '../services/transak/orders'

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(
  async (fastify, opts): Promise<void> => {
    const { TRANSAK_BASE_URL, TRANSAK_API_KEY, TRANSAK_SECRET } = fastify.config
    const service = new TransakOrderService({
      logger: fastify.log,
      baseURL: TRANSAK_BASE_URL,
      secret: TRANSAK_SECRET,
    })
    fastify.decorate('transakOrderService', service)

  },
  {name: 'transakOrderService'}
)

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    transakOrderService: TransakOrderService
  }
}
