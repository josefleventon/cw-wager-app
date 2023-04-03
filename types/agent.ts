import { Currency, NFT, WagerExport } from './Wager.types'

interface Price {
  readonly denom: string
  readonly price: number
}

export interface Change {
  readonly denom: string
  readonly change: number
}

export interface Job {
  wagers: {
    token: NFT
    currency: Currency
  }[]
  expires_at: string
  amount: string
  prev_prices: [Price, Price]
  current_prices: [Price, Price]
  change: [Change, Change]
  current_winner: NFT | null
}
