import { Wallet, Contract } from 'ethers'
import { TransactionResponse } from '@ethersproject/abstract-provider'
import { FastifyLoggerInstance } from 'fastify'
import ERC20ABI from '../abi/ERC20.abi.json'
import { parseUnits } from 'ethers/lib/utils'

type TransferTokenOptions = {
  wallet: Wallet
  to: string
  amount: string
  asset: string
  logger: FastifyLoggerInstance
}
export async function transferToken({
  wallet,
  to,
  amount,
  asset,
  logger,
}: TransferTokenOptions) {
  const localLogger = logger.child({ module: 'transferToken' })
  const contract = new Contract(asset, ERC20ABI, wallet)

  let transactionResponse: TransactionResponse
  try {
    const funds = parseUnits(amount, 18)
    localLogger.info(
      { from: wallet.address, to, funds, asset },
      'preparing transfer'
    )
    transactionResponse = await contract.transfer(to, funds)
    localLogger.info({ hash: transactionResponse.hash }, 'submitted')
  } catch (e) {
    localLogger.error(`sendTransaction failed: ${e.message}`)
    return
  }

  try {
    const receipt = await transactionResponse.wait()
    localLogger.info({ receipt: receipt.transactionHash }, 'mined')
  } catch (e) {
    localLogger.error(`wait failed ${e.message}`)
  }
}

export default transferToken
