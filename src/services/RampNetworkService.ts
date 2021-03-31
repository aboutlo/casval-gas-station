import {
  FastifyPluginAsync,
  RequestGenericInterface,
  FastifyLoggerInstance,
} from 'fastify'
import { GAS_REQUIRED } from './utils'
import { Wallet } from 'ethers'
import sendGas from '../utils/sendGas'
import { BigNumber } from '@ethersproject/bignumber'
import { formatEther } from 'ethers/lib/utils'
import transferToken from '../utils/transferToken'

interface PostRequest extends RequestGenericInterface {
  Body: {
    type: 'CREATED' | 'RELEASED' | 'RETURNED' | 'ERROR'
    purchase: RampPurchase
  }
}

interface RampPurchase {
  id: number
  endTime: string | null // datestring
  asset: AssetInfo // description of the purchased asset (address, symbol, name, decimals)
  escrowAddress?: string
  receiverAddress: string // blockchain address of the buyer
  cryptoAmount: string // number-string, in wei or token units
  fiatCurrency: string // three-letter currency code
  fiatValue: string // number-string
  assetExchangeRate: number
  poolFee?: string // number-string, seller fee for escrow-based purchases
  rampFee: string // number-string, Ramp fee
  escrowDetailsHash?: string // hash of purchase details used on-chain for escrow-based purchases
  finalTxHash?: string // hash of the crypto transfer blockchain transaction, filled once available
  createdAt: string // ISO date-time string
  updatedAt: string // ISO date-time string
  status: PurchaseStatus // See available values below
}

interface AssetInfo {
  address: string | null // 0x-prefixed address for ERC-20 tokens, `null` for ETH
  symbol: string // asset symbol, for example `ETH`, `DAI`, `USDC`
  name: string
  decimals: number // token decimals, e.g. 18 for ETH/DAI, 6 for USDC
}

enum PurchaseStatus {
  // Purchase status#
  // States before any payment attempt:

  Initialized = 'INITIALIZED', // The purchase was initialized.
  // Payment progress states:
  PaymentStarted = 'PAYMENT_STARTED', // An automated payment was initiated, eg. via card or open banking.
  PaymentInProgress = 'PAYMENT_IN_PROGRESS', // User completed the payment process.
  PaymentFailed = 'PAYMENT_FAILED', // The last payment was cancelled, rejected, or otherwise failed.
  PaymentExecuted = 'PAYMENT_EXECUTED', // The last payment was successful.
  FiatSent = 'FIAT_SENT', // Outgoing bank transfer was confirmed on the buyer's account.
  FiatReceived = 'FIAT_RECEIVED', // Payment was confirmed, final checks before crypto transfer.
  // Final outcome states  ='states',//
  Releasing = 'RELEASING', // Crypto release started – transfer transaction or escrow release() tx was sent.
  Released = 'RELEASED', // Crypto asset was confirmed to be transferred to the buyer. A terminal state.
  Expired = 'EXPIRED', // The time to pay for the purchase was exceeded. A terminal state.
  Cancelled = 'CANCELLED', // The purchase was cancelled and won't be continued. A terminal state.
}
type EventType = 'CREATED' | 'RELEASED' | 'RETURNED' | 'ERROR'
type ProcessEventOptions = {
  type: EventType
  purchase: RampPurchase
  wallet: Wallet
  logger: FastifyLoggerInstance
  assetAddress?: string
  network: 'kovan' | 'mainnet'
}
async function processEvent({
  type,
  purchase,
  wallet,
  logger,
  assetAddress,
  network,
}: ProcessEventOptions) {
  logger.info({ type }, 'received')

  switch (type) {
    case 'RELEASED':
      const { receiverAddress: to, asset, cryptoAmount } = purchase
      const balance: BigNumber = await wallet.provider.getBalance(to)

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
        // logger.info({ purchase }, 'kovan detected')

        await transferToken({
          wallet,
          to,
          asset: assetAddress!,
          logger,
          amount: cryptoAmount,
        })
      }

      return Promise.resolve('ok')
    case 'CREATED':
      return Promise.resolve('ok')
    case 'RETURNED':
      logger.warn({ id: purchase.id }, 'not  handled yet')
      return Promise.resolve('ok')
    case 'ERROR':
      logger.error({ id: purchase.id }, 'failed')
      return Promise.resolve('ok')
    default:
      throw new Error(`Type ${type} not supported`)
  }
}

const RampNetworkService: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  const logger = fastify.log.child({ module: 'RampNetworkService' })
  logger.info('Starting RampNetworkService...')
  const { NETWORK, KOVAN_TEST_ASSET } = fastify.config

  fastify.post<PostRequest>('/ramp-network', async function (request, reply) {
    // FIXME LS https://docs.ramp.network/webhooks#securing-webhooks
    const { type, purchase } = request.body
    const [wallet] = fastify.repos.walletRepo.findAll() as Wallet[]
    return await processEvent({
      type,
      purchase,
      wallet,
      logger,
      assetAddress: KOVAN_TEST_ASSET,
      network: NETWORK,
    })
  })
}

export default RampNetworkService
