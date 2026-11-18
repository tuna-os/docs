import {useState} from 'react';
import type {ImgHTMLAttributes, ReactNode} from 'react';

import {screenshotSources} from './screenshot-urls';

type Props = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> & {
  // R2 key without `screenshots/`; see screenshot-urls.ts.
  path: string;
};

function Inner({path, onError, ...rest}: Props): ReactNode {
  const sources = screenshotSources(path);
  const [index, setIndex] = useState(0);
  return (
    <img
      {...rest}
      src={sources[index]}
      onError={(event) => {
        // Try the next source. The caller hears about the error only when the
        // last one fails, so a screenshot that only R2 has is not hidden.
        if (index < sources.length - 1) {
          setIndex(index + 1);
        } else {
          onError?.(event);
        }
      }}
    />
  );
}

// An <img> for a workflow screenshot: the GitHub release first, R2 second.
export default function ShotImg(props: Props): ReactNode {
  // A new path starts again from the first source.
  return <Inner key={props.path} {...props} />;
}
