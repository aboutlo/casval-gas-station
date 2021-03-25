import Pusher from 'pusher-js'
import { FastifyPluginAsync } from 'fastify'
import { CONFIG } from '../config'
import { processEvent, processOrderComplete } from './utils'
import { TransakEventStatus } from './types'

const Transak: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const logger = fastify.log.child({ module: 'TransakService' })
  logger.info('starting...')
  const configs = CONFIG.transak[CONFIG.network]
  const pusher = new Pusher(configs.pusherApiKey, {
    cluster: 'ap2',
  })
  pusher.connection.bind('error', function (err: any) {
    logger.error(err, 'pusher failed')
  })
  pusher.connection.bind('state_change', (states: any) => {
    logger.info({ states }, 'pusher state_change')
  })

  const channel = pusher.subscribe(configs.apiKey)
  logger.info({ channel: channel.name }, 'subscribe')

  // FIXME drop them given transak doesn't use the channel :/
  channel.bind(TransakEventStatus.Created, (data: any) => {
    processEvent(data, configs.secret, logger.child({ module: 'channel.bind' }))
  })
  channel.bind(TransakEventStatus.Processing, (data: any) => {
    processEvent(data, configs.secret, logger.child({ module: 'channel.bind' }))
  })
  channel.bind(TransakEventStatus.PaymentVerifying, (data: any) => {
    processEvent(data, configs.secret, logger.child({ module: 'channel.bind' }))
  })
  channel.bind(TransakEventStatus.Failed, (data: any) => {
    processEvent(data, configs.secret, logger.child({ module: 'channel.bind' }))
  })
  channel.bind(TransakEventStatus.Completed, (data: any) => {
    const order = processEvent(
      data,
      configs.secret,
      logger.child({ module: 'channel.bind' })
    )
    return processOrderComplete(
      order,
      fastify.repos.walletRepo,
      logger.child({ module: 'channel.bind' })
    )
  })

  // action can be an orderId or `pusher:pong` as string
  // data is a string encoded
  pusher.bind_global((action: string, data: string) => {
    logger.info({ action }, 'bind_global received')
    const order = processEvent(data, configs.secret, logger)
    processOrderComplete(order, fastify.repos.walletRepo, logger)
  })
}

export default Transak
