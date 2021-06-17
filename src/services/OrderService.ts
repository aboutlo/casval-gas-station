import { FastifyLoggerInstance } from 'fastify'
import { PrismaClient, Order } from '@prisma/client'

interface Repo<Payload, Entity> {
  // create: (payload: Partial<T>) => T
  create: (order: Payload) => Promise<string>
  find: (id: string) => Promise<Entity | null>
}

const SELECT_FIELDS = {
  id: true,
  kind: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  supplier: true,
  supplierId: true,
  supplierIdWithSupplier: true,
  sellCurrencyId: true,
  sellAmount: true,
  buyCurrencyId: true,
  buyAmount: true,
  sellerWallet: true,
  buyerWallet: true,
  paymentMethod: true,
  rate: true,
  feeCurrencyId: true,
  supplierFee: true,
  networkFee: true,
  totalFee: true,
  transactionHash: true,
  meta: true,
}
type Payload = Omit<Order, 'id'>
type TransakOrderServiceOptions = {
  logger: FastifyLoggerInstance
  prisma: PrismaClient
}
export class OrderService implements Repo<Payload, Order> {
  private logger: FastifyLoggerInstance
  private prisma: PrismaClient

  constructor({ logger, prisma }: TransakOrderServiceOptions) {
    this.logger = logger.child({ module: 'OrderService' })
    this.prisma = prisma
  }
  async create(payload: Payload) {
    this.logger.info({ status: payload.status }, 'create')
    const order = await this.prisma.order.create({
      data: payload,
    })
    return order.id
  }
  async update(order: Order) {
    this.logger.info({ id: order.id, status: order.status }, 'update')
    return this.prisma.order.update({
      where: { id: order.id },
      data: order,
    })
  }

  async createOrUpdate(
    order: Payload | Omit<Order, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    const supplier = order.supplier
    const supplierId = order.supplierId
    this.logger.info(
      {
        status: order.status,
        supplier: order.supplier,
        supplierId: order.supplierId,
      },
      'update'
    )
    // FIXME LS this isn't atomic. IF two events are occurring in rapid sequence we could loose data from events field
    const oldOrder = await this.prisma.order.findUnique({
      where: { supplierIdWithSupplier: `${supplier}${supplierId}` },
    })

    const events = oldOrder
      ? oldOrder.events.concat(order.events)
      : order.events

    // https://stackoverflow.com/questions/42233542/appending-pushing-and-removing-from-a-json-array-in-postgresql-9-5
    return this.prisma.order.upsert({
      where: { supplierIdWithSupplier: `${supplier}${supplierId}` },
      update: {
        ...order,
        events,
      },
      create: order,
    })
  }

  async find(id: string): Promise<Order | null> {
    this.logger.info({ id }, 'find...')
    return this.prisma.order.findUnique({ where: { id } })
  }

  async findAll(): Promise<Omit<Order, 'events'>[]> {
    this.logger.info('findAll...')
    return this.prisma.order.findMany({
      select: SELECT_FIELDS,
    })
  }

  async findAllByWallet(wallet: string): Promise<Omit<Order, 'events'>[]> {
    this.logger.info('findAllByWallet...')
    return this.prisma.order.findMany({
      where: {
        buyerWallet: wallet,
      },
      select: SELECT_FIELDS,
    })
  }

  // async findAllByIds(ids: string[] = []): Promise<TransakOrder[]> {
  //   this.logger.info({ ids }, 'findAll...')
  //   return Promise.all(ids.map((id) => this.find(id)))
  // }
}
