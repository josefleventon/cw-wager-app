import { useMusic } from "contexts/music";

export default function SoundButton() {
  const { play, stop, isPlaying, changeVolume, volume } = useMusic();

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="flex flex-row space-x-4">
        <button
          className="mt-2 text-3xl md:text-lg"
          onClick={() => {
            if (volume >= 0.5) changeVolume(volume - 0.25);
          }}
        >
          -
        </button>
        <button
          onClick={() => {
            if (isPlaying) {
              stop();
            } else {
              play("title");
            }
          }}
          className="transition duration-75 ease-in-out transform cursor-pointer hover:scale-105 hover:opacity-80"
        >
          {!isPlaying ? (
            <img src="/icons/soundOff.svg" className="w-auto h-12 md:h-9" />
          ) : (
            <img src="/icons/soundOn.svg" className="w-auto h-12 md:h-9" />
          )}
        </button>
        <button
          className="mt-2 text-3xl md:text-lg"
          onClick={() => {
            if (volume <= 0.75) changeVolume(volume + 0.25);
          }}
        >
          +
        </button>
      </div>
      <p className="md:text-sm">{volume * 100}%</p>
    </div>
  );
}
