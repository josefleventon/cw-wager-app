import { classNames } from 'util/css'
import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useInView } from 'react-intersection-observer'
import { isIOS } from 'react-device-detect'

type MintImageProps = {
  src?: string
  inactive?: boolean
  alt?: string
}

function MediaPlayerLoading() {
  return (
    <div
      className={
        'w-full h-full bg-neutral-900 z-10 rounded-lg flex justify-center items-center animate-pulse'
      }
      style={{
        aspectRatio: '1',
      }}
    />
  )
}

// function ImageError() {
//   return (
//     <div className="flex flex-col items-center justify-center w-full text-sm opacity-50 aspect-1 bg-neutral-900 rounded-xl text-neutral-400">
//       <div className="mt-4">Error loading image.</div>
//     </div>
//   )
// }

function StaticImage({
  src,
  inactive,
  alt,
  onLoad,
}: MintImageProps & {
  onLoad?: () => void
}) {
  const [nextImgError, setNextImgError] = useState(false)
  const [loading, setLoading] = useState(true)
  const imageClassName = classNames(
    !inactive ? 'opacity-90' : 'opacity-100',
    'object-cover rounded-lg w-full transition-none',
  )

  function handleOnLoad() {
    onLoad?.()
    setLoading(false)
  }

  return (
    <div className="relative">
      {loading && (
        <div className="absolute z-10 w-full h-full">
          <MediaPlayerLoading />
        </div>
      )}
      <Image
        key={src}
        className={imageClassName}
        src={src as string}
        alt={alt as string}
        height={256}
        width={256}
        onError={() => setNextImgError(true)}
        onLoadingComplete={handleOnLoad}
      />
    </div>
  )
}

function SvgImage({
  src,
  inactive,
  alt,
  onLoad,
}: MintImageProps & {
  onLoad?: () => void
}) {
  const [nextImgError, setNextImgError] = useState(false)
  const [loading, setLoading] = useState(true)
  const imageClassName = classNames(
    !inactive ? 'opacity-90' : 'opacity-100',
    'object-cover rounded-lg w-full transition-none',
  )

  const aRef = useRef<HTMLAnchorElement>(null)

  function handleOnLoad() {
    onLoad?.()
    setLoading(false)
  }

  useEffect(() => {
    if (aRef?.current?.firstChild)
      aRef?.current?.removeChild(aRef?.current?.firstChild)
    fetch(src as string)
      .then((res) => res.text())
      .then((svg) => {
        setLoading(false)
        if (aRef.current?.childElementCount! < 1)
          aRef?.current?.insertAdjacentHTML('afterbegin', svg)
      })
  }, [src])

  return (
    <div className="relative">
      {loading && (
        <div className="absolute z-10 w-full h-full">
          <MediaPlayerLoading />
        </div>
      )}
      <a ref={aRef}></a>
    </div>
  )
}

function AnimatedImage({ src, inactive, alt }: MintImageProps) {
  const [loading, setLoading] = useState(true)
  const { ref, inView } = useInView({
    /* Optional options */
    threshold: 0.5,
  })

  const videoRef = useRef<
    HTMLVideoElement | undefined
  >() as React.MutableRefObject<HTMLVideoElement>

  // Play video when in view.
  useEffect(() => {
    if (inView && !isIOS) {
      videoRef.current?.play()
      setLoading(false)
    } else {
      videoRef.current?.pause()
    }
  }, [inView])

  return (
    <div ref={ref}>
      {loading && <MediaPlayerLoading />}
      <video
        ref={videoRef}
        loop
        muted
        playsInline
        onLoad={() => setLoading(false)}
      >
        {/* Disable WebM b/c of pixelated GIF results. */}
        {/* <source type="video/webm" src={data.webmLink} /> */}
        <source type="video/mp4" src={src} />
        <StaticImage
          src={src}
          inactive={inactive}
          alt={alt}
          onLoad={() => setLoading(false)}
        />
      </video>
    </div>
  )
}

function RenderMintImage({ src = '', inactive = false, alt }: MintImageProps) {
  const extension = src.split('.').pop()
  const isAnimated =
    extension === 'mp4' ||
    extension === 'webm' ||
    extension === 'mov' ||
    extension === 'm4v'
  const isSvg = extension === 'svg'

  if (isAnimated) {
    return <AnimatedImage src={src} inactive={inactive} alt={alt} />
  } else if (isSvg) {
    return <SvgImage src={src} inactive={inactive} alt={alt} />
  } else {
    return <StaticImage src={src} inactive={inactive} alt={alt} />
  }
}

export function MintImage(props: MintImageProps) {
  const { ref, inView } = useInView()

  const [load, setLoad] = useState(false)

  useEffect(() => {
    if (inView) {
      setLoad(true)
    }
  }, [inView])

  return (
    <div ref={ref}>
      {load ? <RenderMintImage {...props} /> : <MediaPlayerLoading />}
    </div>
  )
}
