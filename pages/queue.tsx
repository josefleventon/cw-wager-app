import type { NextPage } from 'next'

import { useEffect, useState } from 'react'

import useChain from 'hooks/useChain'
import { useRouter } from 'next/router'
import { Spinner } from 'components'
import { Currency, MatchmakingItemExport } from 'types/Wager.types'
import { useStargazeClient } from 'client'
import { humanize } from 'util/constants'
import { Job } from 'types/agent'

const Queue: NextPage = () => {
  const { disconnect, address } = useChain()
  const { client } = useStargazeClient()
  const router = useRouter()

  const [matchmaking, setMatchmaking] = useState<MatchmakingItemExport[]>()

  const [revalidateCounter, setRevalidateCounter] = useState(0)
  const [factor, setFactor] = useState<1 | -1>(1)

  useEffect(() => {
    if (!client?.wagerClient) return
    client?.wagerClient.matchmaking().then((data) => {
      console.log(data)
      setMatchmaking(
        data.matchmaking.filter(
          (matchmaking) =>
            new Date(parseInt(matchmaking.expires_at) / 1_000_000) > new Date(),
        ),
      )
    })
  }, [revalidateCounter, client?.wagerClient])

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
    }, 12_000)
  }, [])

  return matchmaking ? (
    <main
      id="main"
      className="flex items-center justify-center w-screen h-[85vh] md:overflow-hidden"
    >
      <div className="absolute flex flex-col space-y-2 top-2 right-2">
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
        <button
          id="connect-wallet"
          className="inline-flex items-center justify-center px-6 pt-4 pb-1 text-black bg-white hover:bg-slate-300"
          onClick={() => router.push('/wager')}
        >
          Setup duel
        </button>
        <button
          id="connect-wallet"
          className="inline-flex items-center justify-center px-6 pt-4 pb-1 text-white bg-theme-blue"
          onClick={() => router.push('/queue')}
        >
          View queues
        </button>
        <button
          id="connect-wallet"
          className="inline-flex items-center justify-center px-6 pt-4 pb-1 text-black bg-white hover:bg-slate-300"
          onClick={() => router.push('/duels')}
        >
          Current duels
        </button>
      </div>

      <div className="w-full max-w-4xl text-center text-white md:mt-24">
        <img src="/logo.svg" alt="PW LOGO" className="w-auto h-8 mx-auto" />
        <div className="flex flex-col justify-center mt-8">
          <p className="text-xl uppercase">Matchmaking Queue</p>

          {matchmaking.length < 1 && (
            <p className="mt-24">The queue is empty...</p>
          )}

          <div className="flex flex-col mt-8 md:max-h-[50vh] md:overflow-y-scroll space-y-2 divide-y-2 divide-white">
            {matchmaking.map((matchmaking) => (
              <div
                key={matchmaking.token.token_id}
                className="grid grid-cols-5 gap-4 pt-4"
              >
                <div>
                  <p className="text-lg">
                    Wizard #{matchmaking.token.token_id}
                  </p>
                  <p className="text-lg text-green-500 uppercase">
                    ${matchmaking.currency}
                  </p>
                </div>
                <div>
                  <p className="text-lg uppercase">vs</p>
                </div>
                <div>
                  <p className="text-lg">Anyone</p>
                  <p className="text-lg text-green-500 uppercase">
                    ${matchmaking.against_currencies.join('/')}
                  </p>
                </div>
                <div>
                  <p className="text-lg">{humanize(matchmaking.amount)}</p>
                  <p className="text-lg">{matchmaking.expiry / 60} minutes</p>
                </div>
                <button
                  id="connect-wallet"
                  className="inline-flex items-center justify-center px-4 pt-3 pb-0.5 text-sm text-black bg-white hover:bg-slate-300"
                  onClick={() =>
                    router.push(
                      `/wager?currency=${matchmaking.currency}&amount=${matchmaking.amount}&expiry=${matchmaking.expiry}&wizard_currency=${matchmaking.against_currencies[0]}`,
                    )
                  }
                >
                  Duel!
                </button>
              </div>
            ))}
          </div>
        </div>
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

export default Queue
