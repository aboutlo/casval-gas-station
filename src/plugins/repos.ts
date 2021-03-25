import fp from 'fastify-plugin'
import { WalletRepo } from '../models/WalletRepo'
import { getDefaultProvider } from 'ethers'
import transferToken from '../utils/transferToken'

export interface SupportPluginOptions {
  // Specify Support plugin options here
}

// The use of fastify-plugin is required to be able
// to export the decorators to the outer scope
export default fp<SupportPluginOptions>(async (fastify, opts) => {
  const {
    NETWORK,
    ALCHEMY_APY_KEY,
    INFURA_APY_KEY,
    ETHERSCAN_APY_KEY,
    KOVAN_TEST_ASSET,
  } = fastify.config

  const provider = getDefaultProvider(NETWORK, {
    etherscan: ETHERSCAN_APY_KEY,
    infura: INFURA_APY_KEY,
    alchemy: ALCHEMY_APY_KEY,
  })

  const walletRepo = new WalletRepo(provider)
  if (fastify.config.DEFAULT_WALLET_MNEMONIC) {
    fastify.log.info('Setting default wallet...')
    walletRepo.create(fastify.config.DEFAULT_WALLET_MNEMONIC)
    // FIXME LS remove it. I used just for a quick test 
    // const wallet = walletRepo.create(fastify.config.DEFAULT_WALLET_MNEMONIC)
    // fastify.log.info('sending...')
    // await transferToken({
    //   wallet,
    //   to: '0xCD2F256Ca12b5919c08c51EAA4aA3ce1ce35B0c8',
    //   amount: '1.0',
    //   asset: KOVAN_TEST_ASSET,
    //   logger: fastify.log,
    // })
  }
  fastify.decorate('repos', {
    walletRepo,
  })
})

// When using .decorate you have to specify added properties for Typescript
declare module 'fastify' {
  export interface FastifyInstance {
    repos: { [key: string]: any }
  }
}
