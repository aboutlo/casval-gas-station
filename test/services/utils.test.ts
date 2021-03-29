import { mocked } from 'ts-jest/utils'
import { Wallet } from 'ethers'

import { TransakOrderStatus } from '../../src/services/types'
import { sendGas } from '../../src/utils'
import { transferToken } from '../../src/utils/transferToken'
import { GAS_REQUIRED, processOrderComplete } from '../../src/services/utils'
import { BigNumber } from '@ethersproject/bignumber'

jest.mock('../../src/utils')
jest.mock('../../src/utils/transferToken')
jest.mock('ethers')

const walletMock = mocked(Wallet, true)
const sendGasMock = sendGas as jest.MockedFunction<typeof sendGas>
const transferTokenMock = transferToken as jest.MockedFunction<
  typeof transferToken
>

describe('processOrderComplete', () => {
  const assetAddressMock = '0x001'
  const orderMock: any = {
    id: '123',
    status: TransakOrderStatus.Completed,
    cryptoAmount: 50.01,
    walletAddress: '0x27357319d22757483e1f64330068796E21C9b6ab',
  }

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

    const loggerInstance: any = jest.fn().mockImplementation(() => ({
      info: jest.fn(),
      error: jest.fn(),
    }))
    await expect(
      processOrderComplete({
        order: orderMock,
        wallet: new Wallet('0x007'),
        network: 'kovan',
        logger: loggerInstance(),
        asset: assetAddressMock,
      })
    ).resolves.toEqual(true)
    expect(sendGasMock).toHaveBeenCalledWith({
      logger: expect.anything(),
      to: orderMock.walletAddress,
      value: GAS_REQUIRED,
      wallet: expect.anything(),
    })
    expect(transferTokenMock).toHaveBeenCalledWith({
      logger: expect.anything(),
      to: orderMock.walletAddress,
      asset: assetAddressMock,
      amount: orderMock.cryptoAmount.toFixed(2),
      wallet: expect.anything(),
    })
  })
})
