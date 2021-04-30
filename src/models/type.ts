export enum Network {
  Mainnet = 'mainnet', // Ethereum,
  Kovan = 'kovan',
  Mumbai = 'mumbai',
  Polygon = 'polygon',
}

export enum ChainId {
  Ethereum = 1, // Ethereum,
  Kovan = 42,
  Mumbai = 80001,
  Polygon = 137,
}

export type Chain = {
  name: string
  chainId: number
  shortName: string
  chain: string
  network: string
  networkId: number
  nativeCurrency: {
    name: string
    symbol: string
    decimals: number
  }
}
