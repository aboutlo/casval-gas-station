import Pusher from 'pusher-js'
import { FastifyPluginAsync } from 'fastify'
import { processEvent, processOrderComplete } from './utils'

const Transak: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const logger = fastify.log.child({ module: 'TransakService' })
  logger.info('starting...')
  const {
    TRANSAK_PUSHER_APY_KEY,
    TRANSAK_API_KEY,
    TRANSAK_SECRET,
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
    processOrderComplete(order, fastify.repos.walletRepo, logger)
  })
}

export default Transak
