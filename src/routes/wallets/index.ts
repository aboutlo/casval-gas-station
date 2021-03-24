import { FastifyPluginAsync, RequestGenericInterface } from 'fastify'
import { Wallet } from 'ethers'

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
    [wallet.address]: balance.toString(),
  }))

const wallets: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.post<PostRequest>('', async function (request, reply) {
    const { mnemonic, path } = request.body
    return fastify.repos.walletRepo.create(mnemonic, path)
  })
  fastify.delete<DeleteRequest>('/:id', async function (request, reply) {
    const { id } = request.params
    return fastify.repos.walletRepo.delete(id)
  })
  fastify.get<FindRequest>('/:id', async function (request, reply) {
    console.log('params:', request.params)
    const wallet = fastify.repos.walletRepo.find(request.params.id) as Wallet
    console.log('find:', wallet.address)
    return toBalance(wallet)
  })
  fastify.get('', async function (request, reply) {
    return Promise.all(fastify.repos.walletRepo.findAll().map(toBalance))
  })
}

export default wallets
