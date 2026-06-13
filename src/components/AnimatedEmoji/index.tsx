import React, {useEffect, useRef, useState} from 'react';

const CDN_BASE = 'https://fonts.gstatic.com/s/e/notoemoji/latest';

const EMOJI_MAP: Record<string, string> = {
  '🐟': '1f41f', '🐠': '1f420', '🍣': '1f363', '🎣': '1f3a3',
  '🛠': '1f6e0', '📦': '1f4e6', '💻': '1f4bb', '🦝': '1f99d',
  '🌌': '1f30c', '💪': '1f4aa', '⚙': '2699', '🍻': '1f37b',
  '🐧': '1f427', '🚀': '1f680', '📚': '1f4da', '⚡': '26a1',
  '✨': '2728', '🐡': '1f421', '🦈': '1f988', '🍜': '1f35c',
  '🐳': '1f433', '🌊': '1f30a', '❄': '2744', '📺': '1f4fa',
  '🦀': '1f980', '🍷': '1f377', '🥂': '1f942',
  '🦖': '1f996', '🦕': '1f995', '🌺': '1f33a',
};

const LOTTIE_OK = new Set([
  '1f30c', '1f41f', '1f996', '1f4bb', '1f680', '1f427', '1f6e0',
  '1f995', '1f4aa', '1f4e6', '1f4da', '26a1', '2728', '1f421',
  '1f988', '1f35c', '1f433', '1f30a', '1f4fa', '1f980', '1f377',
  '1f942', '1f99d', '2699', '1f37b', '1f30b', '2744',
]);

// Pre-loaded Lottie module
let DotLottieModule: any = null;
function preloadLottie() {
  if (DotLottieModule) return;
  import('@lottiefiles/dotlottie-web').then(m => { DotLottieModule = m; });
}

type Props = {
  emoji: string;
  size?: number;
  className?: string;
  alt?: string;
  speed?: number;
};

export default function AnimatedEmoji({emoji, size = 32, className, alt, speed = 1}: Props) {
  const code = EMOJI_MAP[emoji];
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lottieReady, setLottieReady] = useState(false);
  const hasLottie = code && LOTTIE_OK.has(code);

  useEffect(() => { preloadLottie(); }, []);

  useEffect(() => {
    if (!hasLottie || !canvasRef.current) return;
    let cancelled = false;
    let instance: any = null;

    const init = async () => {
      // Wait for module to load
      while (!DotLottieModule) {
        await new Promise(r => setTimeout(r, 50));
        if (cancelled) return;
      }
      if (cancelled || !canvasRef.current) return;
      instance = new DotLottieModule.DotLottie({
        autoplay: true,
        loop: true,
        speed,
        canvas: canvasRef.current,
        src: `${CDN_BASE}/${code}/lottie.json`,
      });
      setLottieReady(true);
    };

    init();
    return () => {
      cancelled = true;
      instance?.destroy();
    };
  }, [code, hasLottie, speed]);

  if (!code) {
    return <span className={className} style={{fontSize: size}} role="img" aria-label={alt || emoji}>{emoji}</span>;
  }

  if (hasLottie) {
    // Show canvas immediately (Lottie fills it asynchronously).
    // No flash — the canvas is invisible until lottieReady.
    return (
      <span
        className={className}
        style={{display: 'inline-block', width: size, height: size, lineHeight: 0, opacity: lottieReady ? 1 : 0}}
        role="img"
        aria-label={alt || emoji}
      >
        <canvas
          ref={canvasRef}
          width={size * 2}
          height={size * 2}
          style={{width: size, height: size}}
        />
      </span>
    );
  }

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
