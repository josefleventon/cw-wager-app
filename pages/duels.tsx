import type { NextPage } from 'next'

import { useEffect, useState } from 'react'

import useChain from 'hooks/useChain'
import { useRouter } from 'next/router'
import { Spinner } from 'components'
import { humanize } from 'util/constants'
import { Job } from 'types/agent'

const Duels: NextPage = () => {
  const { disconnect } = useChain()
  const router = useRouter()

  const [jobs, setJobs] = useState<Job[]>()

  const [revalidateCounter, setRevalidateCounter] = useState(0)
  const [factor, setFactor] = useState<1 | -1>(1)

  useEffect(() => {
    fetch(process.env.NEXT_PUBLIC_AGENT_API! + '/jobs')
      .then((res) => res.json())
      .then((json: { jobs: Job[] }) => {
        console.log(json)
        if (json.jobs) setJobs(json.jobs)
      })
  }, [revalidateCounter])

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

  return jobs ? (
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
          className="inline-flex items-center justify-center px-6 pt-4 pb-1 text-black bg-white hover:bg-slate-300"
          onClick={() => router.push('/queue')}
        >
          View queues
        </button>
        <button
          id="connect-wallet"
          className="inline-flex items-center justify-center px-6 pt-4 pb-1 text-white bg-theme-blue"
          onClick={() => router.push('/duels')}
        >
          Current duels
        </button>
      </div>

      <div className="w-full max-w-4xl text-center text-white md:mt-24">
        <img src="/logo.svg" alt="PW LOGO" className="w-auto h-8 mx-auto" />
        <div className="flex flex-col justify-center mt-8">
          <p className="text-xl uppercase">Ongoing Duels</p>

          {jobs.length < 1 && (
            <p className="mt-24">There are no ongoing duels...</p>
          )}

          <div className="flex flex-col mt-8 md:max-h-[50vh] md:overflow-y-scroll space-y-2 divide-y-2 divide-white">
            {jobs.map((job) => (
              <div
                key={job.wagers[0].token.token_id}
                className="grid grid-cols-5 gap-4 pt-4"
              >
                <div>
                  <p className="text-lg">
                    Wizard #{job.wagers[0].token.token_id}
                  </p>
                  <p className="text-lg">
                    Wizard #{job.wagers[1].token.token_id}
                  </p>
                </div>
                <div>
                  <p className="text-lg uppercase">${job.wagers[0].currency}</p>
                  <p className="text-lg uppercase">${job.wagers[1].currency}</p>
                </div>
                <div>
                  <p className="text-lg">{humanize(job.amount)}</p>
                  <p className="text-lg">
                    {(
                      (new Date(
                        parseInt(job?.expires_at || '0') / 1_000_000,
                      ).getTime() -
                        new Date().getTime()) /
                      60000
                    ).toFixed(0)}
                    m left
                  </p>
                </div>
                <div>
                  <div>
                    {job.current_winner?.token_id ===
                      job.wagers[0].token.token_id && (
                      <p className="text-lg text-green-500">Winning...</p>
                    )}
                    {job.current_winner?.token_id !==
                      job.wagers[0].token.token_id &&
                      job.current_winner && (
                        <p className="text-lg text-red-500">Losing...</p>
                      )}
                    {!job.current_winner && <p className="text-lg">Tied</p>}
                  </div>
                  <div>
                    {job.current_winner?.token_id ===
                      job.wagers[1].token.token_id && (
                      <p className="text-lg text-green-500">Winning...</p>
                    )}
                    {job.current_winner?.token_id !==
                      job.wagers[1].token.token_id &&
                      job.current_winner && (
                        <p className="text-lg text-red-500">Losing...</p>
                      )}
                    {!job.current_winner && <p className="text-lg">Tied</p>}
                  </div>
                </div>
                <button
                  id="connect-wallet"
                  className="inline-flex items-center justify-center px-4 pt-3 pb-0.5 text-sm text-black bg-white hover:bg-slate-300"
                  onClick={() =>
                    router.push(
                      `/status?token_id=${job.wagers[0].token.token_id}`,
                    )
                  }
                >
                  Spectate
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

export default Duels
