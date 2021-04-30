import fp from 'fastify-plugin'
import { NonceManager } from '@ethersproject/experimental'
import { FastifyLoggerInstance } from 'fastify'
import { Wallet } from 'ethers'
import { Chain, ChainId, Network } from '../models/type'

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(
  async (fastify, opts): Promise<void> => {
    const { CHAIN_IDS } = fastify.config
    let nonceManagers: Map<ChainId, NonceManager>

    const getNonceManagers = (logger: FastifyLoggerInstance) => () => {
      if (!nonceManagers) {
        const [wallet] = fastify.repos.walletRepo.findAll() as Wallet[]
        if (!wallet)
          throw new Error(
            'No wallet available. Seed the environment on create one '
          )
        nonceManagers = CHAIN_IDS.reduce((memo, chainId) => {
          const provider = fastify.providers[chainId]
          const nonceManager = new NonceManager(
            new Wallet(wallet.privateKey, provider)
          )
          memo.set(chainId, nonceManager)
          return memo
        }, new Map<ChainId, NonceManager>())

        logger.info(
          `${nonceManagers.size} nonceMangers configured for ${CHAIN_IDS.join(
            ' '
          )}`
        )
      }
      return nonceManagers
    }
    fastify.log.info('configure nonceMangers...')
    fastify.decorate('getNonceManagers', getNonceManagers(fastify.log))
  }
)

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    getNonceManagers: () => Map<ChainId, NonceManager>
  }
}
