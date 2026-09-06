import React, {type ReactNode} from 'react';

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

export default function AnimatedEmoji(_props: {
  emoji: string;
  size?: number;
  className?: string;
  alt?: string;
  speed?: number;
}): ReactNode {
  return null;
}
