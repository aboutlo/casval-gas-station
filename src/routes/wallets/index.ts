import { FastifyPluginAsync, RequestGenericInterface } from 'fastify'

// import { Wallet } from '../../models/Wallet'

// const walletRepo = new Wallet()

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
    return fastify.repos.walletRepo.find(request.params.id)
  })
  fastify.get('', async function (request, reply) {
    return fastify.repos.walletRepo.findAll()
  })
}

export default wallets
