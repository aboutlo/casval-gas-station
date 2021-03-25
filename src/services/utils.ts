import { TransakOrder, TransakOrderStatus } from './types'
import { Wallet } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import { FastifyLoggerInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import { sendGas } from '../utils'
import transferToken from '../utils/transferToken'

export const MINIMUM_INVEST_GAS = '0x7627' // Check how much it cost invest + withdraw
type ProcessOrder = {
  order: TransakOrder
  wallet: Wallet
  network: 'kovan' | 'mainnet'
  logger: FastifyLoggerInstance
  asset: string
}
export const processOrderComplete = async ({
  order,
  wallet,
  network,
  logger,
  asset,
}: ProcessOrder) => {
  const { walletAddress: to } = order
  logger.info({ to }, 'checking...')
  const balance: BigNumber = await wallet.provider.getBalance(to)

  if (balance.lt(MINIMUM_INVEST_GAS)) {
    logger.info({ to, balance }, 'Sending GAS...')
    await sendGas({ wallet, to, value: MINIMUM_INVEST_GAS, logger })
    // TODO LS sendTokens only if kovan
  } else {
    logger.info({ to, balance }, 'Skip GAS')
  }

  if (network === 'kovan') {
    logger.info({ to, balance, network, asset }, 'Sending funds...')
    await transferToken({
      wallet,
      to,
      asset,
      logger,
      amount: order.cryptoAmount.toFixed(2),
    })
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
