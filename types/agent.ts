import { NFT, WagerExport } from './Wager.types'

interface Price {
  readonly denom: string
  readonly price: number
}

export interface Change {
  readonly denom: string
  readonly change: number
}

export interface Job {
  wager: WagerExport
  prices: [Price, Price]
}

export interface JobDetail {
  wager: Job['wager']
  prev_prices: Job['prices']
  current_prices: Job['prices']
  change: [Change, Change]
  current_winner: NFT | null
}
