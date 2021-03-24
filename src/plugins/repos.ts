import fp from 'fastify-plugin'
import { Wallet } from '../models/Wallet'

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  fastify.decorate('repos', {
    walletRepo: new Wallet(),
  })
})

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    repos: { [key: string]: any }
  }
}
