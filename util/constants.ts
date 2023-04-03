import { Coin } from 'cosmwasm'

export const microAmountMultiplier = 1_000_000

export const CHAIN = process.env.NEXT_PUBLIC_NETWORK!
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_WAGER_CONTRACT_ADDRESS!
export const COLLECTION_ADDRESS = process.env
  .NEXT_PUBLIC_COLLECTION_CONTRACT_ADDRESS!

export function humanize(coin: string): string {
  return (parseInt(coin) / 1_000_000).toFixed(2) + ' STARS'
}

export function truncate(
  address: string,
  visibleFirst: number = 8,
  visibleLast: number = 4,
) {
  return `${address.substring(0, visibleFirst)}...${address.substring(
    address.length - visibleLast,
    address.length,
  )}`
}
