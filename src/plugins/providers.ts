import fp from 'fastify-plugin'
import { WalletRepo } from '../models/WalletRepo'
import { getDefaultProvider } from 'ethers'
import { BaseProvider, JsonRpcProvider } from '@ethersproject/providers'

export interface SupportPluginOptions {
  // Specify Support plugin options here
}
export enum Network {
  Mainnet = 'mainnet', // Ethereum,
  Kovan = 'kovan',
  Mumbai = 'mumbai',
  Polygon = 'polygon',
}
export type Providers = {
  [key: string]: BaseProvider
}
// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  const {
    NETWORKS,
    ALCHEMY_APY_KEY,
    INFURA_APY_KEY,
    MATICVIGIL_APY_KEY,
    MATICVIGIL_POLYGON_MAINNET_RPC_URL,
    MATICVIGIL_POLYGON_MUMBAI_RPC_URL,
    ETHERSCAN_APY_KEY,
  } = fastify.config

  const providers = NETWORKS.reduce((memo, network) => {
    let provider
    switch (network) {
      case 'kovan':
      case 'mainnet':
        provider = getDefaultProvider(network, {
          etherscan: ETHERSCAN_APY_KEY,
          infura: INFURA_APY_KEY,
          alchemy: ALCHEMY_APY_KEY,
        })
        break
      case 'polygon':
        provider = new JsonRpcProvider(
          `${MATICVIGIL_POLYGON_MAINNET_RPC_URL}/${MATICVIGIL_APY_KEY}`
        )
        break
      case 'mumbai':
        provider = new JsonRpcProvider(
          `${MATICVIGIL_POLYGON_MUMBAI_RPC_URL}/${MATICVIGIL_APY_KEY}`
        )
        break
    }
    return {
      ...memo,
      [network]: provider,
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
