import Pusher from 'pusher-js'
import { FastifyPluginAsync } from 'fastify'
import { NonceManager } from '@ethersproject/experimental'
import { processEvent, processOrderComplete } from './utils'
import { TransakOrderStatus } from './types'
import { Wallet } from 'ethers'
import { Network } from '../plugins/providers'

const getNetwork = (
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
const Transak: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const logger = fastify.log.child({ module: 'TransakService' })
  let nonceManagers: Map<Network, NonceManager>
  const {
    TRANSAK_PUSHER_APY_KEY,
    TRANSAK_API_KEY,
    TRANSAK_SECRET,
    KOVAN_TEST_ASSET,
    NETWORK,
    NETWORKS,
    TRANSAK_SERVICE,
  } = fastify.config

  if (!TRANSAK_SERVICE) return
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
    // FIXME LS switch back to TransakOrderStatus.Complete
    if (!order || order.status !== TransakOrderStatus.Completed) {
      logger.info({ orderId: order?.id, status: order?.status }, 'skipping...')
      return
    }

    if(!nonceManagers) {
      const [wallet] = fastify.repos.walletRepo.findAll() as Wallet[]
      nonceManagers = NETWORKS.reduce((memo, network) => {
        const provider = fastify.providers[network]
        const nonceManager = new NonceManager(new Wallet(wallet.privateKey, provider))
        memo.set(network, nonceManager)
        return memo
      }, new Map<Network, NonceManager>())
    }

    const network = getNetwork(NETWORKS, order.network)
    const nonceManager = nonceManagers.get(network)
    const asset = KOVAN_TEST_ASSET  // FIXME mumbai won't work with this asset
    if (!nonceManager)
      throw new Error(
        `Failed to map ${
          order.network
        } to one of the available networks: ${NETWORKS.join()}`
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
