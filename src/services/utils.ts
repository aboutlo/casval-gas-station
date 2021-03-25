import { TransakOrder, TransakOrderStatus } from './types'
import { Wallet } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import { WalletRepo } from '../models/WalletRepo'
import { FastifyLoggerInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import { sendGas } from '../utils'

export const MINIMUM_INVEST_GAS = '0x7627' // Check how much it cost invest + withdraw
export const processOrderComplete = async (
  order: TransakOrder | undefined,
  repo: WalletRepo,
  logger: FastifyLoggerInstance
) => {
  if (!order || order.status !== TransakOrderStatus.Completed) {
    logger.info({ orderId: order?.id, status: order?.status }, 'skipping...')
    return
  }

  const { walletAddress: to } = order
  const [wallet] = repo.findAll() as Wallet[]
  logger.info({ from: wallet.address }, 'preparing...')

  const balance: BigNumber = await wallet.provider.getBalance(to)
  logger.info({ to, balance }, 'checking...')

  if (balance.lt(MINIMUM_INVEST_GAS)) {
    logger.info('Sending GAS...')
    await sendGas({ wallet, to, value: MINIMUM_INVEST_GAS, logger })
  } else {
    logger.info({ to, balance }, 'Enough GAS')
  }
}

export function processEvent(
  data: string,
  secret: string,
  logger: FastifyLoggerInstance
) {
  try {
    const order = jwt.verify(data, secret) as TransakOrder
    logger.info(
      { status: order.status, id: order.id, wallet: order.walletAddress },
      'processed'
    )
    return order
  } catch (e) {
    logger.warn({ message: e.message }, 'processEvent failed')
    return
  }
}
