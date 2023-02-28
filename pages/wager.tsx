import type { NextPage } from 'next'
import { getInventory, NFT } from 'client/query'

import { useCallback, useEffect, useState } from 'react'

import useChain from 'hooks/useChain'
import { useRouter } from 'next/router'
import { Spinner } from 'components'
import { MintImage } from 'components/MediaView'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { classNames } from 'util/css'
import { useForm } from 'react-hook-form'
import { Config, currencies, Currency } from 'types/Wager.types'
import { useStargazeClient } from 'client'
import { useTx } from 'contexts/tx'
import { WagerMessageComposer } from 'types/Wager.message-composer'
import { COLLECTION_ADDRESS } from 'util/constants'

interface FormValues {
  versus: Currency
  amount: number
  duration: number
}

const Wager: NextPage = () => {
  const { disconnect, address } = useChain()
  const { client } = useStargazeClient()
  const router = useRouter()

  const { register, handleSubmit } = useForm<FormValues>()

  const { tx } = useTx()

  const [wizards, setWizards] = useState<NFT[]>()
  const [selectedWizard, setSelectedWizard] = useState<number>(0)
  const [isSelectedWizardWagered, setIsSelectedWizardWagered] = useState<
    boolean
  >(false)

  useEffect(() => {
    if (!client?.wagerClient || !wizards) return
    client.wagerClient
      .tokenStatus({
        token: [COLLECTION_ADDRESS, parseInt(wizards[selectedWizard].tokenId)],
      })
      .then((status) => {
        setIsSelectedWizardWagered(
          'matchmaking' in Object(status.token_status) ||
            'wager' in Object(status.token_status),
        )
      })
  }, [selectedWizard, wizards, client?.wagerClient])

  useEffect(() => {
    const timeout = setTimeout(() => router.push('/'), 5000)
    if (!address) return
    getInventory(address).then((wizards) => {
      setWizards(wizards)
      clearTimeout(timeout)
    })
  }, [address])

  const [config, setConfig] = useState<Config>()

  useEffect(() => {
    if (!client?.wagerClient) return
    client.wagerClient.config().then(({ config }) => setConfig(config))
  }, [client?.wagerClient])

  const onSubmit = useCallback(
    ({ versus, amount, duration }: FormValues) => {
      if (
        !address ||
        !client?.wagerContract ||
        !wizards ||
        !versus ||
        !amount ||
        !duration
      )
        return

      const messageComposer = new WagerMessageComposer(
        address,
        client?.wagerContract,
      )

      const msg = messageComposer.wager(
        {
          token: [
            COLLECTION_ADDRESS,
            parseInt(wizards[selectedWizard].tokenId),
          ],
          currency: wizards[selectedWizard].traits
            .find((trait) => trait.name === 'token')
            ?.value.toLowerCase() as Currency,
          against_currencies: [versus],
          expiry: parseInt(duration.toString()),
        },
        [
          {
            amount: amount.toString(),
            denom: 'ustars',
          },
        ],
      )

      tx(
        [msg],
        {
          toast: {
            title: 'Battle Initiated!',
          },
        },
        () => {
          router.push(`/status?token_id=${wizards[selectedWizard].tokenId}`)
        },
      )
    },
    [client, address, wizards, selectedWizard],
  )

  return wizards && config ? (
    <main
      id="main"
      className="flex items-center justify-center w-screen h-screen md:overflow-hidden bg-theme-blue"
    >
      <button
        id="connect-wallet"
        className="absolute inline-flex items-center justify-center px-6 pt-4 pb-1 text-black bg-white hover:bg-slate-300 top-2 right-2"
        onClick={() => {
          disconnect()
          router.push('/')
        }}
      >
        Disconnect
      </button>
      <div className="w-full max-w-3xl text-center text-white">
        <h1 className="text-3xl font-black tracking-wider uppercase md:text-5xl">
          Select your Wizard
        </h1>
        <div className="flex justify-center">
          <div className="flex flex-row items-center mt-6 space-x-4 md:space-x-12">
            <a
              onClick={() => {
                if (selectedWizard < 1) return
                setSelectedWizard(selectedWizard - 1)
              }}
            >
              <ChevronLeftIcon
                className={classNames(
                  selectedWizard < 1
                    ? 'text-gray-300'
                    : 'text-white cursor-pointer',
                  'w-12 h-12',
                )}
              />
            </a>
            <div className="w-64 h-64">
              <MintImage
                // src={wizards[selectedWizard].media.image.jpgLink}
                src={`https://ipfs-gw.stargaze-apis.com/ipfs/bafybeiet7wzhih3zwcmdi2kojzpkrhjdrp7otaineans5zgg6e26yuj4qu/${wizards[selectedWizard].tokenId}.svg`}
                alt={wizards[selectedWizard].name}
              />
            </div>
            <a
              onClick={() => {
                if (selectedWizard >= wizards.length - 1) return
                setSelectedWizard(selectedWizard + 1)
              }}
            >
              <ChevronRightIcon
                className={classNames(
                  selectedWizard >= wizards.length - 1
                    ? 'text-gray-300'
                    : 'text-white cursor-pointer',
                  'w-12 h-12',
                )}
              />
            </a>
          </div>
        </div>
        <p className="mt-4 text-xl">{wizards[selectedWizard].name}</p>
        <p className="mt-1 font-bold">
          $
          {
            wizards[selectedWizard].traits.find(
              (trait) => trait.name === 'token',
            )?.value
          }
        </p>
        <div className="flex justify-center w-full">
          {isSelectedWizardWagered ? (
            <button
              id="connect-wallet"
              className="inline-flex items-center justify-center px-12 pt-4 pb-1 mt-12 text-lg text-black bg-theme-sky hover:bg-theme-sky/80"
              onClick={() =>
                router.push(
                  `/status?token_id=${wizards[selectedWizard].tokenId}`,
                )
              }
            >
              View current duel
            </button>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col w-2/3 space-y-3 md:w-1/2 lg:w-1/3"
            >
              <select
                {...register('versus', { required: true })}
                className="w-full pt-3 pl-2 mt-2 text-lg text-black bg-white border-2 border-black rounded-none focus:ring-offset-theme-blue"
              >
                <option disabled selected>
                  Versus
                </option>
                {currencies
                  .filter(
                    (currency) =>
                      currency !=
                      wizards[selectedWizard].traits.find(
                        (trait) => trait.name === 'token',
                      )?.value,
                  )
                  .map((currency) => (
                    <option value={currency}>{currency.toUpperCase()}</option>
                  ))}
              </select>
              <select
                {...register('amount', { required: true })}
                className="w-full pt-3 pl-2 mt-2 text-lg text-black bg-white border-2 border-black rounded-none focus:ring-offset-theme-blue"
              >
                <option disabled selected>
                  Wager Amount
                </option>
                {config.amounts.map((amount) => (
                  <option value={amount}>
                    {parseInt(amount) / 1_000_000} STARS
                  </option>
                ))}
              </select>
              <select
                {...register('duration', { required: true })}
                className="w-full pt-3 pl-2 mt-2 text-lg text-black bg-white border-2 border-black rounded-none focus:ring-offset-theme-blue"
              >
                <option disabled selected>
                  Wager Duration
                </option>
                {config.expiries.map((expiry) => (
                  <option value={expiry}>{expiry / 60} min</option>
                ))}
              </select>
              <button
                id="connect-wallet"
                className="inline-flex items-center justify-center px-12 pt-4 pb-1 text-lg text-black bg-theme-sky hover:bg-theme-sky/80"
                type="submit"
              >
                Duel!
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  ) : (
    <main
      id="main"
      className="flex items-center justify-center w-screen h-screen md:overflow-hidden bg-theme-blue"
    >
      <Spinner className="w-8 h-8 text-white" />
    </main>
  )
}

export default Wager
