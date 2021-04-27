import { FastifyPluginAsync, RequestGenericInterface } from 'fastify'
import { PrismaClient } from '@prisma/client'

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
    return fastify.orderService.find(id)
  })

  fastify.get<FindAllRequest>('', async function (request, reply) {
    const ids = (request.query.ids || '').split(',')
    // findAllByIds(ids)
    return fastify.orderService.findAll()
  })
}

export default OrdersRoutes
