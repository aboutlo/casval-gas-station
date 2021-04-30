import { mocked } from 'ts-jest/utils'
import { Wallet } from 'ethers'

import { TransakOrderStatus } from './types'
import { sendGas } from '../utils/sendGas'
import { transferToken } from '../utils/transferToken'
import { GAS_REQUIRED, processOrderComplete } from './utils'
import { BigNumber } from '@ethersproject/bignumber'
import { parseUnits } from 'ethers/lib/utils'
import { NonceManager } from '@ethersproject/experimental'
import { TransakOrder } from './types'
import { buildFakeTransakOrder } from '../test/utils'
import { ChainId, Network } from '../models/type'

jest.mock('../../src/utils/sendGas')
jest.mock('../../src/utils/transferToken')
jest.mock('ethers')

const walletMock = mocked(Wallet)
const nonceManagerMock = mocked(NonceManager)
const sendGasMock = sendGas as jest.MockedFunction<typeof sendGas>
const transferTokenMock = transferToken as jest.MockedFunction<
  typeof transferToken
>

describe('processOrderComplete', () => {
  const assetAddressMock = '0x001'
  const orderMock = buildFakeTransakOrder({
    id: '123',
    status: TransakOrderStatus.Completed,
    cryptoAmount: 50.01,
    walletAddress: '0x27357319d22757483e1f64330068796E21C9b6ab',
  })

  it('sends gas', async () => {
    walletMock.mockImplementation(() => {
      return {
        provider: {
          getBalance: jest
            .fn()
            .mockReturnValue(Promise.resolve(BigNumber.from('0'))),
        },
      } as any
    })

    nonceManagerMock.mockImplementation(() => {
      return {
        signer: {
          address: '0x1111',
        },
        provider: {
          getBalance: jest
            .fn()
            .mockReturnValue(Promise.resolve(BigNumber.from('0'))),
        },
      } as any
    })

    const loggerInstance: any = jest.fn().mockImplementation(() => ({
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
    }))

    const nonceManager = new NonceManager(new Wallet('0x007'))

    await expect(
      processOrderComplete({
        order: orderMock,
        nonceManager,
        chainIds: [ChainId.Kovan],
        logger: loggerInstance(),
        asset: assetAddressMock,
      })
    ).resolves.toEqual(true)

    expect(sendGasMock).toHaveBeenCalledWith({
      logger: expect.anything(),
      to: orderMock.walletAddress,
      value: GAS_REQUIRED,
      nonceManager: expect.anything(),
    })

    expect(transferTokenMock).toHaveBeenCalledWith({
      logger: expect.anything(),
      to: orderMock.walletAddress,
      asset: assetAddressMock,
      amount: parseUnits(orderMock.cryptoAmount.toString(), 18).toString(),
      // amount: orderMock.cryptoAmount.toFixed(2),
      nonceManager: expect.anything(),
    })
  })
})
