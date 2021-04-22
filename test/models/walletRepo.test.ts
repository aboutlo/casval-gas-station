import { Wallet as EtherWallet } from 'ethers'
import { BigNumber } from '@ethersproject/bignumber'
import { JsonRpcProvider } from '@ethersproject/providers'
import { WalletRepo } from '../../src/models/WalletRepo'
import { mocked } from 'ts-jest/utils'

jest.mock('ethers')
jest.mock('@ethersproject/providers')

const WalletMock = EtherWallet as jest.Mocked<typeof EtherWallet>
const ProviderMock = mocked(JsonRpcProvider)

describe('WalletRepoUtils', () => {
  let mnemonic: string
  const addressMock = '0x27357319d22757483e1f64330068796E21C9b6ab'
  const balanceMock = BigNumber.from('10')

  beforeAll(() => {
    mnemonic =
      'stay apart adjust retire frame lumber usual amazing smoke worry outside wash'
  })
  beforeEach(() => {
    WalletMock.fromMnemonic = jest.fn().mockImplementation(() => WalletMock)
    WalletMock.prototype.getBalance = jest.fn().mockImplementation(() => {
      return Promise.resolve(BigNumber.from('10'))
    })
  })
  it('is defined', () => {

    expect(new WalletRepo()).toBeInstanceOf(WalletRepo)
  })

  it('adds one', () => {
    expect.assertions(1)
    const repo = new WalletRepo()
    const wallet = repo.create(mnemonic)
    expect(wallet).toBeInstanceOf(WalletMock)
  })

  it('finds one', () => {
    expect.assertions(1)
    const walletRepo = new WalletRepo()
    const wallet = walletRepo.create(mnemonic)
    expect(walletRepo.find(wallet.address)).toBeInstanceOf(WalletMock)
  })

  it('finds all', () => {
    const walletRepo = new WalletRepo()
    walletRepo.create(mnemonic)
    const wallets = walletRepo.findAll()
    expect(wallets).toHaveLength(1)
    expect(wallets[0]).toBeInstanceOf(WalletMock)
  })
})
