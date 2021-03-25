import Pusher from 'pusher-js'
import { FastifyPluginAsync } from 'fastify'
import { processEvent, processOrderComplete } from './utils'
import { TransakOrderStatus } from './types'
import { Wallet } from 'ethers'

const Transak: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const logger = fastify.log.child({ module: 'TransakService' })
  logger.info('starting...')
  const {
    TRANSAK_PUSHER_APY_KEY,
    TRANSAK_API_KEY,
    TRANSAK_SECRET,
    KOVAN_TEST_ASSET,
    NETWORK,
  } = fastify.config
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

    const [wallet] = fastify.repos.walletRepo.findAll() as Wallet[]
    processOrderComplete({
      order,
      wallet,
      network: NETWORK,
      asset: KOVAN_TEST_ASSET,
      logger,
    })
  })
}

export default Transak
