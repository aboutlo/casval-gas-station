import fp from 'fastify-plugin'
import S from 'fluent-json-schema'
import envSchema, { EnvSchemaData } from 'env-schema'

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(
  async (fastify, opts) => {
    const config = envSchema({
      schema: S.object()
        // ALL defaults are pointing to stage / kovan
        .prop(
          'NETWORK',
          S.string().default('kovan').enum(['kovan', 'mainnet']).required()
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
          'ETHERSCAN_APY_KEY',
          S.string().default('82QKD4WKI5R4D6JZJWKN3GIITS6EHRNEQM')
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
        .prop('DEFAULT_WALLET_MNEMONIC', S.string()),
      dotenv: true, // load .env if it's there, default: false
    })
    fastify.decorate('config', config)
  },
  { name: 'config' }
)

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    config: {
      NETWORK: 'kovan' | 'mainnet'
      PORT: number
      DEFAULT_WALLET_MNEMONIC: string | undefined
      KOVAN_TEST_ASSET: string
      ALCHEMY_APY_KEY: string
      INFURA_APY_KEY: string
      ETHERSCAN_APY_KEY: string
      TRANSAK_PUSHER_APY_KEY: string
      TRANSAK_SECRET: string
      TRANSAK_API_KEY: string
      TRANSAK_SERVICE: boolean
    }
  }
}
