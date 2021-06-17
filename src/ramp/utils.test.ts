import {
  buildFakeChain,
  buildFakeCurrency,
  buildFakeRampNetworkPurchase,
} from '../test/utils'
import { rampEventToOrder } from './utils'
import {
  Order,
  OrderType,
  OrderStatus,
  Supplier,
  PaymentMethod,
} from '@prisma/client'
import { TransakEventStatus } from '../services/types'
import { Decimal } from '@prisma/client/runtime'
import { RampEvent } from '../plugins/RampNetworkHook'

describe('rampEventToOrder', () => {
  const chain = buildFakeChain({
    shortName: 'eth',
    chainId: 1,
    networkId: 1,
  })

  const currencies = [
    buildFakeCurrency({
      name: 'British pound',
      symbol: 'GBP',
      chainId: null,
      decimals: 0,
    }),
    buildFakeCurrency({
      name: 'Dai Multicollateral',
      symbol: 'DAI',
      chainId: 1,
      decimals: 18,
    }),
    buildFakeCurrency(),
  ]

  it('maps CREATED order', () => {
    const purchase = buildFakeRampNetworkPurchase({
      finalTxHash: undefined,
    })
    const type = 'CREATED'
    const event: RampEvent = {
      type,
      purchase,
    }

    const order = rampEventToOrder({ event, currencies, chain })
    expect(order).toEqual<Omit<Order, 'id' | 'createdAt' | 'updatedAt'>>({
      kind: OrderType.BUY,
      status: OrderStatus.CREATED,
      supplier: Supplier.RAMP,
      supplierId: `${purchase.id}`,
      supplierIdWithSupplier: `${Supplier.RAMP}${purchase.id}`,
      sellCurrencyId: 'GBP',
      sellAmount: new Decimal(4.34), //'50000',
      sellerWallet: purchase.escrowAddress ? purchase.escrowAddress : null,
      buyCurrencyId: 'DAI@1',
      buyAmount: new Decimal('5.941100533426643564'), //'30000000000000000000000',
      buyerWallet: purchase.receiverAddress,
      paymentMethod: PaymentMethod.CARD_PAYMENT,
      rate: new Decimal(`${purchase.assetExchangeRate}`), // decimal???
      feeCurrencyId: 'GBP',
      supplierFee: new Decimal('0.042884203960396'),
      networkFee: new Decimal('0.00869539999999999'),
      totalFee: new Decimal('0.051579603960396'),
      transactionHash: null,
      meta: {
        purchaseViewToken: purchase.purchaseViewToken,
      },
      events: [
        {
          event: type,
          body: JSON.parse(JSON.stringify(purchase)),
        },
      ],
    })
  })
})
