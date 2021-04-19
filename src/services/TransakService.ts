import Pusher from 'pusher-js'
import { FastifyPluginAsync } from 'fastify'
import { NonceManager } from '@ethersproject/experimental'
import { processEvent, processOrderComplete } from './utils'
import { TransakOrderStatus } from './types'
import { Wallet } from 'ethers'

const Transak: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  // console.log('Transak', { opts })
  const logger = fastify.log.child({ module: 'TransakService' })
  let nonceManager: NonceManager

  const {
    TRANSAK_PUSHER_APY_KEY,
    TRANSAK_API_KEY,
    TRANSAK_SECRET,
    KOVAN_TEST_ASSET,
    NETWORK,
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
    logger.debug('------ my test -----')
    const order = processEvent(data, TRANSAK_SECRET, logger)
    // FIXME LS switch back to TransakOrderStatus.Complete
    if (!order || order.status !== TransakOrderStatus.Completed) {
      logger.info({ orderId: order?.id, status: order?.status }, 'skipping...')
      return
    }

    if (!nonceManager) {
      const [wallet] = fastify.repos.walletRepo.findAll() as Wallet[]
      nonceManager = new NonceManager(wallet)
    }

    processOrderComplete({
      order,
      nonceManager,
      network: NETWORK,
      asset: KOVAN_TEST_ASSET,
      logger,
    })
  })
}

export default Transak
