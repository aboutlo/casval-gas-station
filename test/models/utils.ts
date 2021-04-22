import { FastifyInstance } from 'fastify'
import { TransakOrder, TransakOrderStatus } from '../../src/services/types'

export const WalletRepoUtils = {
  findAll: async (app: FastifyInstance) => {
    return app.inject({
      method: 'GET',
      url: '/wallets',
    })
    // .then((response) => response.json())
  },
  create: async (
    app: FastifyInstance,
    payload: { mnemonic: string; path?: string }
  ) => {
    return app.inject({
      method: 'POST',
      url: '/wallets',
      headers: {
        'content-type': 'application/json',
      },
      payload: JSON.stringify(payload),
    })
    // .then((response) => response.json())
  },

  delete: async (app: FastifyInstance, address: string) => {
    return app.inject({
      method: 'DELETE',
      url: `/wallets/${address}`,
      headers: {
        'content-type': 'application/json',
      },
    })
    // .then((response) => response.json())
  },
}

export const buildFakeTransakOrder = ({
  id = '9cbfa794-ba8a-462c-aef1-8b7534d03491',
  walletAddress = '0x0000000000000001',
  createdAt = new Date().toISOString(),
  status = TransakOrderStatus.AwaitingPaymentFromUser,
  fiatCurrency = 'EUR',
  cryptoCurrency = 'DAI',
  isBuyOrSell = 'buy',
  fiatAmount = 50,
  walletLink = 'http://kovan.etherscan.com/0x0000000000000001',
  paymentOptionId = 'paymentOptionId',
  reservationId = 'reservationId',
  quoteId = 'quoteId',
  bankId = 'bankId',
  addressAdditionalData = false,
  network = 'ethereum',
  cryptocurrency = 'DAI',
  amountPaid = 50,
  envName = 'kovan',
  partnerOrderId = 'partnerOrderId',
  partnerCustomerId = 'partnerCustomerId',
  conversionPrice = 0.1,
  cryptoAmount = 35,
  totalFeeInFiat = 1,
  fromWalletAddress = '0x0000000000000002',
  updatedAt = new Date().toISOString(),
  transactionHash = '0x00000000000001111',
  transactionLink = 'http://kovan.etherscan.com/0x00000000000001111',
  partnerFeeInLocalCurrency = 0.2,
  completedAt,
  paymentOptions,
}: Partial<TransakOrder> = {}): TransakOrder => {
  return {
    id,
    walletAddress,
    createdAt,
    status,
    fiatCurrency,
    cryptoCurrency,
    isBuyOrSell,
    fiatAmount,
    walletLink,
    paymentOptionId,
    reservationId,
    quoteId,
    bankId,
    addressAdditionalData,
    network,
    cryptocurrency,
    amountPaid,
    envName,
    partnerOrderId,
    partnerCustomerId,
    conversionPrice,
    cryptoAmount,
    totalFeeInFiat,
    fromWalletAddress,
    updatedAt,
    transactionHash,
    transactionLink,
    completedAt,
    partnerFeeInLocalCurrency,
    paymentOptions: [
      {
        currency: 'EUR',
        id: 'eur_transfer',
        name: 'transfer',
        fields: [],
      },
    ],
  }
}
