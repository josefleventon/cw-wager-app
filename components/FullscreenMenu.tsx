import { useState } from "react";
import { useStargazeClient } from "client";
import { humanize } from "util/constants";
import SoundButton from "./SoundButton";
import Link from "next/link";

export default function FullscreenMenu() {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { client } = useStargazeClient();

  return (
    <section className="flex MOBILE-MENU lg:hidden">
      <div
        className="space-y-2 HAMBURGER-ICON"
        onClick={() => setIsNavOpen((prev) => !prev)}
      >
        MENU
      </div>

      <div
        className={`bg-theme-blue ${
          isNavOpen ? "showMenuNav" : "hideMenuNav"
        } transition`}
      >
        <div
          className="absolute top-0 right-0 px-8 py-8"
          onClick={() => setIsNavOpen(false)}
        >
          <svg
            className="w-8 h-8 text-gray-600"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <div className="absolute top-0 left-0 px-8 py-8">
          <SoundButton />
        </div>
        <ul className="w-[90%] flex flex-col items-center justify-around min-h-[250px] h-full">
          <div className="w-full">
            <li className="w-full my-12 uppercase border-b-4 border-slate-300">
              <Link
                className="text-2xl"
                href="/wager"
                onClick={() => setIsNavOpen(false)}
              >
                Create Duel
              </Link>
            </li>
            <li className="w-full my-12 uppercase border-b-4 border-slate-300">
              <Link
                className="text-2xl"
                href="/queue"
                onClick={() => setIsNavOpen(false)}
              >
                View queues
              </Link>
            </li>
            <li className="w-full my-12 uppercase border-b-4 border-slate-300">
              <Link
                className="text-2xl"
                href="/duels"
                onClick={() => setIsNavOpen(false)}
              >
                Ongoing duels
              </Link>
            </li>
          </div>
          <div className="flex flex-col items-center space-y-12">
            <div className="flex flex-row items-center space-x-4">
              <img src="/icons/wallet.svg" className="w-auto h-6 -mt-2" />
              <p className="text-white">
                {client?.wallet
                  ? humanize(client?.wallet?.balance?.amount!)
                  : "Not connected"}
              </p>
            </div>
            <div className="flex flex-row items-center space-x-12">
              <a
                href="https://discord.gg/pixelwizards"
                rel="noopener noreferrer"
                target="_blank"
              >
                <img
                  src="icons/discord.svg"
                  className="transition duration-75 ease-in-out transform cursor-pointer w-14 hover:scale-105 hover:opacity-80"
                />
              </a>
              <a
                href="https://twitter.com/pixlwizardsnft"
                rel="noopener noreferrer"
                target="_blank"
              >
                <img
                  src="icons/twitter.svg"
                  className="w-12 transition duration-75 ease-in-out transform cursor-pointer hover:scale-105 hover:opacity-80"
                />
              </a>
            </div>
          </div>
        </ul>
      </div>
      <style>{`
      .hideMenuNav {
        display: none;
      }
      .showMenuNav {
        display: block;
        position: absolute;
        width: 100%;
        height: 100vh;
        top: 0;
        left: 0;
        z-index: 10;
        display: flex;
        flex-direction: column;
        justify-content: space-evenly;
        align-items: center;
      }
    `}</style>
    </section>
  );
}
