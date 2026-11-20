import {useEffect, useRef, useState} from 'react';
import type {ImgHTMLAttributes, ReactNode} from 'react';

import {screenshotSources} from './screenshot-urls';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'onError'> & {
  // R2 key without `screenshots/`; see screenshot-urls.ts.
  path: string;
  // Called once every source has failed.
  onError?: () => void;
};

function Inner({path, onError, ...rest}: Props): ReactNode {
  const sources = screenshotSources(path);
  const [index, setIndex] = useState(0);
  const ref = useRef<HTMLImageElement>(null);

  // Try the next source. The caller hears about the error only when the last
  // one fails, so a screenshot that only R2 has is not hidden.
  const fail = () => {
    if (index < sources.length - 1) {
      setIndex(index + 1);
    } else {
      onError?.();
    }
  };

  // The server-rendered <img> starts loading before React hydrates, and an
  // error that fires before then reaches no listener. Without this check a
  // missing screenshot stays on the page as a broken image.
  useEffect(() => {
    const img = ref.current;
    if (img?.complete && img.naturalWidth === 0) fail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return <img {...rest} ref={ref} src={sources[index]} onError={fail} />;
}

// An <img> for a workflow screenshot: the GitHub release first, R2 second.
export default function ShotImg(props: Props): ReactNode {
  // A new path starts again from the first source.
  return <Inner key={props.path} {...props} />;
}
