import type { NextPage } from "next";
import { getInventory, NFT } from "client/query";

import { useCallback, useEffect, useState } from "react";

import useChain from "hooks/useChain";
import { useRouter } from "next/router";
import Link from "next/link";
import { Spinner } from "components";
import { MintImage } from "components/MediaView";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { classNames } from "util/css";
import { useForm } from "react-hook-form";
import { Config, currencies, Currency } from "types/Wager.types";
import { useStargazeClient } from "client";
import { useTx } from "contexts/tx";
import { WagerMessageComposer } from "types/Wager.message-composer";
import useToaster, { ToastTypes } from "hooks/useToaster";

import useSound from "use-sound";
import { useMusic } from "contexts/music";

interface FormValues {
  versus: Currency;
  amount: number;
  duration: number;
}

const Wager: NextPage = () => {
  const { disconnect, address } = useChain();
  const { client } = useStargazeClient();
  const router = useRouter();

  const { stop: stopTrack, play } = useMusic();

  const { currency, amount, expiry, wizard_currency } = router.query;

  const { register, handleSubmit } = useForm<FormValues>();

  const { tx } = useTx();
  const toaster = useToaster();

  const [wizards, setWizards] = useState<NFT[]>();
  const [selectedWizard, setSelectedWizard] = useState<number>(0);
  const [isSelectedWizardWagered, setIsSelectedWizardWagered] =
    useState<boolean>(false);

  const [didShowIncompatToast, setDidShowIncompatToast] =
    useState<boolean>(false);

  const [playClick, { stop }] = useSound("/sounds/click.mp3", { volume: 0.5 });

  useEffect(() => {
    if (!client?.wagerClient || !wizards || wizards.length < 1) return;
    client.wagerClient
      .tokenStatus({
        token: parseInt(wizards[selectedWizard].tokenId),
      })
      .then((status) => {
        setIsSelectedWizardWagered(
          "matchmaking" in Object(status.token_status) ||
            "wager" in Object(status.token_status)
        );
      });
  }, [selectedWizard, wizards, client?.wagerClient]);

  useEffect(() => {
    const timeout = setTimeout(() => router.push("/"), 5000);
    if (!address) return;
    getInventory(address).then((wizards) => {
      setWizards(wizards);
      clearTimeout(timeout);

      const query_index = wizard_currency
        ? wizards.findIndex((wizard) => {
            return (
              wizard.traits
                .find((trait) => trait.name === "token")
                ?.value.toLowerCase() ==
              (wizard_currency as string).toLowerCase()
            );
          })
        : -2;

      if (query_index == -1) {
        if (didShowIncompatToast) return;
        setDidShowIncompatToast(true);
        toaster.toast({
          title: "You do not have a compatible wizard...",
          type: ToastTypes.Warning,
        });
      }

      if (query_index >= 0) setSelectedWizard(query_index);
    });
  }, [address]);

  const [config, setConfig] = useState<Config>();

  useEffect(() => {
    if (!client?.wagerClient) return;
    client.wagerClient.config().then(({ config }) => setConfig(config));
  }, [client?.wagerClient]);

  const onSubmit = useCallback(
    ({ versus, amount, duration }: FormValues) => {
      if (
        !address ||
        !client?.wagerContract ||
        !wizards ||
        (versus as string) == "null" ||
        String(amount) == "null" ||
        String(duration) == "null"
      )
        return;

      const messageComposer = new WagerMessageComposer(
        address,
        client?.wagerContract
      );

      const msg = messageComposer.wager(
        {
          token: parseInt(wizards[selectedWizard].tokenId),
          currency: wizards[selectedWizard].traits
            .find((trait) => trait.name === "token")
            ?.value.toLowerCase() as Currency,
          againstCurrencies: [versus],
          expiry: parseInt(duration.toString()),
        },
        [
          {
            amount: amount.toString(),
            denom: "ustars",
          },
        ]
      );

      tx(
        [msg],
        {
          toast: {
            title: "Matchmaking started!",
          },
        },
        () => {
          router.push(`/status?token_id=${wizards[selectedWizard].tokenId}`);
        }
      );
    },
    [client, address, wizards, selectedWizard]
  );

  return wizards && config ? (
    <main
      id="main"
      className="flex items-center justify-center w-screen h-[100%] mb-5"
    >
      <div className="absolute z-10 flex flex-col space-x-2 md:block top-1 right-2">
        <button
          id="connect-wallet"
          className="inline-flex items-center justify-center px-6 pt-4 pb-1 text-black bg-white hover:bg-slate-300"
          onClick={() => {
            disconnect();
            router.push("/");
            playClick();
          }}
        >
          Disconnect
        </button>
      </div>
      {wizards.length > 0 ? (
        <div className="justify-center w-full max-w-3xl text-center text-white">
          <div className="flex justify-center mt-8">
            <div className="flex flex-row items-center mt-6 space-x-4 md:space-x-12">
              <a
                onClick={() => {
                  if (selectedWizard < 1) return;
                  setSelectedWizard(selectedWizard - 1);
                }}
              >
                <ChevronLeftIcon
                  className={classNames(
                    selectedWizard < 1
                      ? "text-gray-300"
                      : "text-white cursor-pointer",
                    "w-12 h-12"
                  )}
                  onClick={() => playClick()}
                />
              </a>
              <div className="w-64 h-64 left-wizard">
                <MintImage
                  // src={wizards[selectedWizard].media.image.jpgLink}
                  src={`https://ipfs-gw.stargaze-apis.com/ipfs/bafybeiet7wzhih3zwcmdi2kojzpkrhjdrp7otaineans5zgg6e26yuj4qu/${wizards[selectedWizard].tokenId}.svg`}
                  alt={wizards[selectedWizard].name}
                />
              </div>
              <a
                onClick={() => {
                  if (selectedWizard >= wizards.length - 1) return;
                  setSelectedWizard(selectedWizard + 1);
                }}
              >
                <ChevronRightIcon
                  className={classNames(
                    selectedWizard >= wizards.length - 1
                      ? "text-gray-300"
                      : "text-white cursor-pointer",
                    "w-12 h-12"
                  )}
                  onClick={() => playClick()}
                />
              </a>
            </div>
          </div>
          <p className="mt-4 text-xl">{wizards[selectedWizard].name}</p>
          <p className="mt-1 font-bold">
            $
            {
              wizards[selectedWizard].traits.find(
                (trait) => trait.name === "token"
              )?.value
            }
          </p>
          <div className="flex justify-center w-full mt-8">
            {isSelectedWizardWagered ? (
              <button
                id="connect-wallet"
                className="inline-flex items-center justify-center px-12 pt-4 pb-1 mt-12 text-lg text-black bg-theme-sky hover:bg-theme-sky/80"
                onClick={() => {
                  router.push(
                    `/status?token_id=${wizards[selectedWizard].tokenId}`
                  );
                  stopTrack();
                  play("battle");
                  playClick();
                  stop();
                }}
              >
                View current duel
              </button>
            ) : (
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="flex flex-col w-2/3 space-y-3 md:w-1/2 lg:w-1/3"
              >
                <select
                  {...register("versus", { required: true })}
                  className="w-full pt-3 pl-2 mt-2 text-lg text-black bg-white border-2 border-black rounded-none focus:ring-offset-theme-blue"
                  defaultValue={currency}
                >
                  <option value={"null"} disabled selected>
                    Versus
                  </option>
                  {currencies
                    .filter(
                      (currency) =>
                        currency !=
                        wizards[selectedWizard].traits.find(
                          (trait) => trait.name === "token"
                        )?.value
                    )
                    .map((currency) => (
                      <option value={currency}>{currency.toUpperCase()}</option>
                    ))}
                </select>
                <select
                  {...register("amount", { required: true })}
                  className="w-full pt-3 pl-2 mt-2 text-lg text-black bg-white border-2 border-black rounded-none focus:ring-offset-theme-blue"
                  defaultValue={amount}
                >
                  <option value={"null"} disabled selected>
                    Wager Amount
                  </option>
                  {config.amounts.map((amount) => (
                    <option value={amount}>
                      {parseInt(amount) / 1_000_000} STARS
                    </option>
                  ))}
                </select>
                <select
                  {...register("duration", { required: true })}
                  className="w-full pt-3 pl-2 mt-2 text-lg text-black bg-white border-2 border-black rounded-none focus:ring-offset-theme-blue"
                  defaultValue={expiry}
                >
                  <option value={"null"} disabled selected>
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
                  onClick={() => {
                    playClick();
                  }}
                >
                  Duel!
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-8">
          <p>You do not own any wizards.</p>
          <Link
            href="https://www.stargaze.zone/marketplace/stars18d7ver7mmjdt06mz6x0pz09862060kupju75kpka5j0r7huearcsq0gyg0?sort=price_asc"
            target="_blank"
            onClick={() => playClick()}
          >
            <button
              id="connect-wallet"
              className="inline-flex items-center justify-center px-12 pt-4 pb-1 text-lg text-black bg-theme-sky hover:bg-theme-sky/80"
            >
              Buy one on Stargaze!
            </button>
          </Link>
        </div>
      )}
    </main>
  ) : (
    <main
      id="main"
      className="absolute z-10 flex items-center justify-center w-screen h-screen md:overflow-hidden bg-theme-blue"
    >
      <Spinner className="w-16 h-16 text-white" />
    </main>
  );
};

export default Wager;
