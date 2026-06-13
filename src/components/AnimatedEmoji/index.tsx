import React, {useEffect, useRef} from 'react';

const CDN_BASE = 'https://fonts.gstatic.com/s/e/notoemoji/latest';

const EMOJI_MAP: Record<string, string> = {
  '🐟': '1f41f',
  '🐠': '1f420',
  '🍣': '1f363',
  '🎣': '1f3a3',
  '🛠': '1f6e0',
  '📦': '1f4e6',
  '💻': '1f4bb',
  '🦝': '1f99d',
  '🌌': '1f30c',
  '💪': '1f4aa',
  '⚙':  '2699',
  '🍻': '1f37b',
  '🐧': '1f427',
  '🚀': '1f680',
  '📚': '1f4da',
  '⚡': '26a1',
  '✨': '2728',
  '🐡': '1f421',
  '🦈': '1f988',
  '🍜': '1f35c',
  '🐳': '1f433',
  '🌊': '1f30a',
  '❄':  '2744',
  '📺': '1f4fa',
  '🦀': '1f980',
  '🍷': '1f377',
  '🥂': '1f942',
  '🦖': '1f996',
  '🦕': '1f995',
  '🌺': '1f33a',
};

// Emojis that have verified Lottie animations on the CDN
const LOTTIE_OK = new Set([
  '1f30c', '1f41f', '1f996', '1f4bb', '1f680', '1f427', '1f6e0',
  '1f995', '1f4aa', '1f4e6', '1f4da', '26a1', '2728', '1f421',
  '1f988', '1f35c', '1f433', '1f30a', '1f4fa', '1f980', '1f377',
  '1f942', '1f99d', '2699', '1f37b', '1f30b', '2744',
]);

type Props = {
  emoji: string;
  size?: number;
  className?: string;
  alt?: string;
  speed?: number; // 0.5 = half speed, 2 = double speed, default 1
};

export default function AnimatedEmoji({emoji, size = 32, className, alt, speed = 1}: Props) {
  const code = EMOJI_MAP[emoji];
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLottie = code && LOTTIE_OK.has(code);

  useEffect(() => {
    if (!hasLottie || !containerRef.current) return;
    let cancelled = false;

    import('@lottiefiles/dotlottie-web').then(({DotLottie}) => {
      if (cancelled) return;
      const dotLottie = new DotLottie({
        autoplay: true,
        loop: true,
        speed,
        canvas: containerRef.current!.querySelector('canvas')!,
        src: `${CDN_BASE}/${code}/lottie.json`,
      });
      return () => dotLottie.destroy();
    });

    return () => { cancelled = true; };
  }, [code, hasLottie, speed]);

  if (!code) {
    return <span className={className} style={{fontSize: size}} role="img" aria-label={alt || emoji}>{emoji}</span>;
  }

  if (hasLottie) {
    return (
      <span
        ref={containerRef}
        className={className}
        style={{display: 'inline-block', width: size, height: size, lineHeight: 0}}
        role="img"
        aria-label={alt || emoji}
      >
        <canvas width={size * 2} height={size * 2} style={{width: size, height: size}} />
      </span>
    );
  }

  // Fallback: GIF
  return (
    <img
      src={`${CDN_BASE}/${code}/512.gif`}
      alt={alt || emoji}
      width={size}
      height={size}
      className={className}
      style={{display: 'inline-block', imageRendering: 'auto'}}
      loading="lazy"
    />
  );
}
