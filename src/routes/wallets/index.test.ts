import Fastify, { FastifyInstance } from 'fastify'
import { WalletRepoUtils } from '../../test/utils'
import boot from '../../app'

const MNEMONIC =
  'stay apart adjust retire frame lumber usual amazing smoke worry outside wash'

const DEFAULT_ADDRESS = '0x27357319d22757483e1f64330068796E21C9b6ab'

async function config() {
  return {}
}

async function build() {
  // const app = Fastify()
  //
  // // fastify-plugin ensures that all decorators
  // // are exposed for testing purposes, this is
  // // different from the production setup
  // void app.register(fp(App))
  //
  // await app.ready()
  //
  // return app
  const app = await boot()
  await app.ready()

  return app
}

describe('Wallets', () => {
  let app: FastifyInstance
  let ids: string[] = []

  beforeAll(async () => {
    app = await build()
    // const wallets = await WalletRepoUtils.findAll(app)
    // return Promise.all(
    //   wallets
    //     .json()
    //     .map((wallet: any) =>
    //       WalletRepoUtils.delete(app, Object.keys(wallet)[0])
    //     )
    // )
  })

  afterAll(() => {
    app.close()
  })

  afterEach(async () => {
    return Promise.all(ids.map((id) => WalletRepoUtils.delete(app, id))).then(
      () => {
        ids = []
      }
    )
  })

  describe('wallets', () => {
    it('creates a wallet', async () => {
      expect.assertions(1)
      const response = await WalletRepoUtils.create(app, {
        mnemonic: MNEMONIC,
      })
      const wallet = response.json<any>()
      const [address] = Object.keys(wallet)
      ids.push(address)
      expect(wallet).toEqual({
        [address]: {
          kov: { GAS: '0.0' },
          maticmum: { GAS: '0.0' },
        },
      })
    })

    it('returns a list of wallets', async () => {
      const response = await WalletRepoUtils.create(app, { mnemonic: MNEMONIC })
      const wallet = response.json<any>()
      const [address] = Object.keys(wallet)
      ids.push(address)
      const responses = await WalletRepoUtils.findAll(app)
      const wallets = responses.json<any>()
      expect(wallets).toEqual([
        {
          [address]: {
            kov: { GAS: '0.0' },
            maticmum: { GAS: '0.0' },
          },
        },
      ])
    })
  })
})
