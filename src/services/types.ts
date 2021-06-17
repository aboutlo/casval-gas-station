export enum TransakEventStatus {
  PaymentVerifying = 'ORDER_PAYMENT_VERIFYING', // When the user marks the payment as done but it is received by us yet.
  Created = 'ORDER_CREATED',
  Processing = 'ORDER_PROCESSING', //  => they got the money to Well done!
  Completed = 'ORDER_COMPLETED', //  => we got the money seed the wallet
  Failed = 'ORDER_FAILED', //  => we got the money seed the wallet
}

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
  status: TransakOrderStatus //"COMPLETED",
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
  network: 'ethereum' | 'mainnet' | 'matic'
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
  completedAt?: string // "2021-03-17T10:10:09.077Z",
  partnerFeeInLocalCurrency: number // 0
  paymentOptions: {
    currency: string
    id: string
    name: string
    fields: { name: string; value: string }[]
  }[]
}

export interface RampPurchase {
  id: string
  endTime: string | null // purchase validity time, ISO date-time string
  asset: AssetInfo // description of the purchased asset (address, symbol, name, decimals)
  receiverAddress: string // blockchain address of the buyer
  cryptoAmount: string // number-string, in wei or token units
  fiatCurrency: string // three-letter currency code
  fiatValue: number // total value the user pays for the purchase, in fiatCurrency
  assetExchangeRate: number // price of 1 whole token of purchased asset, in fiatCurrency
  purchaseViewToken: string // used to reopen the view after the order has been created
  baseRampFee: number // base Ramp fee before any modifications, in fiatCurrency
  networkFee: number // network fee for transferring the purchased asset, in fiatCurrency
  appliedFee: number // final fee the user pays (included in fiatValue), in fiatCurrency
  paymentMethodType: PaymentMethodType // type of payment method used to pay for the swap - see values below
  finalTxHash?: string // hash of the crypto transfer blockchain transaction, filled once available
  createdAt: string // ISO date-time string
  updatedAt: string // ISO date-time string
  status: PurchaseStatus // See available values below
  escrowAddress?: string // filled only for escrow-backend purchases
  escrowDetailsHash?: string // hash of purchase details used on-chain for escrow-based purchases
}

export type PaymentMethodType =
  | 'MANUAL_BANK_TRANSFER'
  | 'AUTO_BANK_TRANSFER'
  | 'CARD_PAYMENT'
  | 'APPLE_PAY'

export  enum PurchaseStatus {
  Initialized = 'INITIALIZED', // The purchase was initialized.
  // Payment progress states:
  PaymentStarted = 'PAYMENT_STARTED',   // An automated payment was initiated, eg. via card or open banking.
  PaymentInProgress = 'PAYMENT_IN_PROGRESS', // User completed the payment process.
  PaymentFailed = 'PAYMENT_FAILED', // The last payment was cancelled, rejected, or otherwise failed.
  PaymentExecuted = 'PAYMENT_EXECUTED', // The last payment was successful.
  PaymentSent = 'FIAT_SENT', //  Outgoing bank transfer was confirmed on the buyer's account.
  PaymentReceived = 'FIAT_RECEIVED', //  Payment was confirmed, final checks before crypto transfer.
  // Final outcome states:
  Releasing = 'RELEASING', // Crypto release started – transfer transaction or escrow release() tx was sent.
  Released = 'RELEASED', // Crypto asset was confirmed to be transferred to the buyer. A terminal state.
  Expired = 'EXPIRED', // The time to pay for the purchase was exceeded. A terminal state.
  Cancelled = 'CANCELLED', // The purchase was cancelled and won't be continued. A terminal state.
}

export interface AssetInfo {
  address: string | null // 0x-prefixed address for ERC-20 tokens, `null` for ETH
  symbol: string // asset symbol, for example `ETH`, `DAI`, `USDC`
  name: string
  decimals: number // token decimals, e.g. 18 for ETH/DAI, 6 for USDC
}
