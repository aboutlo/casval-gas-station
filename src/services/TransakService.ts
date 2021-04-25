import Pusher from 'pusher-js'
import { FastifyPluginAsync } from 'fastify'
import { NonceManager } from '@ethersproject/experimental'
import { processEvent, processOrderComplete } from './utils'
import { TransakOrder, TransakOrderStatus } from './types'
import { Wallet } from 'ethers'
import { Network } from '../plugins/providers'
import jwt from 'jsonwebtoken'

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

//  TODO extract this as service and move the init in plugins
const Transak: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const logger = fastify.log.child({ module: 'TransakService' })
  let nonceManagers: Map<Network, NonceManager>
  const {
    TRANSAK_PUSHER_APY_KEY,
    TRANSAK_API_KEY,
    TRANSAK_SECRET,
    KOVAN_TEST_ASSET,
    NETWORKS,
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

    const order = processEvent(data, TRANSAK_SECRET, logger)

    if (!order) {
      logger.info(`ignore ${action}`)
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
    if (!nonceManagers) {
      logger.info(
        { id: order.id, status: order.status },
        'configure nonceMangers ...'
      )
      const [wallet] = fastify.repos.walletRepo.findAll() as Wallet[]

      nonceManagers = NETWORKS.reduce((memo, network) => {
        const provider = fastify.providers[network]
        const nonceManager = new NonceManager(
          new Wallet(wallet.privateKey, provider)
        )
        memo.set(network, nonceManager)
        return memo
      }, new Map<Network, NonceManager>())

      logger.info(
        `${nonceManagers.size} nonceMangers configured for ${NETWORKS.join(
          ' '
        )}`
      )
    }

    const network = getNetwork(NETWORKS, order.network)
    logger.info({ network }, 'network detected')

    const nonceManager = nonceManagers.get(network)
    const asset = KOVAN_TEST_ASSET // FIXME mumbai won't work with this asset
    if (!nonceManager)
      throw new Error(
        `Failed to map ${
          order.network
        } to one of the available networks: ${NETWORKS.join(' ')}`
      )

    processOrderComplete({
      order,
      nonceManager,
      networks: NETWORKS,
      asset,
      logger,
    })
  })
}

export default Transak
