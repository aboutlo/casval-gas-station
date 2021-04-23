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
