import { join } from 'path'
import AutoLoad, { AutoloadPluginOptions } from 'fastify-autoload'
import createFastify, { FastifyPluginAsync, LogLevel } from 'fastify'
import configPlugin from './plugins/config'

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

async function booter() {
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
          return { level: label, severity, ...typeProp }
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

  server.listen(server.config.PORT, server.config.BINDING,(err, address) => {
    if (err) {
      console.error(err)
      process.exit(1)
    }
    console.log(`Server listening at ${address}`)
  })
}
booter()
