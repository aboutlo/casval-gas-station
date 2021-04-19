import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider'
import { FastifyLoggerInstance } from 'fastify'

export const waitTransaction = async (
  transactionResponse: Promise<TransactionResponse | undefined>,
  logger: FastifyLoggerInstance
) => {
  const tx = await transactionResponse
  if (!tx) {
    logger.warn('tx not accepted')
    return
  }
  return tx
    .wait()
    .then((receipt: TransactionReceipt) => {
      logger.info({ receipt: receipt.transactionHash }, 'mined')
    })
    .catch((e) => {
      logger.error(`waitTransaction failed ${e.message}`)
    })
}
