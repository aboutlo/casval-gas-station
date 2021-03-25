import { join } from 'path'
import AutoLoad, { AutoloadPluginOptions } from 'fastify-autoload'
import { FastifyPluginAsync } from 'fastify'
import configPlugin from './plugins/config'

export type AppOptions = {
  logger: true
} & Partial<AutoloadPluginOptions>

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // void fastify
  //   .register(fastifyEnv, {
  //     schema: {
  //       type: 'object',
  //       properties: {
  //         // PORT: {
  //         //   type: 'string',
  //         //   default: '3000',
  //         // },
  //         DEFAULT_WALLET_MNEMONIC: {
  //           type: 'string',
  //         },
  //       },
  //     },
  //     dotenv: true,
  //   })
  //   .ready(async(err) => {
  //     if (err) console.error(err)
  //   })
  // Place here your custom code!

  // Do not touch the following lines
  await fastify.register(configPlugin)
  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    ignorePattern: /.*(config).*/,
    options: { ...opts, dependencies: ['config'] },
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
  // TODO USE https://github.com/fastify/env-schema
  // // 0.0.0.0 is required for docker

}

export default app
export { app }
