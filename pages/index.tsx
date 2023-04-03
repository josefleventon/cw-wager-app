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
      className="flex items-center justify-center w-screen h-[85vh] md:overflow-hidden"
    >
      <div className="flex flex-col items-center w-full max-w-2xl mt-16 text-center text-white">
        <img src="/logo.svg" alt="PW LOGO" className="w-auto h-6" />
        <div className="flex flex-row items-start">
          <h1 className="w-full mt-12 text-5xl font-black tracking-wider uppercase md:text-6xl">
            Token Dueling
          </h1>
          <p className="w-16 h-6 px-1 pt-2 mt-8 ml-2 text-xs font-bold tracking-wide text-black uppercase bg-white mix-blend-screen">
            Beta
          </p>
        </div>
        <div></div>
        <a
          onClick={() => connect()}
          id="contour"
          className="mt-16 text-2xl font-bold uppercase transition duration-150 ease-in-out transform cursor-pointer text-theme-blue hover:text-theme-blue/80 hover:-translate-y-1 hover:scale-105"
        >
          Press to connect & start
        </a>
      </div>
    </main>
  )
}

export default Home
