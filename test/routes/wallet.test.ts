import Fastify, { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'
import App from '../../src/app'

const MNEMONIC =
  'stay apart adjust retire frame lumber usual amazing smoke worry outside wash'

const DEFAULT_ADDRESS = '0x27357319d22757483e1f64330068796E21C9b6ab'

async function config() {
  return {}
}

async function build() {
  const app = Fastify()

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  void app.register(fp(App), await config())

  await app.ready()

  return app
}

const Wallet = {
  findAll: async (app: FastifyInstance) => {
    return app.inject({
      method: 'GET',
      url: '/wallets',
    })
  },
  create: async (
    app: FastifyInstance,
    payload: { mnemonic: string; path?: string }
  ) => {
    return app.inject({
      method: 'POST',
      url: '/wallets',
      headers: {
        'content-type': 'application/json',
      },
      payload: JSON.stringify(payload),
    })
  },

  delete: async (app: FastifyInstance, address: string) => {
    return app.inject({
      method: 'DELETE',
      url: `/wallets/${address}`,
      headers: {
        'content-type': 'application/json',
      },
    })
  },
}

describe('App', () => {
  let app: FastifyInstance
  let ids: string[] = []
  beforeAll(async () => {
    app = await build()
    const wallets = await Wallet.findAll(app)
    return Promise.all(
      wallets.json().map((wallet: any) => Wallet.delete(app, Object.keys(wallet)[0]))
    )
  })
  afterAll(() => {
    app.close()
  })
  afterEach(async () => {
    return Promise.all(ids.map((id) => Wallet.delete(app, id))).then(() => {
      ids = []
    })
  })
  describe('wallets', () => {
    it('creates a wallet', async () => {
      expect.assertions(1)
      const response = await Wallet.create(app, {
        mnemonic: MNEMONIC,
      })
      const json = response.json()
      ids.push(json.address)
      expect({ address: json.address }).toEqual({ address: DEFAULT_ADDRESS })
    })

    it('returns a list of wallets', async () => {
      const response = await Wallet.create(app, { mnemonic: MNEMONIC })
      const { address } = response.json()
      ids.push(address)
      const wallets = await Wallet.findAll(app)
      expect(wallets.json()).toEqual([{ [address]: '0' }])
    })
  })
})
