import Fastify, { FastifyInstance } from 'fastify'

import { boot } from '../app'
import { RampEvent } from './RampNetworkHook'
import { PrismaClient } from '@prisma/client'

import {
  buildFakeCurrency,
  buildFakeRampNetworkPurchase,
  OrderUtil,
  WalletRepoUtils,
} from '../test/utils'

async function build() {
  const app = await boot()
  await app.ready()
  return app
}

export const HookUtils = {
  hook: {
    push: async (app: FastifyInstance, payload: RampEvent) => {
      return app.inject({
        method: 'POST',
        url: '/ramp-network',
        headers: {
          'content-type': 'application/json',
        },
        payload: JSON.stringify(payload),
      })
    },
  },
}

describe('RampHook', () => {
  const prisma = new PrismaClient()
  const MNEMONIC =
    'stay apart adjust retire frame lumber usual amazing smoke worry outside wash'
  let app: FastifyInstance
  let wallet: string

  beforeAll(async () => {
    app = await build()
    const response = await WalletRepoUtils.create(app, {
      mnemonic: MNEMONIC,
    })
    const json = await response.json<any>()
    const [address] = Object.keys(json)
    wallet = address
    return prisma.currency.createMany({
      data: [
        buildFakeCurrency({
          name: 'British pound',
          symbol: 'GBP',
          chainId: null,
          decimals: 0,
        }),
        buildFakeCurrency({
          name: 'Dai Multicollateral',
          symbol: 'DAI',
          chainId: 80001,
          decimals: 18,
        }),
      ],
    })
  })

  afterAll(async () => {
    app.close()
    await WalletRepoUtils.delete(app, wallet)
    return prisma.currency.deleteMany({})
  })

  afterEach(async () => prisma.order.deleteMany({}))

  describe('hook', () => {
    it('creates an order', async () => {
      const purchase = buildFakeRampNetworkPurchase()
      expect(true).toEqual(true)
      await expect(
        HookUtils.hook.push(app, {
          type: 'CREATED',
          purchase: purchase,
        })
      ).resolves.toEqual(expect.objectContaining({ body: 'ok' }))

      await expect(
        OrderUtil.findAll(app, purchase.receiverAddress)
      ).resolves.toEqual([
        expect.objectContaining({
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          buyAmount: '5.941100533426644',
          buyCurrencyId: 'DAI@80001',
          buyerWallet: purchase.receiverAddress,
          feeCurrencyId: 'GBP',
          kind: 'BUY',
          networkFee: '0.00869539999999999',
          paymentMethod: 'CARD_PAYMENT',
          rate: '0.7218225599636798',
          sellAmount: '4.34',
          sellCurrencyId: 'GBP',
          sellerWallet: '0x0001',
          status: 'CREATED',
          supplier: 'RAMP',
          meta: { purchaseViewToken: purchase.purchaseViewToken },
          supplierFee: '0.042884203960396',
          supplierId: 'serhc5knxokfwpq',
          supplierIdWithSupplier: 'RAMPserhc5knxokfwpq',
          totalFee: '0.051579603960396',
          transactionHash: null,
        }),
      ])
    })

    it('creates an order ignoring not handled properties', async () => {
      const purchase = buildFakeRampNetworkPurchase() as any
      // missing property
      purchase.missingProperty = 'missing'

      await expect(
        HookUtils.hook.push(app, {
          type: 'CREATED',
          purchase: purchase,
        })
      ).resolves.toEqual(expect.objectContaining({ body: 'ok' }))

      await expect(
        OrderUtil.findAll(app, purchase.receiverAddress)
      ).resolves.toEqual([
        expect.objectContaining({
          id: expect.any(String),
          createdAt: expect.any(String),
          updatedAt: expect.any(String),
          buyAmount: '5.941100533426644',
          buyCurrencyId: 'DAI@80001',
          buyerWallet: purchase.receiverAddress,
          feeCurrencyId: 'GBP',
          kind: 'BUY',
          networkFee: '0.00869539999999999',
          paymentMethod: 'CARD_PAYMENT',
          rate: '0.7218225599636798',
          sellAmount: '4.34',
          sellCurrencyId: 'GBP',
          sellerWallet: '0x0001',
          status: 'CREATED',
          supplier: 'RAMP',
          supplierFee: '0.042884203960396',
          supplierId: 'serhc5knxokfwpq',
          supplierIdWithSupplier: 'RAMPserhc5knxokfwpq',
          totalFee: '0.051579603960396',
          transactionHash: null,
        }),
      ])
    })
  })
})
