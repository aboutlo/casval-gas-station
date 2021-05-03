import { FastifyPluginAsync, RequestGenericInterface } from 'fastify'
import S from 'fluent-json-schema'
import wallets from '../wallets'

interface FindRequest extends RequestGenericInterface {
  Params: {
    id: string
  }
}

interface FindAllRequest extends RequestGenericInterface {
  Querystring: {
    wallet: string
    // ids: string
  }
}

export const OrdersRoutes: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get<FindRequest>('/:id', async function (request, reply) {
    const { id } = request.params
    return fastify.orderService.find(id)
  })

  fastify.get<FindAllRequest>(
    '',
    {
      schema: {
        querystring: S.object().prop(
          'wallet',
          S.string()
            .pattern(/0x[a-fA-F0-9]{40}/)
            .required()
        ),
      },
    },
    async function (request, reply) {
      const wallet = request.query.wallet
      return fastify.orderService.findAllByWallet(wallet)
    }
  )
}

export default OrdersRoutes
