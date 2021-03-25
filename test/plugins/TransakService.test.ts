import Fastify, { FastifyInstance } from 'fastify'
import jwt from 'jsonwebtoken'
import waitFor from 'wait-for-expect'
import Pusher from 'pusher-js'
import { TransakEventStatus } from '../../src/services/types'
import fp from 'fastify-plugin'
import App from '../../src/app'
import { WalletRepoUtils } from '../models/utils'
import { CONFIG } from '../../src/config'
import { TransakOrderStatus } from '../../src/services/types'
import { sendGas } from '../../src/utils'
import { MINIMUM_INVEST_GAS } from '../../src/services/utils'

jest.mock('pusher-js', () => {
  const Pusher = require('pusher-js-mock').PusherMock
  return Pusher
})
jest.mock('../../src/utils')

const sendGasMock = sendGas as jest.MockedFunction<typeof sendGas>

const MNEMONIC =
  'stay apart adjust retire frame lumber usual amazing smoke worry outside wash'

const DEFAULT_ADDRESS = '0x27357319d22757483e1f64330068796E21C9b6ab'

async function build() {
  const app = Fastify()

  // fastify-plugin ensures that all decorators
  // are exposed for testing purposes, this is
  // different from the production setup
  void app.register(fp(App))

  await app.ready()

  return app
}

describe('TransakService', () => {
  let app: FastifyInstance

  beforeAll(async () => {
    app = await build()
    const wallets = await WalletRepoUtils.findAll(app)
    await Promise.all(
      wallets
        .json()
        .map((wallet: any) =>
          WalletRepoUtils.delete(app, Object.keys(wallet)[0])
        )
    )
    await WalletRepoUtils.create(app, { mnemonic: MNEMONIC })
  })

  afterAll(() => {
    app.close()
  })

  it('receives an order', async () => {
    const configs = CONFIG.transak[CONFIG.network]
    const pusher = new Pusher(configs.pusherApiKey, {
      cluster: 'ap2',
    })

    const channel = pusher.subscribe(configs.apiKey)
    // channel.bind(TransakEventStatus.Completed, listener)
    const order = jwt.sign(
      {
        id: 123,
        status: TransakOrderStatus.Completed,
        walletAddress: '0x27357319d22757483e1f64330068796E21C9b6ab',
      },
      configs.secret
    )

    channel.emit(TransakEventStatus.Completed, order)

    await waitFor(() => {
      expect(sendGasMock).toHaveBeenCalledWith({
        to: '0x27357319d22757483e1f64330068796E21C9b6ab',
        value: MINIMUM_INVEST_GAS,
        wallet: expect.anything(),
        logger: expect.anything(),
      })
    })
  })
})
