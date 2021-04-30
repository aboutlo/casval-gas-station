import Pusher from 'pusher-js'
import { FastifyPluginAsync } from 'fastify'
import { NonceManager } from '@ethersproject/experimental'
import { processEvent, processOrderComplete } from '../services/utils'
import { TransakOrderStatus } from '../services/types'
import { ChainId, Network } from '../models/type'

export const getNetwork = (
  networks: Network[],
  transakNetwork: 'ethereum' | 'matic' | 'mainnet'
) => {
  const isProd =
    networks.includes(Network.Mainnet) && networks.includes(Network.Polygon)
  switch (transakNetwork) {
    case 'ethereum':
    case 'mainnet':
      return isProd ? Network.Mainnet : Network.Kovan
    case 'matic':
      return isProd ? Network.Polygon : Network.Mumbai
  }
}

export const getChainId = (
  chains: ChainId[],
  transakNetwork: 'ethereum' | 'matic' | 'mainnet'
) => {
  const isProd =
    chains.includes(ChainId.Ethereum) && chains.includes(ChainId.Polygon)
  switch (transakNetwork) {
    case 'ethereum':
    case 'mainnet':
      return isProd ? ChainId.Ethereum : ChainId.Kovan
    case 'matic':
      return isProd ? ChainId.Polygon : ChainId.Mumbai
  }
}

//  TODO extract this as service and move the init in plugins
const Transak: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const logger = fastify.log.child({ module: 'TransakService' })
  let nonceManagers: Map<ChainId, NonceManager>
  const {
    CHAIN_IDS,
    TRANSAK_PUSHER_APY_KEY,
    TRANSAK_API_KEY,
    TRANSAK_SECRET,
    KOVAN_TEST_ASSET,
    TRANSAK_SERVICE,
  } = fastify.config

  logger.info('starting...')
  const pusher = new Pusher(TRANSAK_PUSHER_APY_KEY, {
    cluster: 'ap2',
  })
  pusher.connection.bind('error', function (err: any) {
    logger.error(err, 'pusher failed')
  })
  pusher.connection.bind('state_change', (states: any) => {
    logger.info({ states }, 'pusher state_change')
  })

  const channel = pusher.subscribe(TRANSAK_API_KEY)
  logger.info({ channel: channel.name }, 'subscribe')

  // action can be an orderId or `pusher:pong` as string
  // data is a string encrypted with the transak secret
  pusher.bind_global((action: string, data: string) => {
    logger.info({ action }, 'received')

    if (action === 'pusher:pong') {
      return
    }

    const order = processEvent(data, TRANSAK_SECRET, logger)

    if (!order) {
      return
    }

    if (!TRANSAK_SERVICE) {
      logger.info(
        { orderId: order.id, status: order.status },
        `service disable ignoring ${action}`
      )
      return
    }

    if (order.status !== TransakOrderStatus.Completed) {
      logger.info(
        { orderId: order.id, status: order.status },
        'order not ready'
      )
      return
    }

    logger.info({ id: order.id, status: order.status }, 'process order...')

    // const network = getNetwork(CHAIN_IDS, order.network)
    const chainId = getChainId(CHAIN_IDS, order.network)
    logger.info({ chainId }, 'chainId detected')

    const nonceManager = fastify.getNonceManagers().get(chainId)
    const asset = KOVAN_TEST_ASSET // FIXME mumbai won't work with this asset
    if (!nonceManager)
      throw new Error(
        `Failed to map ${
          order.network
        } to one of the available networks: ${CHAIN_IDS.join(' ')}`
      )

    processOrderComplete({
      order,
      nonceManager,
      chainIds: CHAIN_IDS,
      asset,
      logger,
    })
  })
}

export default Transak
