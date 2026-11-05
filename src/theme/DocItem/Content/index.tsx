import React from 'react';
import Content from '@theme-original/DocItem/Content';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import snapshots from '@site/src/data/synced-docs.json';

type Snapshot = {
  revision: string;
  lastSuccessfulFetch: string;
  status: string;
  pages: Record<string, string>;
};

export default function DocContent(props: React.ComponentProps<typeof Content>) {
  const {metadata} = useDoc();
  const source = Object.entries(snapshots as Record<string, Snapshot>)
    .find(([, snapshot]) => snapshot.pages[metadata.id]);
  return <>
    {source && (() => {
      const [repo, snapshot] = source;
      const path = snapshot.pages[metadata.id];
      const url = `https://github.com/tuna-os/${repo}/blob/${snapshot.revision}/${path.split('/').map(encodeURIComponent).join('/')}`;
      return <aside className="alert alert--secondary margin-bottom--md" aria-label="Documentation source">
        <small>
          <a href={url}>Source: {repo}/{path} @ {snapshot.revision.slice(0, 7)}</a>
          {' · Last successful source fetch: '}
          <time dateTime={snapshot.lastSuccessfulFetch}>{snapshot.lastSuccessfulFetch}</time>
          {snapshot.status === 'stale'
            ? ' · Stale: source refresh failed; showing the last snapshot.'
            : ' · Snapshot from the last successful sync.'}
        </small>
      </aside>;
    })()}
    <Content {...props} />
  </>;
}
