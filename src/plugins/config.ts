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
        .prop(
          'network',
          S.string().default('kovan').enum(['kovan', 'mainnet']).required()
        )
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
      network: string
      port: string
      DEFAULT_WALLET_MNEMONIC: string | undefined
    }
  }
}
