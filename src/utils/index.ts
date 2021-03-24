import { Wallet } from 'ethers'
import { FastifyLoggerInstance } from 'fastify'

type SendGasOptions = {
  wallet: Wallet
  to: string
  value: string
  logger: FastifyLoggerInstance
}
export async function sendGas({ wallet, to, value, logger }: SendGasOptions) {
  const transactionResponse = await wallet.sendTransaction({
    to,
    value,
  })
  logger.info({ hash: transactionResponse.hash }, 'submitted')

  const receipt = await transactionResponse.wait()
  logger.info({ receipt: receipt.transactionHash }, 'mined')
}

export default sendGas
