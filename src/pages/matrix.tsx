import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import BuildMatrix from '@site/src/components/BuildMatrix';

export default function Matrix(): ReactNode {
  return (
    <Layout
      title="Build Matrix"
      description="Every TunaOS variant and desktop, at a glance — what's built, what has a live ISO, and what's still coming.">
      <main className="container margin-bottom--xl">
        <BuildMatrix />
      </main>
    </Layout>
  );
}
