import { TransakOrder, TransakOrderStatus } from './types'
import { FastifyLoggerInstance } from 'fastify'
import { TransakOrderService } from './transak/orders'
import { Wallet } from 'ethers'
import { Network, Providers } from '../plugins/providers'
import { GAS_REQUIRED } from './utils'
import sendGas from '../utils/sendGas'
import { NonceManager } from '@ethersproject/experimental'
import { formatEther, formatUnits, parseUnits } from 'ethers/lib/utils'
import { waitReceipt } from '../utils/waitReceipt'
import transferToken from '../utils/transferToken'

const isPaid = (o: TransakOrder) => {
  return [
    TransakOrderStatus.PendingDeliveryFromTransak,
    TransakOrderStatus.Completed,
  ].includes(o.status)
}

const hasNetwork = (network: Network) => (o: TransakOrder) => {
  switch (network) {
    case Network.Kovan:
    case Network.Mainnet:
      return o.network === 'ethereum' || o.network === 'mainnet'
    case Network.Mumbai:
    case Network.Polygon:
      return o.network === 'matic'
    default:
      throw new Error(`Unsupported ${network}`)
  }
}

interface Repo<T> {
  // create: (payload: Partial<T>) => T
}

type RefillsServiceOptions = {
  logger: FastifyLoggerInstance
  orderService: TransakOrderService
  providers: Providers
  wallet: Wallet
}

export class RefillError extends Error {
  constructor(msg: string) {
    super(msg)
    Object.setPrototypeOf(this, RefillError.prototype)
    this.name = 'RefillError' // (2)
  }
}

export class RefillsService implements Repo<any> {
  private logger: FastifyLoggerInstance
  private orderService: TransakOrderService
  private wallet: Wallet
  private nonceManagers: Map<string, NonceManager>

  constructor({
    logger,
    orderService,
    wallet,
    providers,
  }: RefillsServiceOptions) {
    this.logger = logger.child({ module: 'RefillsService' })
    this.orderService = orderService
    this.wallet = wallet
    this.nonceManagers = Object.keys(providers).reduce((memo, network) => {
      const provider = providers[network]
      const nonceManager = new NonceManager(
        new Wallet(wallet.privateKey, provider)
      )
      memo.set(network as Network, nonceManager)
      return memo
    }, new Map<Network, NonceManager>())
  }

  async refill(address: string, network: Network): Promise<string> {
    this.logger.info({ address }, 'refill...')

    const nonceManager = this.nonceManagers.get(network)
    if (!nonceManager)
      throw new RefillError(`NonceManger not found for ${network}`)

    const orders: TransakOrder[] = await this.orderService.findAll()
    const [order] = orders
      .filter((o) => o.walletAddress?.toLowerCase() === address.toLowerCase())
      .filter(hasNetwork(network))
      .filter(isPaid)

    if (!order)
      throw new RefillError(`No order paid for ${address} on ${network}`)

    this.logger.info({ address }, 'checking balances...')

    const available = await nonceManager.signer.getBalance()
    if (available.lt(GAS_REQUIRED))
      throw new RefillError(`Gas stations out of gas ${formatEther(available)}`)

    const balance = await nonceManager.provider!.getBalance(address)

    if (balance.lt(GAS_REQUIRED)) {
      const tx = await sendGas({
        nonceManager,
        to: address,
        value: GAS_REQUIRED,
        logger: this.logger,
      })

      waitReceipt(tx, this.logger)

      if (network === 'kovan') {
        const amount = parseUnits(order.cryptoAmount.toString(), 18).toString()
        const tx = await transferToken({
          nonceManager,
          to: address,
          logger: this.logger,
          // FIXME LS read from config
          asset: '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd',
          amount,
        })
        waitReceipt(tx, this.logger)
      }

      return tx.hash
    }

    const status = order?.status
    this.logger.warn(
      { address, status, balance: balance.toString() },
      'rejected'
    )

    throw new RefillError(
      `Rejected: ${address} on ${network} has ${formatUnits(balance)} GAS`
    )
  }
}

export default RefillsService
