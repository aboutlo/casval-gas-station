import { FastifyInstance } from 'fastify'

export const WalletRepoUtils = {
  findAll: async (app: FastifyInstance) => {
    return app
      .inject({
        method: 'GET',
        url: '/wallets',
      })
      // .then((response) => response.json())
  },
  create: async (
    app: FastifyInstance,
    payload: { mnemonic: string; path?: string }
  ) => {
    return app
      .inject({
        method: 'POST',
        url: '/wallets',
        headers: {
          'content-type': 'application/json',
        },
        payload: JSON.stringify(payload),
      })
      // .then((response) => response.json())
  },

  delete: async (app: FastifyInstance, address: string) => {
    return app
      .inject({
        method: 'DELETE',
        url: `/wallets/${address}`,
        headers: {
          'content-type': 'application/json',
        },
      })
      // .then((response) => response.json())
  },
}
