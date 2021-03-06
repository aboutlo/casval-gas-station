import { join } from 'path'
import AutoLoad, { AutoloadPluginOptions } from 'fastify-autoload'
import createFastify, { FastifyPluginAsync, LogLevel } from 'fastify'
import configPlugin from './plugins/config'
import printRoutes from 'fastify-print-routes'

export type AppOptions = {
  logger: {
    level: string
    formatters: { [key: string]: any }
  }
} & Partial<AutoloadPluginOptions>

const start: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
  // Do not touch the following lines
  await fastify.register(configPlugin)
  await fastify.register(printRoutes)
  // This loads all plugins defined in plugins
  // those should be support plugins that are reused
  // through your application
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'plugins'),
    ignorePattern: /.*(config|test).*/,
    options: { ...opts, dependencies: ['config'] },
  })

  // This loads all plugins defined in routes
  // define your routes in one of these
  // FIXME LS move plugins in a different directory and drop this autoload
  // void fastify.register(AutoLoad, {
  //   dir: join(__dirname, 'services'),
  //   ignorePattern: /.*(types|utils|orders|Refills|OrderService).*/,
  //   options: opts,
  // })

  // This loads all plugins defined in routes
  // define your routes in one of these
  void fastify.register(AutoLoad, {
    dir: join(__dirname, 'routes'),
    options: opts,
  })

}

export async function boot() {
  // Map Pino levels to Google Cloud Logging severity levels
  // https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity
  const levelToSeverity = {
    trace: 'DEBUG',
    debug: 'DEBUG',
    info: 'INFO',
    warn: 'WARNING',
    error: 'ERROR',
    fatal: 'CRITICAL',
  }

  const opts = {
    logger: {
      level: process.env.LOG_LEVEL?.toLowerCase() || 'info',
      formatters: {
        level(label: string) {
          const pinoLevel = label as LogLevel
          // @ts-ignore
          const severity = levelToSeverity[pinoLevel]
          // `@type` property tells Error Reporting to track even if there is no `stack_trace`
          const typeProp =
            pinoLevel === 'error' || pinoLevel === 'fatal'
              ? {
                  '@type':
                    'type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent',
                }
              : {}
          // return { level: label, severity, ...typeProp }
          return { severity, ...typeProp }
        },
        log(object: any) {
          const logObject = object as { err?: Error }
          const stackProp = logObject?.err?.stack
            ? { stack_trace: logObject.err.stack }
            : {}

          return {
            ...object,
            ...stackProp,
          }
        },
      },
    },
  }
  const server = createFastify(opts)
  await start(server, opts)

  server.listen(server.config.PORT, server.config.BINDING, (err, address) => {
    if (err) {
      console.log(err)
      process.exit(1)
    }
    // console.log(`Server listening at ${address}`)
  })
  return server
}
export default boot
