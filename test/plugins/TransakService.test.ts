import Fastify, { FastifyInstance } from 'fastify'
import JWT from 'jsonwebtoken'
import waitFor from 'wait-for-expect'
import Pusher from 'pusher-js'
import { TransakEventStatus } from '../../src/services/types'
import fp from 'fastify-plugin'
import App from '../../src/app'
import { WalletRepoUtils } from '../models/utils'

import { TransakOrderStatus } from '../../src/services/types'
import { sendGas } from '../../src/utils'
import { MINIMUM_INVEST_GAS } from '../../src/services/utils'
import { PusherMockImplementation } from '../PusherMock'

jest.mock('pusher-js')
jest.mock('../../src/utils')
jest.mock('jsonwebtoken')

const sendGasMock = sendGas as jest.MockedFunction<typeof sendGas>
// const PusherMock = Pusher as jest.Mocked<typeof Pusher>
const PusherMock = (Pusher as unknown) as jest.Mock
const JWTMock = (JWT as unknown) as jest.Mocked<typeof JWT>

const MNEMONIC_MOCK =
  'stay apart adjust retire frame lumber usual amazing smoke worry outside wash'

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
  let walletAddress: string
  let pusher: PusherMockImplementation

  beforeAll(async () => {
    pusher = new PusherMockImplementation('apiKey', {
      cluster: 'ap2',
    })
    PusherMock.mockImplementation(() => pusher)
    JWTMock.verify.mockImplementation(() => ({
      id: 123,
      status: TransakOrderStatus.Completed,
      walletAddress: '0x27357319d22757483e1f64330068796E21C9b6ab',
    }))

    app = await build()
    const response = await WalletRepoUtils.create(app, {
      mnemonic: MNEMONIC_MOCK,
    })
    const wallet = response.json()
    const [walletId] = Object.keys(wallet)
    walletAddress = walletId
  })

  afterAll(async () => {
    await app.close()
    await WalletRepoUtils.delete(app, walletAddress)
  })

  it('receives an order', async () => {
    const order = JWT.sign({ id: '123' }, 'secret')

    pusher.global_emitter.emit(TransakEventStatus.Completed, order)

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
