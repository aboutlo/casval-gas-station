import fp from 'fastify-plugin'
import S from 'fluent-json-schema'
import envSchema from 'env-schema'
import { Network } from './providers'

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(
  async (fastify, opts) => {
    const config = envSchema({
      schema: S.object()
        .prop(
          'NETWORKS',
          S.string()
            .enum(['kovan,mumbai', 'mainnet,polygon', 'polygon', 'mainnet'])
            .default('kovan,mumbai')
            .required()
            .raw({ separator: ',' })
        )
        .prop('TRANSAK_SERVICE', S.boolean().default('true').required())
        .prop(
          'KOVAN_TEST_ASSET',
          S.string().default('0xff795577d9ac8bd7d90ee22b6c1703490b6512fd')
        )
        .prop(
          'ALCHEMY_APY_KEY',
          S.string().default('lbJ3HMDaSHXyDaZ6r_1h1HUQpA84OQVp')
        )
        .prop(
          'INFURA_APY_KEY',
          S.string().default('2f088a4741984ed085f544d133d88853')
        )
        .prop(
          'MATICVIGIL_APY_KEY',
          S.string().default('d0d63140769fb9763d2937f646f7cb1dc50f3e9f')
        )
        .prop(
          'MATICVIGIL_POLYGON_MUMBAI_RPC_URL',
          S.string().default('https://rpc-mumbai.maticvigil.com/v1')
        )
        .prop(
          'MATICVIGIL_POLYGON_MAINNET_RPC_URL',
          S.string().default('https://rpc-mainnet.maticvigil.com/v1')
        )
        .prop(
          'ETHERSCAN_APY_KEY',
          S.string().default('82QKD4WKI5R4D6JZJWKN3GIITS6EHRNEQM')
        )
        .prop(
          'TRANSAK_BASE_URL',
          S.string().default('https://staging-api.transak.com/api/v2')
        )
        .prop(
          'TRANSAK_API_KEY',
          S.string().default('0b1a0c3b-6684-4c38-8349-715567beba6c')
        )
        .prop(
          'TRANSAK_SECRET',
          S.string().default(
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJBUElfS0VZIjoiMGIxYTBjM2ItNjY4NC00YzM4LTgzNDktNzE1NTY3YmViYTZjIiwiaWF0IjoxNjE1OTc4MzMyfQ.PrRwViAsLIJBewq28Mio822a81-vyzzCMr4UdmeAhE4'
          )
        )
        .prop(
          'TRANSAK_PUSHER_APY_KEY',
          S.string().default('1d9ffac87de599c61283')
        )
        .prop('PORT', S.number().default(8080))
        .prop('BINDING', S.string().default('0.0.0.0'))
        .prop('DEFAULT_WALLET_MNEMONIC', S.string()),
      dotenv: true, // load .env if it's there, default: false
    })
    fastify.decorate('config', config)
  },
  { name: 'config' }
)
// export type Network = 'kovan' | 'mainnet' | 'polygon' | 'mumbai'
// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    config: {
      NETWORK: Network
      NETWORKS: Network[]
      PORT: number
      BINDING: string
      DEFAULT_WALLET_MNEMONIC: string | undefined
      KOVAN_TEST_ASSET: string
      ALCHEMY_APY_KEY: string
      MATICVIGIL_APY_KEY: string
      MATICVIGIL_POLYGON_MAINNET_RPC_URL: string
      MATICVIGIL_POLYGON_MUMBAI_RPC_URL: string
      INFURA_APY_KEY: string
      ETHERSCAN_APY_KEY: string
      TRANSAK_BASE_URL: string
      TRANSAK_PUSHER_APY_KEY: string
      TRANSAK_SECRET: string
      TRANSAK_API_KEY: string
      TRANSAK_SERVICE: boolean
    }
  }
}
