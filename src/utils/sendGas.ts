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
  } catch (e) {
    localLogger.error(`sendTransaction failed ${e.message}`)
    throw new e
  }

  // Don't block the thread for the transaction to be mined.
  // Once we got a transactionResponse we return immediately so that the nonceManager can proceed to the next transaction
  transactionResponse
    .wait()
    .then((receipt: TransactionReceipt) => {
      localLogger.info({ receipt: receipt.transactionHash }, 'mined')
    })
    .catch((e) => {
      localLogger.error(`wait failed ${e.message}`)
    })

  return transactionResponse
}

export default sendGas
