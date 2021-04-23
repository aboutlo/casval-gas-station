import { FastifyPluginAsync, RequestGenericInterface } from 'fastify'
import { Wallet } from 'ethers'
import { formatEther } from 'ethers/lib/utils'
import { BaseProvider } from '@ethersproject/providers'
import { Network } from '../../plugins/providers'

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
  networks: Network[],
  providers: { [key: string]: BaseProvider }
) =>
  Promise.all(
    networks.map((network) => {
      const provider = providers[network]
      const localWallet = new Wallet(wallet.privateKey, provider)
      return localWallet.getBalance().then((balance) => ({
        [network]: { GAS: formatEther(balance) },
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
    return toBalance(wallet, fastify.config.NETWORKS, fastify.providers)
  })
  fastify.delete<DeleteRequest>('/:id', async function (request, reply) {
    const { id } = request.params
    return fastify.repos.walletRepo.delete(id)
  })
  fastify.get<FindRequest>('/:id', async function (request, reply) {
    const wallet = fastify.repos.walletRepo.find(request.params.id) as Wallet
    return toBalance(wallet, fastify.config.NETWORKS, fastify.providers)
  })
  fastify.get('', async function (request, reply) {
    const address = fastify.repos.walletRepo
      .findAll()
      .map((wallet: Wallet) => wallet.address)
    fastify.log.info({address}, 'findAll')
    return Promise.all(
      fastify.repos.walletRepo
        .findAll()
        .map((wallet: Wallet) =>
          toBalance(wallet, fastify.config.NETWORKS, fastify.providers)
        )
    )
  })
}

export default wallets
