import { FastifyPluginAsync } from 'fastify'

const Transak: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  console.log('Transak start..')
  // TODO
  // https://www.fastify.io/docs/latest/Plugins-Guide/#distribution
  // find the first wallet with balance
  // start to watching events
  // send ether on ORDER_COMPLETE
}

export default Transak
// export class TransakService {
//   constructor() {
//
//   }
//   start() {
//
//   }
// }
