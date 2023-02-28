import { useChain as useCosmosKitChain } from '@cosmos-kit/react'
import { CHAIN } from 'util/constants'

export default function useChain() {
  return useCosmosKitChain(CHAIN)
}
