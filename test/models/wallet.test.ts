import { Wallet as EtherWallet } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import { Wallet } from '../../src/models/Wallet'

jest.mock('ethers')

const WalletMock = EtherWallet as jest.Mocked<typeof EtherWallet>

describe('Wallet', () => {
  let mnemonic: string
  const addressMock = '0x27357319d22757483e1f64330068796E21C9b6ab'
  const balanceMock = BigNumber.from('10')

  beforeAll(() => {
    mnemonic =
      'stay apart adjust retire frame lumber usual amazing smoke worry outside wash'
  })
  beforeEach(() => {
    WalletMock.fromMnemonic = jest.fn().mockImplementation(() => ({
      address: addressMock,
      getBalance: jest.fn().mockImplementation(() => {
        return Promise.resolve(BigNumber.from('10'))
      }),
      connect: jest.fn(),
    }))
    WalletMock.prototype.getBalance = jest.fn().mockImplementation(async () => {
      return Promise.resolve(BigNumber.from('10'))
    })
  })
  it('is defined', () => {
    expect(new Wallet()).toBeInstanceOf(Wallet)
  })

  it('adds one', async () => {
    expect.assertions(1)
    const wallet = new Wallet()
    const address = await wallet.create(mnemonic)
    expect(address).toEqual({ address: addressMock })
  })

  it('finds one', async () => {
    expect.assertions(1)
    const walletRepo = new Wallet()
    const { address } = await walletRepo.create(mnemonic)
    const wallet = await walletRepo.find(address)
    expect(wallet).toEqual({ [addressMock]: balanceMock.toString() })
  })

  it('finds all', async () => {
    expect.assertions(1)
    const walletRepo = new Wallet()
    await walletRepo.create(mnemonic)
    const wallets = await walletRepo.findAll()
    expect(wallets).toEqual([{ [addressMock]: balanceMock.toString() }])
  })
})
