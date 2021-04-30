import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

// https://chainid.network/chains/
async function main() {
  return prisma.$transaction(
    [
      {
        symbol: 'EUR',
        name: 'Euro', // Euro, Multicollateral DAI
        decimals: 0, // 18 DAI, 6 USDC, 6 USD, 6 EUR, 6 GBP
        address: null,
        network: null, // EthereumMainnet
        chainId: null, // 42 Kovan
        chain: null, // Ethereum
      },
      {
        symbol: 'GPB',
        name: 'British pound ',
        decimals: 0,
        address: null,
        network: null,
        chainId: null,
        chain: null,
      },
      {
        symbol: 'USD',
        name: 'USA Dollar ',
        decimals: 0,
        address: null,
        network: null,
        chainId: null,
        chain: null,
      },
      {
        symbol: 'DAI',
        name: 'Multicolateral DAI ',
        decimals: 18,
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        network: 'mainnet',
        chainId: 1,
        chain: 'Ethereum',
      },
      {
        symbol: 'DAI',
        name: 'Multicolateral DAI ',
        decimals: 18,
        address: '0x6b175474e89094c44da98b954eedeac495271d0f',
        network: 'kovan',
        chainId: 42,
        chain: 'Ethereum',
      },
      {
        symbol: 'DAI',
        name: 'Multicolateral DAI ',
        decimals: 18,
        address: '0x6a383cf1f8897585718dca629a8f1471339abfe4',
        network: 'mumbai',
        chainId: 80001,
        chain: 'Matic',
      },
      {
        symbol: 'DAI',
        name: 'Multicolateral DAI ',
        decimals: 18,
        address: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        network: 'mainnet',
        chainId: 137,
        chain: 'Matic',
      },
    ].map(({ symbol, name, decimals, address, network, chainId, chain }) => {
      const id = symbol + (chainId ? `@${chainId}` : '') //  symbol@chainId
      // const id = 'boom!'
      console.log('adding', { id, chain })
      const update = {
        symbol,
        name,
        decimals,
        address,
        network,
        chainId,
        chain,
      }
      return prisma.currency.upsert({
        where: { id },
        update,
        create: {
          ...update,
          id,
        },
      })
    })
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
