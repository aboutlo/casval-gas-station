import { join } from 'path'
import AutoLoad, { AutoloadPluginOptions } from 'fastify-autoload'
import { FastifyPluginAsync } from 'fastify'
import fastifyEnv from 'fastify-env'

export type AppOptions = {
  logger: true
} & Partial<AutoloadPluginOptions>

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  void fastify
    .register(fastifyEnv, {
      schema: {
        type: 'object',
        required: ['DEFAULT_WALLET_MNEMONIC'],
        properties: {
          DEFAULT_WALLET_MNEMONIC: {
            type: 'string',
          },
        },
      },
      dotenv: true,
    })
    .ready((err) => {
      if (err) console.error(err)
    })
  // Place here your custom code!

  // Do not touch the following lines

  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    options: opts,
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'services'),
    ignorePattern: /.*(types|utils).*/,
    options: opts,
  })
}

declare module 'fastify' {
  export interface FastifyInstance {
    config: { [key: string]: any }
  }
}

export default app
export { app }
