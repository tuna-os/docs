import React from 'react';
import ThemedImage from '@theme/ThemedImage';
import {emojiMarkFor, wordmarkFor} from '@site/src/data/identity';

// A variant's wordmark for wide contexts: headers, cards, the hero. It follows
// the colour mode. A variant without a wordmark shows its emoji mark instead.
// The wordmark names the variant, so it is decorative (alt="") where a visible
// name sits beside it, and labelled otherwise.
export default function Wordmark({
  variantId,
  className,
  height,
  alt = '',
}: {
  variantId: string;
  className?: string;
  height: number;
  alt?: string;
}): React.ReactElement {
  const sources = wordmarkFor(variantId);
  if (!sources) {
    return (
      <img className={className} src={emojiMarkFor(variantId)} alt={alt} width={height} height={height} loading="lazy" />
    );
  }
  return <ThemedImage className={className} sources={sources} alt={alt} height={height} loading="lazy" />;
}
