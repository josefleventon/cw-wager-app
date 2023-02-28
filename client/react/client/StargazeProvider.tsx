import { useCallback, useEffect, useMemo, useState } from 'react'
import { StargazeClient } from 'client/core'
import StargazeContext from './StargazeContext'

import { CONTRACT_ADDRESS } from 'util/constants'
import chainInfo from 'client/ChainInfo'
import useWallet from '../wallet/useWallet'

export default function StargazeProvider({
  children,
}: {
  children: JSX.Element
}) {
  const [, updateState] = useState<{}>()
  const forceUpdate = useCallback(() => updateState({}), [])

  const { wallet, signingCosmWasmClient } = useWallet()

  const client = useMemo(
    () =>
      new StargazeClient({
        wallet: wallet || null,
        chainInfo,
        wagerContract: CONTRACT_ADDRESS,
        signingCosmWasmClient: signingCosmWasmClient || null,
      }),
    [wallet, signingCosmWasmClient],
  )

  // Connect client
  useEffect(() => {
    // Unsigned Client
    async function connectClient() {
      await client?.connect()
      forceUpdate()
    }

    connectClient()
  }, [client, forceUpdate])

  return (
    <StargazeContext.Provider
      value={{
        client,
      }}
    >
      {children}
    </StargazeContext.Provider>
  )
}
