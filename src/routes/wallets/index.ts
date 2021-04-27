import { FastifyPluginAsync, RequestGenericInterface } from 'fastify'
import { Wallet } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { BaseProvider } from '@ethersproject/providers'
import { ChainId } from '../../models/type'
import chains from '../../models/chains.json'

interface FindRequest extends RequestGenericInterface {
  Params: {
    id: string
  }
}
interface DeleteRequest extends RequestGenericInterface {
  Params: {
    id: string
  }
}
interface PostRequest extends RequestGenericInterface {
  Body: {
    mnemonic: string
    path: string
  }
}

const toBalance = (
  wallet: Wallet,
  networks: ChainId[],
  providers: { [key: string]: BaseProvider }
) =>
  Promise.all(
    networks.map((chainId) => {
      const provider = providers[chainId]
      const localWallet = new Wallet(wallet.privateKey, provider)
      const chain = chains.find((c) => c.chainId === chainId)
      if (!chain)
        throw new Error(
          `Chain "${chainId}" not found in ${chains
            .map((c) => c.chainId)
            .join(', ')}`
        )
      return localWallet.getBalance().then((balance) => ({
        [chain.shortName]: { GAS: formatEther(balance) },
      }))
    })
  ).then((balances) => {
    return balances.reduce(
      (memo, item) => {
        return {
          [wallet.address]: {
            ...memo[wallet.address],
            ...item,
          },
        }
      },
      { [wallet.address]: {} }
    )
  })

const wallets: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post<PostRequest>('', async function (request, reply) {
    const { mnemonic, path } = request.body
    const wallet = fastify.repos.walletRepo.create(mnemonic, path)
    return toBalance(wallet, fastify.config.CHAIN_IDS, fastify.providers)
  })
  fastify.delete<DeleteRequest>('/:id', async function (request, reply) {
    const { id } = request.params
    return fastify.repos.walletRepo.delete(id)
  })
  fastify.get<FindRequest>('/:id', async function (request, reply) {
    const wallet = fastify.repos.walletRepo.find(request.params.id) as Wallet
    return toBalance(wallet, fastify.config.CHAIN_IDS, fastify.providers)
  })
  fastify.get('', async function (request, reply) {
    const address = fastify.repos.walletRepo
      .findAll()
      .map((wallet: Wallet) => wallet.address)
    fastify.log.info({ address }, 'findAll')
    return Promise.all(
      fastify.repos.walletRepo
        .findAll()
        .map((wallet: Wallet) =>
          toBalance(wallet, fastify.config.CHAIN_IDS, fastify.providers)
        )
    )
  })
}

export default wallets
