import { FastifyPluginAsync, RequestGenericInterface } from 'fastify'
import { RampPurchase } from '../services/types'
import { processRampEvent } from '../ramp/processor'
import CHAINS from '../models/chains.json'
import S from 'fluent-json-schema'

interface PostRequest extends RequestGenericInterface {
  Body: RampEvent
}

export interface RampEvent {
  type: RampEventType
  purchase: RampPurchase
}

export type RampEventType = 'CREATED' | 'RELEASED' | 'RETURNED' | 'ERROR'

const RampNetworkHook: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  const logger = fastify.log.child({ module: 'RampNetworkService' })
  logger.info('Starting RampNetworkService...')
  const { KOVAN_TEST_ASSET, CHAIN_IDS } = fastify.config
  const chains = CHAIN_IDS.map((id) => {
    return CHAINS.find((c) => c.chainId === id)!
  })

  fastify.post<PostRequest>(
    '/ramp-network',
    {
      schema: {
        body: S.object()
          .prop('type', S.string().required())
          .prop(
            'purchase',
            S.object()
              .prop('id', S.string())
              .prop('createdAt', S.string().format('date-time'))
              .prop('updatedAt', S.string().format('date-time'))
              .prop('endTime', S.string().format('date-time'))
              .prop(
                'asset',
                S.object()
                  .prop('address', S.string())
                  .prop('symbol')
                  .prop('name', S.string())
                  .prop('decimals', S.integer())
              )
              .prop('receiverAddress', S.string())
              .prop('purchaseViewToken', S.string())
              .prop('cryptoAmount', S.string())
              .prop('fiatCurrency', S.string())
              .prop('fiatValue', S.number())
              .prop('assetExchangeRate', S.number())
              .prop('baseRampFee', S.number())
              .prop('networkFee', S.number())
              .prop('appliedFee', S.number())
              .prop('paymentMethodType', S.string())
              .prop('status', S.string())
              .prop('escrowAddress', S.string())
          )
          .additionalProperties(false),
      },
    },
    async function (request, reply) {
      // FIXME verify the signature LS https://docs.ramp.network/webhooks#securing-webhooks
      const nonceManagers = fastify.getNonceManagers()
      const orderService = fastify.orderService
      const currencies = await fastify.currencyService.findAll()

      const response = await processRampEvent({
        event: request.body,
        chains,
        currencies,
        orderService,
        nonceManagers,
        logger,
        assetAddress: KOVAN_TEST_ASSET,
      })
      return response
    }
  )
}

export default RampNetworkHook
