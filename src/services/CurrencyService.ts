import { FastifyLoggerInstance } from 'fastify'
import { PrismaClient, Currency } from '@prisma/client'
import { Chain } from '../models/type'

interface Repo<Payload, Entity> {
  // create: (payload: Partial<T>) => T
  create: (payload: Payload) => Promise<string>
  find: (id: string) => Promise<Entity | null>
}

type Payload = Omit<Currency, 'id'>

type CurrencyServiceOptions = {
  logger: FastifyLoggerInstance
  prisma: PrismaClient
}
export class CurrencyService implements Repo<Payload, Currency> {
  private logger: FastifyLoggerInstance
  private prisma: PrismaClient

  constructor({ logger, prisma }: CurrencyServiceOptions) {
    this.logger = logger.child({ module: 'CurrencyService' })
    this.prisma = prisma
  }
  async create(payload: Payload) {
    const id = payload.symbol + payload.chainId ? `@${payload.chainId}` : ''
    this.logger.info({ id }, 'create')

    const currency = await this.prisma.currency.create({
      data: { ...payload, id },
    })
    return currency.id
  }

  async update(currency: Currency) {
    this.logger.info({ id: currency.id }, 'update')
    return this.prisma.currency.update({
      where: { id: currency.id },
      data: currency,
    })
  }

  async find(symbol: string, chainId?: number): Promise<Currency | null> {
    this.logger.info({ symbol }, 'find...')
    const id = symbol + chainId ? `@${chainId}` : ''
    return this.prisma.currency.findUnique({ where: { id } })
  }

  async findAll(): Promise<Currency[]> {
    this.logger.info('findAll...')
    return this.prisma.currency.findMany({})
  }

  // async findAllByIds(ids: string[] = []): Promise<TransakCurrency[]> {
  //   this.logger.info({ ids }, 'findAll...')
  //   return Promise.all(ids.map((id) => this.find(id)))
  // }
}
