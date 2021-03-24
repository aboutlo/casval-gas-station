import Pusher from 'pusher-js'
import { FastifyPluginAsync } from 'fastify'
import { CONFIG } from '../config'
import { processEvent, processOrder } from './utils'
import { TransakEventStatus } from './types'

const Transak: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  const logger = fastify.log.child({ module: 'TransakService' })
  logger.info('starting...')
  const configs = CONFIG.transak[CONFIG.network]
  const pusher = new Pusher(configs.pusherApiKey, {
    cluster: 'ap2',
  })
  pusher.connection.bind('error', function (err: any) {
    logger.info(err)
  })
  const channel = pusher.subscribe(configs.apiKey)
  logger.info({ channel: channel.name })
  channel.bind(TransakEventStatus.Completed, (data: any) => {
    logger.info({ event: TransakEventStatus.Completed })
    // TODO LS ignore aka don't log pusher events
    const order = processEvent(data, configs.secret)
    return processOrder(order, fastify.repos.walletRepo, logger)
  })
  // channel.bind_global((message: string, encryptedOrderData: any) => {
  //   logger.info({ message })
  //   // TODO LS ignore aka don't log pusher events
  //   const order = processEvent(encryptedOrderData, configs.secret)
  //   return processOrder(order, fastify.repos.walletRepo, logger)
  // })
}

export default Transak
