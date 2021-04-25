import { FastifyPluginAsync, RequestGenericInterface } from 'fastify'
import { RefillError, RefillsService } from '../../services/RefillsService'
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

  let refillService: RefillsService
  const getRefillService = () => {
    if (refillService) return refillService

    const [wallet] = repos.walletRepo.findAll()
    if (!wallet) {
      throw new Error(
        'No wallet available. Check that DEFAULT_WALLET_MNEMONIC has been set'
      )
    }
    refillService = new RefillsService({
      logger: fastify.log,
      orderService: transakOrderService,
      wallet,
      providers,
    })
    return refillService
  }

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

      return getRefillService()
        .refill(address, network as Network)
        .catch((error) => {
          if (error instanceof RefillError) {
            fastify.log.warn(error)
            return reply.status(400).send(error)
          }
          fastify.log.error(error)
          return reply.status(500).send('Something went wrong')
        })
    }
  )
}

export default RefillsRoutes
