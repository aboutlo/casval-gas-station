import { TransakOrder } from '../types'
import { FastifyLoggerInstance } from 'fastify'
import axios, { AxiosInstance } from 'axios'

interface Repo<T> {
  // create: (payload: Partial<T>) => T
}
type TransakOrderServiceOptions = {
  logger: FastifyLoggerInstance
  baseURL: string
  secret: string
}
export class TransakOrderService implements Repo<any> {
  private logger: FastifyLoggerInstance
  private axios: AxiosInstance
  // private secret: string

  constructor({ logger, baseURL, secret }: TransakOrderServiceOptions) {
    this.logger = logger.child({ module: 'TransakOrderService' })
    this.axios = axios.create({
      baseURL: `${baseURL}/partners`,
      params: {
        partnerAPISecret: secret,
      },
    })
  }

  async find(id: string): Promise<TransakOrder> {
    this.logger.info({ id }, 'find...')
    const response = await this.axios.get<{ response: TransakOrder }>(
      `/order/${id}`
    )
    return response.data.response
  }

  async findAll(): Promise<TransakOrder[]> {
    this.logger.info('findAll...')
    const response = await this.axios.get<{ response: TransakOrder[] }>(
      '/orders'
    )
    return response.data.response
  }

  async findAllByIds(ids: string[] = []): Promise<TransakOrder[]> {
    this.logger.info({ ids }, 'findAll...')
    return Promise.all(ids.map((id) => this.find(id)))
  }
}
