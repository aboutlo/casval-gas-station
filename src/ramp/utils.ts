import {
  AssetInfo,
  PurchaseStatus,
  RampPurchase,
  TransakEventStatus,
} from '../services/types'
import {
  Order,
  OrderStatus,
  OrderType,
  Currency,
  PaymentMethod,
  Supplier,
} from '@prisma/client'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import { Chain, Network } from '../models/type'
import { Decimal } from '@prisma/client/runtime'
import { RampEvent, RampEventType } from '../plugins/RampNetworkHook'

export const rampStatusToOrderStatus = (
  status: PurchaseStatus
): OrderStatus => {
  // Initialized = 'INITIALIZED', // The purchase was initialized.
  //   // Payment progress states:
  //   PaymentStarted = 'PAYMENT_STARTED',   // An automated payment was initiated, eg. via card or open banking.
  //   PaymentInProgress = 'PAYMENT_IN_PROGRESS', // User completed the payment process.
  //   PaymentFailed = 'PAYMENT_FAILED', // The last payment was cancelled, rejected, or otherwise failed.
  //   PaymentExecuted = 'PAYMENT_EXECUTED', // The last payment was successful.
  //   PaymentSent = 'FIAT_SENT', //  Outgoing bank transfer was confirmed on the buyer's account.
  //   PaymentReceived = 'FIAT_RECEIVED', //  Payment was confirmed, final checks before crypto transfer.
  //   // Final outcome states:
  //   Releasing = 'RELEASING', // Crypto release started – transfer transaction or escrow release() tx was sent.
  //   Released = 'RELEASED', // Crypto asset was confirmed to be transferred to the buyer. A terminal state.
  //   Expired = 'EXPIRED', // The time to pay for the purchase was exceeded. A terminal state.
  //   Cancelled = 'CANCELLED', // The purchase was cancelled and won't be continued. A terminal state.
  switch (status) {
    case PurchaseStatus.Initialized:
      return OrderStatus.CREATED
    case PurchaseStatus.PaymentStarted:
    case PurchaseStatus.PaymentInProgress:
    case PurchaseStatus.PaymentExecuted:
      return OrderStatus.AWAITING_USER
    case PurchaseStatus.PaymentSent:
    case PurchaseStatus.PaymentReceived:
    case PurchaseStatus.Releasing:
      return OrderStatus.PROCESSING
    case PurchaseStatus.Released:
      return OrderStatus.COMPLETED
    case PurchaseStatus.Cancelled:
      return OrderStatus.CANCELLED
    case PurchaseStatus.PaymentFailed:
      return OrderStatus.FAILED
    case PurchaseStatus.Expired:
      return OrderStatus.EXPIRED
    default:
      throw new Error(`${status} unsupported  status`)
  }
}
type RampPurchaseToOrderOption = {
  event: RampEvent
  currencies: Currency[]
  chain: Chain
}
export const rampEventToOrder = ({
  event,
  currencies,
  chain,
}: RampPurchaseToOrderOption): Omit<
  Order,
  'id' | 'createdAt' | 'updatedAt'
> => {
  const { purchase } = event
  const sellCurrency = currencies.find(
    (c) => c.symbol === purchase.fiatCurrency && c.chainId === null
  )
  if (!sellCurrency)
    throw new Error(
      `Sell Currency "${purchase.fiatCurrency}" not found in ${currencies
        .map((c) => c.id)
        .join(', ')}`
    )

  const [networkOrSymbol, extractedSymbol] = purchase.asset.symbol.split('_')
  const symbol = extractedSymbol || networkOrSymbol
  const buyCurrency = currencies.find(
    (c) => c.symbol === symbol && c.chainId === chain.chainId
  )
  if (!buyCurrency)
    throw new Error(
      `Buy Currency "${purchase.asset.symbol}" not found in ${currencies
        .map((c) => c.id)
        .join(', ')}. chainId: ${chain.chainId}`
    )

  const supplierFee = new Decimal(purchase.baseRampFee)
  const networkFee = new Decimal(purchase.networkFee)
  const totalFee = new Decimal(purchase.appliedFee)
  // const sellAmount = parseUnits(`${purchase.fiatValue}`, sellCurrency.decimals).toString()
  // const value = formatUnits(purchase.fiatValue, sellCurrency.decimals)
  // const Decimal18 = Decimal.clone({ precision: 18 })
  const sellAmount = new Decimal(purchase.fiatValue)

  const buyAmount = new Decimal(
    formatUnits(purchase.cryptoAmount, buyCurrency.decimals)
  )
  // console.log('buyAmount:', buyAmount.toString(), {
  //   cryptoAmount: purchase.cryptoAmount,
  // })
  // console.log('buyAmount prisma:', new Decimal(buyAmount).toString())

  const supplierIdWithSupplier = `${Supplier.RAMP}${purchase.id}`
  let body
  try {
    body = JSON.parse(JSON.stringify(purchase))
  } catch (e) {
    throw new Error(
      `Failed to parse the purchase "${purchase.id} with ${e.message}"`
    )
  }

  return {
    // id: '',
    // createdAt: new Date(purchase.createdAt),
    // updatedAt: new Date(purchase.updatedAt),
    kind: OrderType.BUY,
    status: rampStatusToOrderStatus(purchase.status),
    supplier: Supplier.RAMP,
    supplierId: `${purchase.id}`,
    supplierIdWithSupplier: supplierIdWithSupplier,
    paymentMethod: PaymentMethod.CARD_PAYMENT,
    sellCurrencyId: sellCurrency.id,
    sellAmount,
    sellerWallet: purchase.escrowAddress
      ? purchase.escrowAddress.toLowerCase()
      : null,
    buyCurrencyId: buyCurrency.id,
    buyAmount,
    buyerWallet: purchase.receiverAddress.toLowerCase(),
    rate: new Decimal(`${purchase.assetExchangeRate}`), // decimal???
    feeCurrencyId: sellCurrency.id,
    supplierFee,
    networkFee,
    totalFee,
    transactionHash: purchase.finalTxHash ? purchase.finalTxHash : null,

    events: [
      {
        event: event.type,
        body,
      },
    ],
  }
}
