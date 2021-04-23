import { TransakOrder } from './types'
import { Wallet } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import { FastifyLoggerInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import { sendGas } from '../utils/sendGas'
import transferToken from '../utils/transferToken'
import { formatEther, parseUnits } from 'ethers/lib/utils'
import { NonceManager } from '@ethersproject/experimental'
import { waitReceipt } from '../utils/waitReceipt'
import { Network } from '../plugins/providers'
import { getNetwork } from './TransakService'

export const AAVE_WITHDRAW_GAS_LIMIT = 206736 // e.g. https://kovan.etherscan.io/tx/0x03e8c849cf63483463a8a0a926f91358a437fe88c1660901584b364c3f7929d5
export const UNDERLYING_ALLOW_GAS_LIMIT = 44356 // e.g. https://kovan.etherscan.io/tx/0x03e8c849cf63483463a8a0a926f91358a437fe88c1660901584b364c3f7929d5
export const AAVE_DEPOSIT_GAS_LIMIT = 178882 // Check how much it cost invest + withdraw
export const GAS_MAX_PRICE = 200 // GWei in kovan currently the average is 14/20 GWei. TODO LS Should we pick from current gas price to optimize the deposit?

export const GAS_REQUIRED = parseUnits(GAS_MAX_PRICE.toString(), 'gwei').mul(
  AAVE_DEPOSIT_GAS_LIMIT + AAVE_WITHDRAW_GAS_LIMIT + UNDERLYING_ALLOW_GAS_LIMIT
)

type ProcessOrderOptions = {
  order: TransakOrder
  nonceManager: NonceManager
  networks: Network[]
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
  nonceManager,
  networks,
  logger,
  asset,
}: ProcessOrderOptions) => {
  const { walletAddress: to, cryptoAmount, network, envName } = order
  logger.info({ to, network, envName }, 'checking...')
  // TODO LS send only DEPOSIT
  // Implement ask for GAS on demand POST /gas
  // {
  //   required: '0x001'
  //   action: 'withdraw'
  //   pot: '0x001'
  // }
  // check if this address received ether then send more gas
  const targetNetwork = getNetwork(networks, order.network)
  if (targetNetwork === 'kovan') {
    const amount = parseUnits(cryptoAmount.toString(), 18).toString()
    logger.info(
      {
        from: (nonceManager.signer as Wallet).address,
        to,
        amount,
        asset,
        network,
        envName,
      },
      'preparing transfer...'
    )
    const tx = await transferToken({
      nonceManager,
      to,
      asset,
      logger,
      amount,
    })
    waitReceipt(tx, logger)
  }

  const balance: BigNumber = await nonceManager.provider!.getBalance(to)
  if (balance.lt(GAS_REQUIRED)) {
    logger.info(
      {
        to,
        balance: formatEther(balance),
        value: formatEther(GAS_REQUIRED),
        network,
        envName,
      },
      'Sending GAS...'
    )
    const tx = await sendGas({ nonceManager, to, value: GAS_REQUIRED, logger })
    waitReceipt(tx, logger)
  } else {
    logger.info({ to, network, balance }, 'GAS not required')
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
    return order
  } catch (e) {
    logger.warn({ message: e.message }, 'processEvent failed')
    return
  }
}
