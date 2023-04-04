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
import { getToken, NFT } from 'client/query'
import { Spinner } from 'components'
import { MintImage } from 'components/MediaView'
import { WagerMessageComposer } from 'types/Wager.message-composer'
import { useTx } from 'contexts/tx'
import { Job, Change } from 'types/agent'
import { classNames } from 'util/css'

const Status: NextPage = () => {
  const { address } = useChain()
  const { client } = useStargazeClient()
  const router = useRouter()

  const [revalidateCounter, setRevalidateCounter] = useState(0)
  const [factor, setFactor] = useState<1 | -1>(1)

  const [status, setStatus] = useState<'none' | 'matchmaking' | 'wager'>()
  const [data, setData] = useState<TokenStatus>()
  const [wizard, setWizard] = useState<NFT>()
  const [otherWizard, setOtherWizard] = useState<NFT>()

  const [job, setJob] = useState<Job>()
  const [wizardChange, setWizardChange] = useState<Change>()
  const [otherWizardChange, setOtherWizardChange] = useState<Change>()

  useEffect(() => {
    if (!job?.change) return
    setWizardChange(
      job?.change.find(
        (change) =>
          (change?.denom || 'NONE').toLowerCase() ===
          (wager as WagerExport).wagers
            .find(
              (wager) => wager.token.token_id == parseInt(token_id as string),
            )
            ?.currency.toLowerCase(),
      ),
    )

    setOtherWizardChange(
      job?.change.find(
        (change) =>
          (change?.denom || 'NONE').toLowerCase() ===
          (wager as WagerExport).wagers
            .find(
              (wager) => wager.token.token_id != parseInt(token_id as string),
            )
            ?.currency.toLowerCase(),
      ),
    )
  }, [job])

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
        fetch(process.env.NEXT_PUBLIC_AGENT_API! + '/jobs/' + token_id)
          .then((res) => res.json())
          .then((json: { job: Job | null }) => {
            if (json.job) setJob(json.job)
          })
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
        token: parseInt(token_id as string),
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
      token: parseInt(token_id as string),
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
    <>
      <main
        id="main"
        className="flex items-center justify-center w-screen h-screen md:overflow-hidden"
      >
        <div className="hidden md:block absolute flex flex-col space-y-2 top-2 left-2">
          <button
            id="connect-wallet"
            className="inline-flex items-center justify-center px-6 pt-4 pb-1 text-black bg-white hover:bg-slate-300"
            onClick={() => router.push('/wager')}
          >
            Return
          </button>
        </div>

        <div className="w-full max-w-6xl text-center text-white duel-arena">
          {status === 'matchmaking' && (
            <>
              <div className="flex justify-center mt-12 left-wizard">
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
              <div className="grid grid-cols-1 gap-4 mt-6 md:mt-8 md:grid-cols-3">
                <div className="flex justify-center order-3 md:order-1">
                  <div className="relative w-32 h-32 transform scale-150 md:top-32 md:left-24 lg:top-24 xl:top-40 md:scale-105 lg:scale-110 xl:scale-125 md:w-96 md:h-96 left-wizard">
                    <MintImage
                      src={`https://ipfs-gw.stargaze-apis.com/ipfs/bafybeiet7wzhih3zwcmdi2kojzpkrhjdrp7otaineans5zgg6e26yuj4qu/${wizard.tokenId}.svg`}
                      alt={wizard.name}
                    />
                  </div>
                </div>
                <div className="flex flex-col md:justify-center order-2">
                  <p className="mt-4 text-4xl md:mt-12 md:text-6xl">VS</p>
                </div>
                <div className="flex justify-center order-1 md:order-3">
                  <div className="relative w-32 h-32 transform scale-150 lg:right-16 lg:bottom-16 xl:left-16 md:scale-100 md:w-96 md:h-96 right-wizard">
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
      <div className="absolute flex flex-col space-y-2 bottom-24 md:bottom-4 right-4">
        <h1 className="text-sm text-right uppercase md:text-2xl">
          {status === 'wager'
            ? `Duel ends @ ${new Date(
                parseInt((wager as WagerExport).expires_at) / 1_000_000,
              ).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}`
            : 'Matchmaking...'}
        </h1>
        {status === 'wager' && (
          <h1 className="mt-6 text-lg font-black tracking-wider text-right md:text-3xl">
            {job?.current_winner?.token_id == token_id && 'You are winning'}
            {job?.current_winner?.token_id != token_id &&
              job?.current_winner?.token_id &&
              'Your opponent is winning'}
            {!job?.current_winner && 'Both wizards are tied'}
          </h1>
        )}
      </div>
      <div
        className="w-full sm:w-[30rem] h-[5rem] md:h-24 bg-theme-blue absolute bottom-4 left-0"
        style={{
          clipPath: 'polygon(0% 0%, 80% 0%, 100% 100%, 0% 100%)',
        }}
      >
        <div className="flex flex-col px-4 py-5 mr-24 space-y-2">
          <div className="flex flex-row items-center justify-between">
            <p className="text-sm md:text-lg text-white">{wizard.name}</p>
            <p className="text-sm md:text-lg text-white/50">
              {wizard.traits.find((trait) => trait.name === 'token')?.value}
            </p>
          </div>
          <div className="flex flex-row items-center justify-between">
            <div>
              {wizardChange && (
                <p
                  className={classNames(
                    wizardChange.change < 0 ? 'text-red-500' : 'text-green-500',
                    'font-bold',
                  )}
                >
                  {wizardChange.change < 0 ? '' : '+'}
                  {(wizardChange.change * 100).toFixed(4)}%
                </p>
              )}
            </div>
            {job?.expires_at && (
              <p className="text-white">
                {(
                  (new Date(
                    parseInt(job?.expires_at || '0') / 1_000_000,
                  ).getTime() -
                    new Date().getTime()) /
                  60000
                ).toFixed(0)}{' '}
                minutes left
              </p>
            )}
          </div>
        </div>
      </div>
      <div
        className="w-full sm:w-[30rem] h-[5rem] md:h-24 absolute top-[4rem] md:top-4 right-0 bg-theme-blue battle-card-opponent"
        style={{
          clipPath: 'polygon(20% 0%, 100% 0%, 100% 100%, 0% 100%)',
        }}
      >
        <div className="flex flex-col px-4 py-5 ml-24 space-y-2">
          <div className="flex flex-row-reverse items-center justify-between">
            <p className="text-sm md:text-lg text-white">{otherWizard?.name}</p>
            <p className="text-sm md:text-lg text-white/50">
              {
                otherWizard?.traits.find((trait) => trait.name === 'token')
                  ?.value
              }
            </p>
          </div>
          <div className="flex flex-row-reverse items-center justify-between">
            <div>
              {otherWizardChange && (
                <p
                  className={classNames(
                    otherWizardChange.change < 0
                      ? 'text-red-500'
                      : 'text-green-500',
                    'font-bold',
                  )}
                >
                  {otherWizardChange.change < 0 ? '' : '+'}
                  {(otherWizardChange.change * 100).toFixed(4)}%
                </p>
              )}
            </div>
            {job?.expires_at && (
              <p className="text-white">
                {(
                  (new Date(
                    parseInt(job?.expires_at || '0') / 1_000_000,
                  ).getTime() -
                    new Date().getTime()) /
                  60000
                ).toFixed(0)}{' '}
                minutes left
              </p>
            )}
          </div>
        </div>
      </div>
    </>
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
