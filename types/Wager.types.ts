export type Uint128 = string
export interface Coin {
  amount: Uint128
  denom: string
  [k: string]: unknown
}
export interface InstantiateMsg {
  amounts: Uint128[]
  collection_address: string
  expiries: number[]
  fairburn_bps: number
  fee_address: string
  fee_bps: number
  matchmaking_expiry: number
  max_currencies: number
}
export type ExecuteMsg =
  | {
      update_config: {
        params: ParamInfo
      }
    }
  | {
      set_winner: {
        current_prices: [Decimal, Decimal]
        prev_prices: [Decimal, Decimal]
        wager_key: [[Addr, number], [Addr, number]]
      }
    }
  | {
      wager: {
        against_currencies: Currency[]
        currency: Currency
        expiry: number
        token: [Addr, number]
      }
    }
  | {
      cancel: {
        token: [Addr, number]
      }
    }
export type Addr = string
export type Currency =
  | 'dot'
  | 'avax'
  | 'uni'
  | 'atom'
  | 'link'
  | 'near'
  | 'icp'
  | 'sand'
  | 'btc'
  | 'eth'
  | 'bnb'
  | 'xrp'
  | 'ada'
  | 'doge'
  | 'sol'
  | 'mana'
  | 'cake'
  | 'ar'
  | 'osmo'
  | 'rune'
  | 'luna'
  | 'ustc'
  | 'stars'
  | 'mir'
export const currencies = [
  'dot',
  'avax',
  'uni',
  'atom',
  'link',
  'near',
  'icp',
  'sand',
  'btc',
  'eth',
  'bnb',
  'xrp',
  'ada',
  'doge',
  'sol',
  'mana',
  'cake',
  'ar',
  'osmo',
  'rune',
  'luna',
  'ustc',
  'stars',
  'mir',
]
export interface ParamInfo {
  amounts?: Uint128[] | null
  collection_address?: string | null
  expiries?: number[] | null
  fairburn_bps?: number | null
  fee_address?: string | null
  fee_bps?: number | null
  matchmaking_expiry?: number | null
  max_currencies?: number | null
}
export type QueryMsg =
  | {
      wagers: {}
    }
  | {
      wager: {
        token: [Addr, number]
      }
    }
  | {
      token_status: {
        token: [Addr, number]
      }
    }
  | {
      config: {}
    }
export type Decimal = string
export type Token = [Addr, number]
export interface ConfigResponse {
  config: Config
}
export interface Config {
  amounts: Uint128[]
  collection_address: Addr
  expiries: number[]
  fairburn_percent: Decimal
  fee_address: Addr
  fee_percent: Decimal
  matchmaking_expiry: number
  max_currencies: number
}
export type TokenStatus =
  | 'none'
  | {
      matchmaking: MatchmakingItemExport
    }
  | {
      wager: WagerExport
    }
export type Timestamp = Uint64
export type Uint64 = string
export interface TokenStatusResponse {
  token_status: TokenStatus
}
export interface MatchmakingItemExport {
  against_currencies: Currency[]
  amount: Uint128
  currency: Currency
  expires_at: Timestamp
  expiry: number
  token: NFT
}
export interface NFT {
  collection: Addr
  token_id: number
}
export interface WagerExport {
  amount: Uint128
  expires_at: Timestamp
  wagers: [WagerInfo, WagerInfo]
}
export interface WagerInfo {
  currency: Currency
  token: NFT
}
export interface WagerResponse {
  wager: WagerExport
}
export interface WagersResponse {
  wagers: WagerExport[]
}
