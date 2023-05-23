import { useMusic } from "contexts/music";

export default function SoundButton() {
  const { play, stop, isPlaying } = useMusic();

  return (
    <button
      onClick={() => {
        if (isPlaying) {
          stop();
        } else {
          play("title");
        }
      }}
      className="-mt-2 transition duration-75 ease-in-out transform cursor-pointer hover:scale-105 hover:opacity-80"
    >
      {!isPlaying ? (
        <img src="/icons/soundOff.svg" className="w-auto h-9" />
      ) : (
        <img src="/icons/soundOn.svg" className="w-auto h-9" />
      )}
    </button>
  );
}
