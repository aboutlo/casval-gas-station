import { TransakOrder } from './types'
import { Wallet } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import { FastifyLoggerInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import { sendGas } from '../utils/sendGas'
import transferToken from '../utils/transferToken'
import { formatEther, parseUnits } from 'ethers/lib/utils'

export const AAVE_WITHDRAW_GAS_LIMIT = 206736 // e.g. https://kovan.etherscan.io/tx/0x03e8c849cf63483463a8a0a926f91358a437fe88c1660901584b364c3f7929d5
export const AAVE_DEPOSIT_GAS_LIMIT = 178882 // Check how much it cost invest + withdraw
export const GAS_MAX_PRICE = 200 // GWei in kovan currently the average is 14/20 GWei. TODO LS Should we pick from current gas price to optimize the deposit?

export const GAS_REQUIRED = parseUnits(GAS_MAX_PRICE.toString(), 'gwei').mul(
  AAVE_DEPOSIT_GAS_LIMIT + AAVE_WITHDRAW_GAS_LIMIT
)

type ProcessOrder = {
  order: TransakOrder
  wallet: Wallet
  network: 'kovan' | 'mainnet'
  logger: FastifyLoggerInstance
  asset: string
}

// const processor = (logger, network, wallet) => {
//
//   return {
//     process: (order) => {
//
//     },
//
//     valueOf: () => {
//
//     }
//   }
// }
//

export const processOrderComplete = async ({
  order,
  wallet,
  network,
  logger,
  asset,
}: ProcessOrder) => {
  const { walletAddress: to, cryptoAmount } = order
  logger.info({ to }, 'checking...')
  // TODO LS send only DEPOSIT
  // Implement ask for GAS on demand POST /gas
  // {
  //   required: '0x001'
  //   action: 'withdraw'
  //   pot: '0x001'
  // }
  // check if this address received ether then send more gas

  const balance: BigNumber = await wallet.provider.getBalance(to)
  // const gasPrice = parseUnits(GAS_MAX_PRICE.toString(), 'gwei')
  // const requiredGas = gasPrice.mul(
  //   AAVE_DEPOSIT_GAS_LIMIT + AAVE_WITHDRAW_GAS_LIMIT
  // )

  if (balance.lt(GAS_REQUIRED)) {
    logger.info(
      {
        to,
        balance: formatEther(balance),
        value: formatEther(GAS_REQUIRED),
      },
      'Sending GAS...'
    )
    await sendGas({ wallet, to, value: GAS_REQUIRED, logger })
  } else {
    logger.info({ to, balance }, 'GAS not required')
  }

  if (network === 'kovan') {
    logger.info({ to, balance, network, asset }, 'sending funds')
    const amount = parseUnits(cryptoAmount.toString(), 18).toString()
    logger.info(
      { from: wallet.address, to, amount, asset },
      'preparing transfer'
    )
    await transferToken({
      wallet,
      to,
      asset,
      logger,
      amount,
    })
  }
  return Promise.resolve(true)
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
