import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider'
import { FastifyLoggerInstance } from 'fastify'

export const waitReceipt = async (
  tx: TransactionResponse,
  logger: FastifyLoggerInstance
) => {
  if (!tx) {
    logger.warn('tx not accepted')
    return
  }
  tx.wait()
    .then((receipt: TransactionReceipt) => {
      logger.info({ receipt: receipt.transactionHash }, 'mined')
    })
    .catch((e) => {
      logger.error(`waitTransaction failed ${e.message}`)
    })

  return tx
}
