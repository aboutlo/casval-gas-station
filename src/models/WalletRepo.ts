import { Wallet as EtherWallet, getDefaultProvider } from 'ethers'
import { CONFIG } from '../config'
const DEFAULT_DERIVATION_PATH = `m/44'/60'/0'/0/0`

interface Repo<T> {
  // create: (payload: Partial<T>) => T
}

export class WalletRepo implements Repo<any> {
  private storage: Map<string, EtherWallet>

  constructor() {
    this.storage = new Map()
  }

  create(mnemonic: string, path = DEFAULT_DERIVATION_PATH) {
    const wallet = EtherWallet.fromMnemonic(mnemonic, path)
    const provider = getDefaultProvider(CONFIG.network, {
      etherscan: CONFIG.etherscan[CONFIG.network].apiKey,
      infura: CONFIG.infura.apiKey,
      alchemy: CONFIG.alchemy.apiKey,
    })
    this.storage.set(
      wallet.address,
      new EtherWallet(wallet.privateKey, provider)
    )
    return this.find(wallet.address)
  }

  // async find(address: string) {
  //   const wallet = this.storage.get(address)
  //   if (!wallet) throw new Error(`WalletRepo ${address} not founds`)
  //   return wallet.getBalance().then((balance) => {
  //     return { [address]: balance.toString() }
  //   })
  // }

  find(address: string) {
    const wallet = this.storage.get(address)
    if (!wallet) throw new Error(`Wallet ${address} not founds`)
    return wallet
  }

  findAll(): EtherWallet[] {
    return Array.from(this.storage.entries()).map(([key, wallet]) => wallet)
  }

  delete(address: string) {
    const wallet = this.storage.get(address)
    if (!wallet) throw new Error(`Wallet ${address} not founds`)
    return this.storage.delete(address)
  }

  clear() {
    return this.storage.clear()
  }
}
