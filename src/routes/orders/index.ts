import { FastifyPluginAsync, RequestGenericInterface } from 'fastify'
import { Wallet } from 'ethers'

interface FindRequest extends RequestGenericInterface {
  Params: {
    id: string
  }
}

interface FindAllRequest extends RequestGenericInterface {
  Querystring: {
    address: string
    ids: string
  }
}

export const OrdersRoutes: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.get<FindRequest>('/:id', async function (request, reply) {
    const { id } = request.params
    return fastify.transakOrderService.find(id)
  })

  fastify.get<FindAllRequest>('', async function (request, reply) {
    const ids = (request.query.ids || '').split(',')
    return fastify.transakOrderService.findAllByIds(ids)
  })
}

export default OrdersRoutes
