import Pusher from 'pusher-js'
import { FastifyPluginAsync } from 'fastify'
import jwt from 'jsonwebtoken'
import { CONFIG } from '../config'
import { BigNumber } from '@ethersproject/bignumber'
import { Wallet } from 'ethers'

export enum TransakEventStatus {
  PaymentVerifying = 'ORDER_PAYMENT_VERIFYING', // When the user marks the payment as done but it is received by us yet.
  Created = 'ORDER_CREATED',
  Processing = 'ORDER_PROCESSING', //  => they got the money to Well done!
  Completed = 'ORDER_COMPLETED', //  => we got the money seed the wallet
  Failed = 'ORDER_FAILED', //  => we got the money seed the wallet
}

const MINIMUM_INVEST_GAS = '0x7627' // Check how much it cost the withdraw

export enum TransakOrderStatus {
  Processing = 'PROCESSING', //  => they got the money to Well done!
  Expired = 'EXPIRED',
  Failed = 'FAILED',
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  PendingDeliveryFromTransak = 'PENDING_DELIVERY_FROM_TRANSAK', //  => we got the money seed the wallet
  AwaitingPaymentFromUser = 'AWAITING_PAYMENT_FROM_USER', //  => we got the money seed the wallet
}

export type TransakOrder = {
  id: string
  walletAddress: string //"0x40dc2F9Ef3eb24002197EaDfC820a0a2a78BE6cF",
  createdAt: string //"2021-03-17T10:09:11.813Z",
  status: string //"COMPLETED",
  fiatCurrency: string //"EUR",
  cryptoCurrency: string //"DAI",
  isBuyOrSell: string //"BUY",
  fiatAmount: number // 500,
  walletLink: string // "https://kovan.etherscan.io/address/0x40dc2F9Ef3eb24002197EaDfC820a0a2a78BE6cF#tokentxns",
  paymentOptionId: string // "sepa_bank_transfer",
  reservationId: string // "430fea65-dcc4-4c07-9c40-bfa2172e7181",
  quoteId: string // "fa26443e-176f-457b-b775-4752466168ac",
  bankId: string // "1cbcee9b-0420-4442-b701-fab8d0005b88",
  addressAdditionalData: boolean //  false,
  network: string // "ethereum",
  cryptocurrency: string // "DAI",
  amountPaid: number // 500,
  envName: string // "v2-staging",
  partnerOrderId: string // "O6139",
  partnerCustomerId: string // "0x40dc2F9Ef3eb24002197EaDfC820a0a2a78BE6cF",
  conversionPrice: number // 1.1821313639739253,
  cryptoAmount: number // 573.05,
  totalFeeInFiat: number // 15.24,
  fromWalletAddress: string // "0x085ee67132ec4297b85ed5d1b4c65424d36fda7d",
  updatedAt: string // "2021-03-17T10:09:53.369Z",
  transactionHash: string // "0x538ad0ff53101db67aab423478f045142f707961564c23c5db1d2e18283f1c7a",
  transactionLink: string // "https://kovan.etherscan.io/tx/0x538ad0ff53101db67aab423478f045142f707961564c23c5db1d2e18283f1c7a",
  completedAt: string // "2021-03-17T10:10:09.077Z",
  partnerFeeInLocalCurrency: number // 0
  paymentOptions: {
    currency: string
    id: string
    name: string
    fields: { name: string; value: string }[]
  }[]
}

const Transak: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  console.log('Transak start..')
  const configs = CONFIG.transak[CONFIG.network]
  const pusher = new Pusher(configs.pusherApiKey, {
    cluster: 'ap2',
  })
  pusher.connection.bind('error', function (err: any) {
    console.log('error', err)
  })

  // pusher.connection.bind('state_change', function (message: any) {
  //   console.log('state_change', message)
  // })
  //
  // pusher.connection.bind('connecting_in', function (message: any) {
  //   console.log('connecting_in', message)
  // })
  // pusher.connection.bind('message', function (message: any) {
  //   console.log('message', message)
  // })

  const channel = pusher.subscribe(configs.apiKey)
  console.log({ channel: channel.name })
  async function callback(data: any) {
    if (data && typeof data === 'string') {
      let order: TransakOrder | undefined = undefined
      try {
        console.log('decrypting...')
        order = jwt.verify(data, configs.secret) as TransakOrder
      } catch (e) {
        console.error(e)
      }
      console.log(order?.id, order?.status)
      //FIXME should be Completed
      if (order && order.status === TransakOrderStatus.PendingDeliveryFromTransak) {
        const { walletAddress: to } = order
        const [wallet] = fastify.repos.walletRepo.findAll() as Wallet[]
        console.log({ from: wallet.address })
        const balance: BigNumber = await wallet.provider.getBalance(to)
        console.log({ to, balance })
        if (balance.lt(MINIMUM_INVEST_GAS)) {
          console.log('Sending...')
          const transactionResponse = await wallet.sendTransaction({
            to: order.walletAddress,
            value: MINIMUM_INVEST_GAS,
          })
          console.log({ hash: transactionResponse.hash })
          const receipt = await transactionResponse.wait()
          console.log({ receipt: receipt.transactionHash })
        } else {
          console.log('ignore')
        }
      }
    }
  }
  channel.bind_global((message: string, encryptedOrderData: any) => {
    console.log(`Channel message "${message}"`)
    return callback(encryptedOrderData)
  })

  //receive updates of all the orders
  // pusher.bind_global((orderId: string, encryptedOrderData: any) => {
  //   console.log(`Order update "${orderId}"`)
  //   return callback(encryptedOrderData)
  // })

  // TODO
  // https://www.fastify.io/docs/latest/Plugins-Guide/#distribution
  // find the first wallet with balance
  // start to watching events
  // send ether on ORDER_COMPLETE
}

export default Transak
