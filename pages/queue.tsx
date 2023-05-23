import type { NextPage } from 'next'

import { useEffect, useState } from 'react'

import useChain from 'hooks/useChain'
import { useRouter } from 'next/router'
import { Spinner } from 'components'
import { Currency, MatchmakingItemExport } from 'types/Wager.types'
import { useStargazeClient } from 'client'
import { humanize } from 'util/constants'
import { Job } from 'types/agent'

import useSound from 'use-sound';

const Queue: NextPage = () => {
  const { disconnect, address } = useChain()
  const { client } = useStargazeClient()
  const router = useRouter()

  const [matchmaking, setMatchmaking] = useState<MatchmakingItemExport[]>()

  const [revalidateCounter, setRevalidateCounter] = useState(0)
  const [factor, setFactor] = useState<1 | -1>(1)

  const [playClick] = useSound(
    '/sounds/click.mp3',
    { volume: 0.5 }
  );

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
      <div className="absolute z-10 flex flex-col space-x-2 md:block top-1 right-2">
        <button
          id="connect-wallet"
          className="inline-flex items-center justify-center px-6 pt-4 pb-1 text-black bg-white hover:bg-slate-300"
          onClick={() => {
            disconnect()
            router.push('/')
            playClick();
          }}
        >
          Disconnect
        </button>
      </div>

      <div className="w-full max-w-4xl text-center text-white md:mt-24">
        <div className="flex flex-col justify-center mt-8">
          <p className="text-xl uppercase">Matchmaking Queue</p>

          {matchmaking.length < 1 && (
            <p className="mt-24">The queue is empty...</p>
          )}

          <div className="flex flex-col mt-8 md:max-h-[50vh] md:overflow-y-scroll space-y-2 divide-y-2 divide-white">
            {matchmaking.map((matchmaking) => (
              <div
                key={matchmaking.token.token_id}
                className="grid grid-flow-row grid-cols-5 gap-4 px-4 pt-4 md:grid-cols-5"
                style={{
                  background: '#E3FFFF50',
                }}
              >
                <div className='col-span-2 md:col-span-1'>
                  <p className="text-sm md:text-lg">
                    Wizard #{matchmaking.token.token_id}
                  </p>
                  <p className="text-sm text-green-500 uppercase md:text-lg">
                    ${matchmaking.currency}
                  </p>
                </div>
                <div className='col-span-1 md:col-span-1'>
                  <p className="text-sm uppercase md:text-lg">vs</p>
                </div>
                <div className='col-span-2 md:col-span-1'>
                  <p className="text-sm md:text-lg">Anyone</p>
                  <p className="text-sm text-green-500 uppercase md:text-lg">
                    ${matchmaking.against_currencies.join('/')}
                  </p>
                </div>
                <div className="col-span-2 pt-2 md:col-span-1 md:pt-0">
                  <p className="text-sm md:text-lg">{humanize(matchmaking.amount)}</p>
                  <p className="text-sm md:text-lg">{matchmaking.expiry / 60} minutes</p>
                </div>
                <button
                  id="connect-wallet"
                  className="inline-flex items-center col-span-3 md:col-span-1 justify-center px-4 pt-3 pb-0.5 mb-4 text-sm text-black bg-white hover:bg-slate-300"
                  onClick={() => {
                    router.push(
                      `/wager?currency=${matchmaking.currency}&amount=${matchmaking.amount}&expiry=${matchmaking.expiry}&wizard_currency=${matchmaking.against_currencies[0]}`,
                    )
                    playClick();}
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
      className="absolute z-10 flex items-center justify-center w-screen h-screen md:overflow-hidden bg-theme-blue"
    >
      <Spinner className="w-16 h-16 text-white" />
    </main>
  )
}

export default Queue
