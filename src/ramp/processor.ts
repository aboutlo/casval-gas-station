import { NonceManager } from '@ethersproject/experimental'
import { FastifyLoggerInstance } from 'fastify'
import { BigNumber } from '@ethersproject/bignumber'
import { GAS_REQUIRED } from '../services/utils'
import { formatEther } from 'ethers/lib/utils'
import sendGas from '../utils/sendGas'
import transferToken from '../utils/transferToken'
import { RampEvent } from '../plugins/RampNetworkHook'
import { OrderService } from '../services/OrderService'
import { Chain, ChainId, } from '../models/type'
import { rampEventToOrder } from './utils'
import { Currency } from '@prisma/client'

type ProcessEventOptions = {
  event: RampEvent
  currencies: Currency[]
  chains: Chain[]
  orderService: OrderService
  nonceManagers: Map<ChainId, NonceManager>
  logger: FastifyLoggerInstance
  assetAddress?: string
}
export async function processRampEvent({
  event,
  currencies,
  chains,
  orderService,
  nonceManagers,
  logger,
  assetAddress,
}: ProcessEventOptions) {
  const { type, purchase } = event
  // console.log(JSON.stringify(event))
  logger.info({ type, id: purchase.id }, 'received')

  const chainName = purchase.asset.symbol.toLowerCase().includes('matic')
    ? 'matic'
    : 'eth'

  const chain = chains.find((chain) => chain.chain.toLowerCase() === chainName)
  if (!chain)
    throw new Error(
      `Chain "${chainName}" not found in ${chains
        .map((c) => c.chain.toLowerCase())
        .join(', ')}`
    )
  const order = rampEventToOrder({ event, currencies, chain })
  logger.info(
    {
      chain: chain.name,
      sellCurrency: order.sellCurrencyId,
      buyCurrency: order.buyCurrencyId,
      status: order.status,
    },
    'event mapped to order'
  )
  await orderService.createOrUpdate(order)
  const nonceManager = nonceManagers.get(chain.chainId)!

  switch (type) {
    case 'RELEASED':
      const { receiverAddress: to, asset, cryptoAmount } = purchase
      const balance: BigNumber = await nonceManager.provider!.getBalance(to)

      if (balance.lt(GAS_REQUIRED)) {
        logger.info(
          {
            to,
            balance: formatEther(balance),
            value: formatEther(GAS_REQUIRED),
          },
          'Sending GAS...'
        )
        await sendGas({ nonceManager, to, value: GAS_REQUIRED, logger })
      } else {
        logger.info({ to, balance: balance.toString() }, 'GAS not required')
      }

      if (chain.chainId === ChainId.Kovan) {
        await transferToken({
          nonceManager,
          to,
          asset: assetAddress!,
          logger,
          amount: cryptoAmount,
        })
      }

      return Promise.resolve('ok')
    case 'CREATED':
      return Promise.resolve('ok')
    case 'RETURNED':
      logger.warn({ id: purchase.id }, 'not  handled yet')
      return Promise.resolve('ok')
    case 'ERROR':
      logger.error({ id: purchase.id }, 'failed')
      return Promise.resolve('ok')
    default:
      throw new Error(`Type ${type} not supported`)
  }
}
