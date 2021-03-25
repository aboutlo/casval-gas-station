import { FastifyPluginAsync, RequestGenericInterface } from 'fastify'
import { Wallet } from 'ethers'
import { formatEther } from 'ethers/lib/utils'

// import { WalletRepo } from '../../models/WalletRepo'

// const walletRepo = new WalletRepo()

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

const toBalance = (wallet: Wallet) =>
  wallet.getBalance().then((balance) => ({
    [wallet.address]: { eth: formatEther(balance) },
  }))

const wallets: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post<PostRequest>('', async function (request, reply) {
    const { mnemonic, path } = request.body
    const wallet = fastify.repos.walletRepo.create(mnemonic, path)
    return toBalance(wallet)
  })
  fastify.delete<DeleteRequest>('/:id', async function (request, reply) {
    const { id } = request.params
    return fastify.repos.walletRepo.delete(id)
  })
  fastify.get<FindRequest>('/:id', async function (request, reply) {
    const wallet = fastify.repos.walletRepo.find(request.params.id) as Wallet
    return toBalance(wallet)
  })
  fastify.get('', async function (request, reply) {
    return Promise.all(fastify.repos.walletRepo.findAll().map(toBalance))
  })
}

export default wallets
