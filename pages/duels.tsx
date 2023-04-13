import type { NextPage } from 'next'

import { useEffect, useState } from 'react'

import useChain from 'hooks/useChain'
import { useRouter } from 'next/router'
import { Spinner } from 'components'
import { humanize } from 'util/constants'
import { Job } from 'types/agent'

import useSound from 'use-sound';

const Duels: NextPage = () => {
  const { disconnect } = useChain()
  const router = useRouter()

  const [jobs, setJobs] = useState<Job[]>()

  const [revalidateCounter, setRevalidateCounter] = useState(0)
  const [factor, setFactor] = useState<1 | -1>(1)

  const [playClick] = useSound(
    '/sounds/click.mp3',
    { volume: 0.5 }
  );

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
      <div className="hidden md:block absolute flex flex-col space-x-2 top-1 right-2 z-10">
        <button
          id="connect-wallet"
          className="inline-flex items-center justify-center px-6 pt-4 pb-1 text-black bg-white hover:bg-slate-300"
          onClick={() => {
            disconnect()
            router.push('/')
            playClick()
          }}
        >
          Disconnect
        </button>
      </div>

      <div className="w-full max-w-4xl text-center text-white md:mt-24">
        <div className="flex flex-col justify-center mt-8">
          <p className="text-xl uppercase">Ongoing Duels</p>

          {jobs.length < 1 && (
            <p className="mt-24">There are no ongoing duels...</p>
          )}

          <div className="flex flex-col mt-8 md:max-h-[50vh] md:overflow-y-scroll space-y-2 divide-y-2 divide-white">
            {jobs.map((job) => (
              <div
                key={job.wagers[0].token.token_id}
                className="grid grid-cols-4 grid-flow-row md:grid-cols-5 gap-4 pt-4 px-4"
                style={{
                  background: '#E3FFFF50',
                }}
              >
                <div className='col-span-2 md:col-span-1'>
                  <p className="text-sm md:text-lg">
                    Wizard #{job.wagers[0].token.token_id}
                  </p>
                  <p className="text-sm md:text-lg">
                    Wizard #{job.wagers[1].token.token_id}
                  </p>
                </div>
                <div className='col-span-1 md:col-span-1'>
                  <p className="text-sm md:text-lg uppercase">${job.wagers[0].currency}</p>
                  <p className="text-sm md:text-lg uppercase">${job.wagers[1].currency}</p>
                </div>
                <div className='col-span-2 md:col-span-1 order-last'>
                  <p className="text-sm md:text-lg">{humanize(job.amount)}</p>
                  <p className="text-sm md:text-lg">
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
                <div className='col-span-1 md:col-span-1'>
                  <div>
                    {job.current_winner?.token_id ===
                      job.wagers[0].token.token_id && (
                      <p className="text-sm md:text-lg text-green-500">Winning...</p>
                    )}
                    {job.current_winner?.token_id !==
                      job.wagers[0].token.token_id &&
                      job.current_winner && (
                        <p className="text-sm md:text-lg text-red-500">Losing...</p>
                      )}
                    {!job.current_winner && <p className="text-sm md:text-lg">Tied</p>}
                  </div>
                  <div>
                    {job.current_winner?.token_id ===
                      job.wagers[1].token.token_id && (
                      <p className="text-sm md:text-lg text-green-500">Winning...</p>
                    )}
                    {job.current_winner?.token_id !==
                      job.wagers[1].token.token_id &&
                      job.current_winner && (
                        <p className="text-sm md:text-lg text-red-500">Losing...</p>
                      )}
                    {!job.current_winner && <p className="text-sm md:stext-lg">Tied</p>}
                  </div>
                </div>
                <button
                  id="connect-wallet"
                  className="inline-flex items-center col-span-2 md:col-span-1 order-last justify-center px-4 pt-3 pb-0.5 mb-4 text-sm text-black bg-white hover:bg-slate-300"
                  onClick={() => 
                    {
                      router.push(
                        `/status?token_id=${job.wagers[0].token.token_id}`,
                      )
                      playClick()
                    }
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
      className="flex items-center justify-center absolute w-screen h-screen md:overflow-hidden bg-theme-blue z-10"
    >
      <Spinner className="w-16 h-16 text-white" />
    </main>
  )
}

export default Duels
