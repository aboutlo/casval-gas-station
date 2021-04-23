import { FastifyLoggerInstance } from 'fastify'
import { BigNumber } from '@ethersproject/bignumber'
import { NonceManager } from '@ethersproject/experimental'
import { TransactionReceipt } from '@ethersproject/abstract-provider'

type SendGasOptions = {
  nonceManager: NonceManager
  to: string
  value: BigNumber
  logger: FastifyLoggerInstance
}
export async function sendGas({
  nonceManager,
  to,
  value,
  logger,
}: SendGasOptions) {
  const localLogger = logger.child({ module: 'sendGas' })
  localLogger.info({ to, value }, 'sending...')
  let transactionResponse
  try {
    transactionResponse = await nonceManager.sendTransaction({
      to,
      value,
    })
    localLogger.info({ hash: transactionResponse.hash }, 'submitted')
    return transactionResponse
  } catch (e) {
    localLogger.error(`sendTransaction failed ${e.message}`)
    throw new e()
  }
}

export default sendGas
