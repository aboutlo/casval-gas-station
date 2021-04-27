import fp from 'fastify-plugin'
import { getDefaultProvider } from 'ethers'
import { BaseProvider, JsonRpcProvider } from '@ethersproject/providers'
import chains from '../models/chains.json'
import { ChainId } from '../models/type'

export interface SupportPluginOptions {
  // Specify Support plugin options here
}
export type Providers = {
  [key: string]: BaseProvider
}
// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  const {
    CHAIN_IDS,
    ALCHEMY_APY_KEY,
    INFURA_APY_KEY,
    MATICVIGIL_APY_KEY,
    MATICVIGIL_POLYGON_MAINNET_RPC_URL,
    MATICVIGIL_POLYGON_MUMBAI_RPC_URL,
    ETHERSCAN_APY_KEY,
  } = fastify.config

  const providers = CHAIN_IDS.reduce((memo, chainId) => {
    const chain = chains.find((c) => c.chainId === chainId)
    if (!chain)
      throw new Error(
        `Chain "${chainId}" not found in ${chains
          .map((c) => `${c.chain.toLowerCase()} (${c.chainId})`)
          .join(', ')}`
      )
    let provider
    switch (chainId) {
      case ChainId.Ethereum:
      case ChainId.Kovan:
        provider = getDefaultProvider(chain.network, {
          etherscan: ETHERSCAN_APY_KEY,
          infura: INFURA_APY_KEY,
          alchemy: ALCHEMY_APY_KEY,
        })
        break
      case ChainId.Polygon:
        provider = new JsonRpcProvider(
          `${MATICVIGIL_POLYGON_MAINNET_RPC_URL}/${MATICVIGIL_APY_KEY}`
        )
        break
      case ChainId.Mumbai:
        provider = new JsonRpcProvider(
          `${MATICVIGIL_POLYGON_MUMBAI_RPC_URL}/${MATICVIGIL_APY_KEY}`
        )
        break
    }
    return {
      ...memo,
      [chainId]: provider,
    }
  }, {})

  fastify.decorate('providers', providers)
})
// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    providers: { [key: string]: BaseProvider }
  }
}
