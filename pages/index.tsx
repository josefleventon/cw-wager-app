import type { NextPage } from 'next'
import { useEffect } from 'react'

import useChain from 'hooks/useChain'
import { useRouter } from 'next/router'

const Home: NextPage = () => {
  const { connect, isWalletConnected } = useChain()
  const router = useRouter()

  useEffect(() => {
    if (isWalletConnected) router.push('/wager')
  }, [isWalletConnected])

  return (
    <main
      id="main"
      className="flex items-center justify-center w-screen h-screen md:overflow-hidden bg-theme-sky"
    >
      <div className="w-full max-w-xl text-center text-black">
        <h1 className="text-5xl font-black tracking-wider uppercase">
          Wise Wizards
        </h1>
        <h2 className="mt-3 text-2xl font-black tracking-wide uppercase">
          Who is the wisest?
        </h2>
        <p className="mt-6 font-mono font-light">
          Place a bet versus other wizards on which token will outperform the
          other token, set your wager, find an opponent and wait for results!
        </p>
        <button
          id="connect-wallet"
          className="inline-flex items-center justify-center px-12 pt-4 pb-1 mt-12 text-lg text-white bg-theme-blue hover:bg-theme-blue/80"
          onClick={() => {
            connect()
          }}
        >
          Connect Wallet
        </button>
      </div>
    </main>
  )
}

export default Home
