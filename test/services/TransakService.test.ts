import Fastify, { FastifyInstance } from 'fastify'
import JWT from 'jsonwebtoken'
import waitFor from 'wait-for-expect'
import Pusher from 'pusher-js'
import { TransakEventStatus } from '../../src/services/types'
import { buildFakeTransakOrder, WalletRepoUtils } from '../models/utils'

import { TransakOrderStatus } from '../../src/services/types'
import { sendGas } from '../../src/utils/sendGas'
import { transferToken } from '../../src/utils/transferToken'
import { waitReceipt } from '../../src/utils/waitReceipt'
import { GAS_REQUIRED } from '../../src/services/utils'
import { PusherMockImplementation } from '../PusherMock'
import { formatUnits, parseUnits } from 'ethers/lib/utils'
import boot from '../../src/app'

jest.mock('pusher-js')
jest.mock('../../src/utils/sendGas')
jest.mock('../../src/utils/transferToken')
jest.mock('../../src/utils/waitReceipt')
jest.mock('jsonwebtoken')

const sendGasMock = sendGas as jest.MockedFunction<typeof sendGas>
const transferTokenMock = transferToken as jest.MockedFunction<
  typeof transferToken
>
const waitTransactionMock = waitReceipt as jest.MockedFunction<
  typeof waitReceipt
>
const PusherMock = (Pusher as unknown) as jest.Mock
const JWTMock = (JWT as unknown) as jest.Mocked<typeof JWT>

const MNEMONIC_MOCK =
  'stay apart adjust retire frame lumber usual amazing smoke worry outside wash'

async function build() {
  // const app = Fastify()
  //
  // // fastify-plugin ensures that all decorators
  // // are exposed for testing purposes, this is
  // // different from the production setup
  // void app.register(fp(App))
  const app = await boot()
  await app.ready()

  return app
}

describe('TransakService', () => {
  let app: FastifyInstance
  let walletAddress: string
  let pusher: PusherMockImplementation

  const orderMock = buildFakeTransakOrder({
    id: '123',
    status: TransakOrderStatus.Completed,
    cryptoAmount: 50.01,
    walletAddress: '0x27357319d22757483e1f64330068796E21C9b6ab',
  })

  beforeAll(async () => {
    pusher = new PusherMockImplementation('apiKey', {
      cluster: 'ap2',
    })
    PusherMock.mockImplementation(() => pusher)
    JWTMock.verify.mockImplementation(() => orderMock)

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

  it('receives an order for ethereum', async () => {
    const order = JWT.sign(
      buildFakeTransakOrder({
        status: TransakEventStatus.Completed,
      }),
      'secret'
    )

    pusher.global_emitter.emit(TransakEventStatus.Completed, order)

    await waitFor(() => {
      expect(transferTokenMock).toHaveBeenCalledWith({
        to: '0x27357319d22757483e1f64330068796E21C9b6ab',
        amount: parseUnits(orderMock.cryptoAmount.toString(), 18).toString(),
        asset: app.config.KOVAN_TEST_ASSET,
        nonceManager: expect.anything(),
        logger: expect.anything(),
      })
      expect(sendGasMock).toHaveBeenCalledWith({
        to: '0x27357319d22757483e1f64330068796E21C9b6ab',
        value: GAS_REQUIRED,
        nonceManager: expect.anything(),
        logger: expect.anything(),
      })
      expect(waitTransactionMock).toHaveBeenCalledTimes(2)
    })
  })
})
