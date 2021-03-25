import { Wallet } from 'ethers'
import { FastifyLoggerInstance } from 'fastify'

type SendGasOptions = {
  wallet: Wallet
  to: string
  value: string
  logger: FastifyLoggerInstance
}
export async function sendGas({ wallet, to, value, logger }: SendGasOptions) {
  const localLogger = logger.child({ module: 'sendGas' })
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
