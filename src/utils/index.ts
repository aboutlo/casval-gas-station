import { Wallet } from 'ethers'
import { FastifyLoggerInstance } from 'fastify'
import { BigNumber } from '@ethersproject/bignumber'

type SendGasOptions = {
  wallet: Wallet
  to: string
  value: BigNumber
  logger: FastifyLoggerInstance
}
export async function sendGas({ wallet, to, value, logger }: SendGasOptions) {
  const localLogger = logger.child({ module: 'sendGas' })
  localLogger.info({ to, value }, 'sending...')
  let transactionResponse
  try {
    transactionResponse = await wallet.sendTransaction({
      to,
      value,
    })
    localLogger.info({ hash: transactionResponse.hash }, 'submitted')
  } catch (e) {
    localLogger.error(`sendTransaction failed ${e.message}`)
    return
  }

  try {
    const receipt = await transactionResponse.wait()
    localLogger.info({ receipt: receipt.transactionHash }, 'mined')
  } catch (e) {
    localLogger.error(`wait failed ${e.message}`)
  }
}

export default sendGas
