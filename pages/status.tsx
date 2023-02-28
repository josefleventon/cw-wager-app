import type { NextPage } from 'next'
import { useCallback, useEffect, useMemo, useState } from 'react'

import useChain from 'hooks/useChain'
import { useRouter } from 'next/router'
import { useStargazeClient } from 'client'
import {
  MatchmakingItemExport,
  TokenStatus,
  WagerExport,
} from 'types/Wager.types'
import { COLLECTION_ADDRESS } from 'util/constants'
import { getToken, NFT } from 'client/query'
import { Spinner } from 'components'
import { MintImage } from 'components/MediaView'
import { WagerMessageComposer } from 'types/Wager.message-composer'
import { useTx } from 'contexts/tx'

const Status: NextPage = () => {
  const { disconnect, address } = useChain()
  const { client } = useStargazeClient()
  const router = useRouter()

  const [revalidateCounter, setRevalidateCounter] = useState(0)
  const [factor, setFactor] = useState<1 | -1>(1)

  const [status, setStatus] = useState<'none' | 'matchmaking' | 'wager'>()
  const [data, setData] = useState<TokenStatus>()
  const [wizard, setWizard] = useState<NFT>()
  const [otherWizard, setOtherWizard] = useState<NFT>()

  const { token_id } = router.query

  const { tx } = useTx()

  const wager = useMemo(() => {
    switch (status) {
      case 'matchmaking':
        return (data as any).matchmaking as MatchmakingItemExport
      case 'wager':
        const wager = (data as any).wager as WagerExport
        if (!wager.wagers) return
        getToken(
          wager.wagers
            .find(
              (wager) => wager.token.token_id != parseInt(token_id as string),
            )
            ?.token.token_id.toString()!,
        ).then((token) => setOtherWizard(token))
        return wager
    }
  }, [data, status])

  useEffect(() => {
    setInterval(() => {
      setRevalidateCounter(revalidateCounter + 1 * factor)
      switch (factor) {
        case -1:
          setFactor(1)
          break
        case 1:
          setFactor(-1)
          break
      }
    }, 10_000)
  }, [])

  useEffect(() => {
    if (!client?.wagerClient) return

    getToken(token_id as string).then((wizard) => setWizard(wizard))

    client.wagerClient
      .tokenStatus({
        token: [COLLECTION_ADDRESS, parseInt(token_id as string)],
      })
      .then((status) => {
        setData(status.token_status)
        if ('matchmaking' in Object(status.token_status)) {
          setStatus('matchmaking')
        } else if ('wager' in Object(status.token_status)) {
          setStatus('wager')
        } else {
          router.push('/wager')
        }
      })
  }, [client?.wagerClient, token_id, revalidateCounter])

  const onCancel = useCallback(() => {
    if (!client?.wagerContract || !address) return

    const messageComposer = new WagerMessageComposer(
      address,
      client.wagerContract,
    )
    const msg = messageComposer.cancel({
      token: [COLLECTION_ADDRESS, parseInt(token_id as string)],
    })

    tx(
      [msg],
      {
        toast: {
          title: 'Duel cancelled!',
        },
      },
      () => {
        router.push('/wager')
      },
    )
  }, [client?.wagerContract, address])

  return wizard && status && data ? (
    <main
      id="main"
      className="flex items-center justify-center w-screen h-screen md:overflow-hidden bg-theme-blue"
    >
      <div className="absolute flex flex-row items-center space-x-4 top-2 right-2">
        <button
          id="connect-wallet"
          className="inline-flex items-center justify-center px-6 pt-4 pb-1 text-black bg-white hover:bg-slate-300"
          onClick={() => {
            router.push('/wager')
          }}
        >
          Duel another wizard
        </button>
        <button
          id="connect-wallet"
          className="inline-flex items-center justify-center px-6 pt-4 pb-1 text-black bg-white hover:bg-slate-300"
          onClick={() => {
            disconnect()
            router.push('/')
          }}
        >
          Disconnect
        </button>
      </div>
      <div className="w-full max-w-6xl text-center text-white">
        <h1 className="text-2xl font-black tracking-wider uppercase md:text-4xl">
          {status === 'wager'
            ? `Duel ends @ ${new Date(
                parseInt((wager as WagerExport).expires_at) / 1_000_000,
              ).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : 'Matchmaking...'}
        </h1>
        {status === 'matchmaking' && (
          <>
            <div className="flex justify-center mt-4 text-lg">
              <div className="flex flex-row items-center space-x-2 text-center">
                <p>
                  Against{' '}
                  {(wager as MatchmakingItemExport).against_currencies
                    .map((currency) => `$${currency.toUpperCase()}`)
                    .join(' - ')}
                </p>
                <p>&#9679;</p>
                <p>
                  For{' '}
                  {parseInt((wager as MatchmakingItemExport).amount) /
                    1_000_000}{' '}
                  STARS
                </p>
              </div>
            </div>
            <div className="flex justify-center mt-12">
              <div className="w-64 h-64">
                <MintImage
                  src={`https://ipfs-gw.stargaze-apis.com/ipfs/bafybeiet7wzhih3zwcmdi2kojzpkrhjdrp7otaineans5zgg6e26yuj4qu/${wizard.tokenId}.svg`}
                  alt={wizard.name}
                />
              </div>
            </div>
            <p className="mt-4 text-xl">{wizard.name}</p>
            <p className="mt-1 font-bold">
              ${wizard.traits.find((trait) => trait.name === 'token')?.value}
            </p>
            <button
              id="connect-wallet"
              className="inline-flex mt-6 items-center justify-center px-12 pt-3 pb-0.5 text-black bg-white hover:bg-slate-300"
              onClick={onCancel}
            >
              Cancel
            </button>
          </>
        )}
        {status === 'wager' && (
          <>
            <div className="flex justify-center mt-4 text-lg">
              <div className="flex flex-row items-center space-x-2 text-center">
                <p>
                  Against $
                  {(wager as WagerExport).wagers
                    .find(
                      (wager) =>
                        wager.token.token_id != parseInt(token_id as string),
                    )
                    ?.currency.toUpperCase()}
                </p>
                <p>&#9679;</p>
                <p>
                  For {parseInt((wager as WagerExport).amount) / 1_000_000}{' '}
                  STARS
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 mt-6 md:mt-12 md:grid-cols-3">
              <div className="flex justify-center">
                <div className="w-32 h-32 transform scale-150 md:scale-100 md:w-96 md:h-96">
                  <MintImage
                    src={`https://ipfs-gw.stargaze-apis.com/ipfs/bafybeiet7wzhih3zwcmdi2kojzpkrhjdrp7otaineans5zgg6e26yuj4qu/${wizard.tokenId}.svg`}
                    alt={wizard.name}
                  />
                </div>
              </div>
              <div className="flex flex-col md:justify-center">
                <p className="font-bold">
                  $
                  {wizard.traits.find((trait) => trait.name === 'token')?.value}
                </p>
                <p className="mt-4 text-xl">{wizard.name}</p>
                <p className="mt-4 text-4xl md:mt-12 md:text-6xl">VS</p>
                <p className="mt-2 text-xl md:mt-4">{otherWizard?.name}</p>
                <p className="mt-4 font-bold">
                  $
                  {
                    otherWizard?.traits.find((trait) => trait.name === 'token')
                      ?.value
                  }
                </p>
              </div>
              <div className="flex justify-center">
                <div className="w-32 h-32 transform scale-150 md:scale-100 md:w-96 md:h-96">
                  <MintImage
                    src={
                      otherWizard
                        ? `https://ipfs-gw.stargaze-apis.com/ipfs/bafybeiet7wzhih3zwcmdi2kojzpkrhjdrp7otaineans5zgg6e26yuj4qu/${otherWizard.tokenId}.svg`
                        : undefined
                    }
                    alt={otherWizard?.name}
                  />
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  ) : (
    <main
      id="main"
      className="flex items-center justify-center w-screen h-screen md:overflow-hidden bg-theme-blue"
    >
      <Spinner className="w-16 h-16 text-white" />
    </main>
  )
}

export default Status
