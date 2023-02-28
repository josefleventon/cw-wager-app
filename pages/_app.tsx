import { ChakraProvider } from '@chakra-ui/react'
import { defaultTheme } from '@cosmos-kit/react'
import WalletProvider from 'client/react/wallet/WalletProvider'
import { MetaTags } from 'components'
import { TxProvider } from 'contexts/tx'
import type { AppProps } from 'next/app'
import { Toaster } from 'react-hot-toast'

import 'styles/globals.css'
import 'styles/fonts.css'
import 'styles/borders.scss'

export default function WagerApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Toaster position="top-right" />
      <WalletProvider>
        <TxProvider>
          <MetaTags
            title="Wizard Duel"
            description="Duel your Pixel Wizard against other wizards. Who is the wisest?"
            image="https://i.ibb.co/KFkThny/image.png"
            ogImage="https://i.ibb.co/KFkThny/image.png"
            url="https://duel.pixelwizards.art"
          />
          <main className="w-screen min-h-screen overflow-x-hidden text-white bg-bg">
            <Component {...pageProps} />
          </main>
        </TxProvider>
      </WalletProvider>
    </>
  )
}
