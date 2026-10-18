import {useEffect, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import {parseBuildHealth, type BuildHealth} from '../data/build-health-types';

export type BuildHealthState =
  | {status: 'loading'; feed: null; error: null}
  | {status: 'available'; feed: BuildHealth; error: null}
  | {status: 'unavailable'; feed: null; error: string};

export default function useBuildHealth(): BuildHealthState {
  const url = useBaseUrl('/api/build-health');
  const [state, setState] = useState<BuildHealthState>({status: 'loading', feed: null, error: null});
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    const timeout = setTimeout(() => controller.abort(), 15000);
    setState({status: 'loading', feed: null, error: null});
    (async () => {
      try {
        const response = await fetch(url, {cache: 'no-cache', credentials: 'omit', signal: controller.signal});
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        if (!response.body) throw new Error('Missing response body');
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8', {fatal: true});
        let bytes = 0;
        let body = '';
        try {
          while (true) {
            const chunk = await reader.read();
            if (chunk.done) break;
            bytes += chunk.value.byteLength;
            if (bytes > 2 * 1024 * 1024) throw new Error('Build health feed exceeds size limit');
            body += decoder.decode(chunk.value, {stream: true});
          }
          body += decoder.decode();
        } finally {
          await reader.cancel().catch(() => {});
          reader.releaseLock();
        }
        const feed = parseBuildHealth(body);
        if (!feed) throw new Error('Invalid build health feed');
        if (active) setState({status: 'available', feed, error: null});
      } catch {
        if (active) setState({status: 'unavailable', feed: null, error: 'The build health feed is unavailable or invalid.'});
      } finally {
        clearTimeout(timeout);
      }
    })();
    return () => {active = false; clearTimeout(timeout); controller.abort();};
  }, [url]);
  return state;
}
