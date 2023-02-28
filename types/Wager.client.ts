import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate'
import {
  WagersResponse,
  WagerResponse,
  ConfigResponse,
  TokenStatusResponse,
  Token,
} from './Wager.types'

export interface WagerReadOnlyInterface {
  contractAddress: string
  wagers: () => Promise<WagersResponse>
  wager: ({ token }: { token: Token }) => Promise<WagerResponse>
  tokenStatus: ({ token }: { token: Token }) => Promise<TokenStatusResponse>
  config: () => Promise<ConfigResponse>
}

export class WagerQueryClient implements WagerReadOnlyInterface {
  client: CosmWasmClient
  contractAddress: string

  constructor(client: CosmWasmClient, contractAddress: string) {
    this.client = client
    this.contractAddress = contractAddress
    this.wagers = this.wagers.bind(this)
    this.wager = this.wager.bind(this)
    this.tokenStatus = this.tokenStatus.bind(this)
    this.config = this.config.bind(this)
  }

  wagers = async (): Promise<WagersResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      wagers: {},
    })
  }

  wager = async ({ token }: { token: Token }): Promise<WagerResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      wager: {
        token,
      },
    })
  }

  tokenStatus = async ({
    token,
  }: {
    token: Token
  }): Promise<TokenStatusResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      token_status: {
        token,
      },
    })
  }

  config = async (): Promise<ConfigResponse> => {
    return this.client.queryContractSmart(this.contractAddress, {
      config: {},
    })
  }
}
