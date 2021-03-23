import { Wallet as EtherWallet, getDefaultProvider } from 'ethers'
import { CONFIG } from '../config'
const DEFAULT_DERIVATION_PATH = `m/44'/60'/0'/0/0`

export class Wallet {
  private storage: Map<string, EtherWallet>

  constructor() {
    this.storage = new Map()
  }

  async create(mnemonic: string, path = DEFAULT_DERIVATION_PATH) {
    const wallet = EtherWallet.fromMnemonic(mnemonic, path)
    const provider = getDefaultProvider(CONFIG.network, {
      etherscan: CONFIG.etherscan[CONFIG.network].apiKey,
      infura: CONFIG.infura.apiKey,
      alchemy: CONFIG.alchemy.apiKey,
    })
    // wallet.connect(
    //   getDefaultProvider(CONFIG.network, {
    //     etherscan: CONFIG.etherscan[CONFIG.network].apiKey,
    //     infura: CONFIG.infura.apiKey,
    //     alchemy: CONFIG.alchemy.apiKey,
    //   })
    // )
    this.storage.set(
      wallet.address,
      new EtherWallet(wallet.privateKey, provider)
    )
    return { address: wallet.address }
  }

  async find(address: string) {
    const wallet = this.storage.get(address)
    if (!wallet) throw new Error(`Wallet ${address} not founds`)
    return wallet.getBalance().then((balance) => {
      return { [address]: balance.toString() }
    })
  }

  async findAll() {
    const addresses = Array.from(this.storage.keys()).map((key) => key)
    return Promise.all(
      addresses.map((address) => {
        return this.find(address)
      })
    )
  }

  async delete(address: string) {
    const wallet = this.storage.get(address)
    if (!wallet) throw new Error(`Wallet ${address} not founds`)
    return this.storage.delete(address)
  }
}
