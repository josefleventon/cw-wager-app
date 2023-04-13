import { useState } from "react"
import useSound from 'use-sound'
import { useRouter } from 'next/router'

export default function SoundButton() {
    const router = useRouter()
    const pathname = router.pathname == '/status'

    const [playingSound, setPlayingSound] = useState(true)
    const [play, { stop }] = useSound(pathname? "/sounds/battle.mp3" : "/sounds/title.mp3", { loop: true, volume: 0.25, soundEnabled: playingSound? true : false })

    return (
        <button
            onClick={() => {
                setPlayingSound(!playingSound)
                playingSound? play() : stop()
            }}
            className="-mt-2 transition duration-75 ease-in-out transform cursor-pointer hover:scale-105 hover:opacity-80"
        >
            {playingSound? <img src="/icons/soundOff.svg" className="w-auto h-9" /> : <img src="/icons/soundOn.svg" className="w-auto h-9" />}
        </button>
    )
}