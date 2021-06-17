import { FastifyInstance } from 'fastify'
import {
  PurchaseStatus,
  RampPurchase,
  TransakEventStatus,
  TransakOrder,
  TransakOrderStatus,
} from '../services/types'
import prisma, {
  Order,
  OrderType,
  OrderStatus,
  Supplier,
  Currency,
  PaymentMethod,
} from '@prisma/client'
import { Chain, Network } from '../models/type'
import { Decimal } from '@prisma/client/runtime'

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

export const OrderUtil = {
  // create: async (app: FastifyInstance, payload: Omit<Order, 'id'>) => {
  //   return app
  //     .inject({
  //       method: 'POST',
  //       url: `/orders`,
  //       headers: {
  //         'content-type': 'application/json',
  //       },
  //       payload: JSON.stringify(payload),
  //     })
  //     .then((r) => r.json())
  // },
  findAll: async (app: FastifyInstance, wallet: string) => {
    return app
      .inject({
        method: 'GET',
        url: `/orders`,
        query:  {wallet},
        headers: {
          'content-type': 'application/json',
        },
      })
      .then((r) => r.json())
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
  amountPaid = 50,
  envName = 'kovan',
  partnerOrderId = 'partnerOrderId',
  partnerCustomerId = 'partnerCustomerId',
  conversionPrice = 0.1,
  cryptocurrency = 'DAI',
  cryptoAmount = 35, // 18
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

/*{
    "type": "CREATED",
    "purchase": {
        "endTime": "2021-05-05T09:00:06.121Z",
        "escrowAddress": "",
        "cryptoAmount": "5941100533426643564",
        "fiatCurrency": "GBP",
        "fiatValue": 4.34,
        "baseRampFee": 0.042884203960396,
        "networkFee": 0.00869539999999999,
        "appliedFee": 0.051579603960396,
        "createdAt": "2021-04-30T09:00:06.178Z",
        "updatedAt": "2021-04-30T09:00:06.860Z",
        "id": "serhc5knxokfwpq",
        "asset": {
            "address": "0x6a383cf1f8897585718dca629a8f1471339abfe4",
            "symbol": "MATIC_DAI",
            "name": "DAI on Polygon mumbai testnet",
            "decimals": 18
        },
        "receiverAddress": "0x6dee0e184c03e7797e424d2619077640bbac881e",
        "assetExchangeRate": 0.7218225599636798,
        "status": "INITIALIZED",
        "paymentMethodType": "MANUAL_BANK_TRANSFER"
    }
}*/

export const buildFakeRampNetworkPurchase = ({
  id = 'serhc5knxokfwpq',
  endTime = new Date('2021-05-05T09:00:06.121Z').toISOString(),
  asset = {
    address: '0x6a383cf1f8897585718dca629a8f1471339abfe4',
    symbol: 'MATIC_DAI',
    name: 'DAI on Polygon mumbai testnet',
    decimals: 18,
  },
  receiverAddress = '0x6dee0e184c03e7797e424d2619077640bbac881e',
  cryptoAmount = '5941100533426643564',
  fiatCurrency = 'GBP',
  fiatValue = 4.34,
  purchaseViewToken = "zvcm3m7cq44cozfo",
  assetExchangeRate = 0.7218225599636798,
  baseRampFee = 0.042884203960396,
  networkFee = 0.00869539999999999,
  appliedFee = 0.051579603960396,
  paymentMethodType = 'MANUAL_BANK_TRANSFER',
  createdAt,
  updatedAt,
  status = PurchaseStatus.Initialized,
  escrowAddress = '0x0001',
  escrowDetailsHash = undefined,
  finalTxHash,
}: Partial<RampPurchase> = {}): RampPurchase => {
  const now = new Date().toISOString()
  return {
    id,
    createdAt: createdAt || now,
    updatedAt: updatedAt || now,
    endTime,
    asset,
    receiverAddress,
    cryptoAmount,
    fiatCurrency,
    fiatValue,
    assetExchangeRate,
    purchaseViewToken,
    baseRampFee,
    networkFee,
    appliedFee,
    paymentMethodType,
    finalTxHash,
    status,
    escrowAddress,
    escrowDetailsHash,
  }
}

export const buildFakeOrder = ({
  id = '0f0b6e06-3121-478b-8ca5-055582220827',
  kind = OrderType.BUY,
  createdAt,
  updatedAt,
  status = OrderStatus.CREATED,
  supplier = Supplier.RAMP,
  supplierId = '123',
  sellCurrencyId = 'EUR',
  sellAmount = new Decimal(10000000), // 10.000000
  buyCurrencyId = 'DAI@1',
  buyAmount = new Decimal('12.400'), // 12.4 124000000000000000
  paymentMethod = PaymentMethod.BANK_TRANSFER,
  rate = new Decimal('1.1'),
  feeCurrencyId = 'EUR',
  supplierFee = new Decimal(1000000), // 1.000000
  networkFee = new Decimal(100000), // 0.10000
  totalFee = new Decimal(1100000), // 1.10000
  transactionHash = '0x12345676543',
  buyerWallet = '0x01',
  sellerWallet = '0x02',
  meta = {},
  events = [
    {
      event: TransakEventStatus.Created,
      supplier: Supplier.RAMP,
      order: buildFakeTransakOrder(),
    },
  ],
}: Partial<Order> = {}): Order => {
  const now = new Date()
  const supplierIdWithSupplier = `${supplier}${supplierId}`
  return {
    id,
    kind,
    createdAt: createdAt || now,
    updatedAt: updatedAt || now,
    status,
    supplier,
    supplierId,
    supplierIdWithSupplier: supplierIdWithSupplier,
    sellCurrencyId,
    sellAmount,
    sellerWallet,
    buyCurrencyId,
    buyAmount,
    buyerWallet,
    paymentMethod,
    rate,
    meta,
    feeCurrencyId,
    supplierFee,
    networkFee,
    totalFee,
    transactionHash,
    events,
  }
}

export const buildFakeCurrency = ({
  symbol = 'DAI',
  name = 'Multicolateral DAI',
  decimals = 18,
  address = '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
  network = Network.Mainnet,
  chainId = 137,
  chain = 'Matic',
}: Partial<Currency> = {}): Currency => {
  const id = symbol + (chainId ? `@${chainId}` : '') //  symbol@chainId
  return {
    id,
    symbol,
    name,
    decimals,
    address,
    network,
    chainId,
    chain,
  }
}

export const buildFakeChain = ({
  name = 'Ethereum Mainnet Fake',
  chainId = 10001,
  shortName = 'eth',
  chain = 'ETH',
  network = 'fakenet',
  networkId = 10001,
  nativeCurrency = { name: 'Fake Ether', symbol: 'FETH', decimals: 18 },
}: Partial<Chain> = {}) => {
  return {
    name,
    chainId,
    shortName,
    chain,
    network,
    networkId,
    nativeCurrency,
  }
}
