import { StargazeClient } from 'client/core'
import chainInfo from './ChainInfo'

import { CONTRACT_ADDRESS } from 'util/constants'

const client = new StargazeClient({
  wallet: null,
  signingCosmWasmClient: null,
  wagerContract: CONTRACT_ADDRESS,
  chainInfo,
})

export default client
