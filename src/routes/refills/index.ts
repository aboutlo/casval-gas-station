import { FastifyPluginAsync, RequestGenericInterface } from 'fastify'
import { RefillsService } from '../../services/RefillsService'
import { Network } from '../../plugins/providers'
import S from 'fluent-json-schema'

interface RefillRequest extends RequestGenericInterface {
  Body: {
    address: string
    network: string
  }
}

export const RefillsRoutes: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  const { transakOrderService, repos, providers } = fastify
  const [wallet] = repos.walletRepo.findAll()

  const refillService = new RefillsService({
    logger: fastify.log,
    orderService: transakOrderService,
    wallet,
    providers,
  })

  fastify.post<RefillRequest>(
    '',
    {
      schema: {
        body: S.object()
          .additionalProperties(false)
          .prop(
            'address',
            S.string()
              .pattern(/^0x[a-fA-F0-9]{40}$/g)
              .required()
          )
          .prop('network', S.string().enum(Object.values(Network))),
      },
    },
    async function (request, reply) {
      const { address, network } = request.body
      return refillService.refill(address, network as Network)
    }
  )
}

export default RefillsRoutes
