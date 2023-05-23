import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { Howl, Howler } from "howler";

const tracks = [
  {
    name: "title",
    path: "/sounds/title.mp3",
  },
  {
    name: "battle",
    path: "/sounds/battle.mp3",
  },
];

export interface MusicContext {
  play: (name: string) => void;
  stop: () => void;
  changeVolume: (volume: number) => void;
  isPlaying: boolean;
}

export const Music = createContext<MusicContext>({
  play: () => {},
  stop: () => {},
  changeVolume: () => {},
  isPlaying: false,
});

export function MusicProvider({ children }: { children: ReactNode }) {
  const [sound, setSound] = useState<Howl>();

  const play = useCallback(
    (name: string) => {
      sound?.stop();

      const src = tracks.find((track) => track.name === name);
      if (src)
        setSound(
          new Howl({
            src: [src.path],
            volume: 0.25,
            autoplay: true,
            loop: true,
          })
        );
      else throw Error("Track does not exist");
    },
    [sound]
  );

  const stop = useCallback(() => {
    sound?.stop();
    setSound(undefined);
  }, [sound]);

  const changeVolume = useCallback(
    (volume: number) => Howler.volume(volume),
    []
  );

  return (
    <Music.Provider value={{ play, stop, changeVolume, isPlaying: !!sound }}>
      {children}
    </Music.Provider>
  );
}

export const useMusic = (): MusicContext => useContext(Music);
