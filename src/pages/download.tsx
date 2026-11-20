import type {ReactNode} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import InstallChooser from '@site/src/components/InstallChooser';
import page from '@site/src/css/page.module.css';
import styles from './download.module.css';

// The one place on the site that says how to install TunaOS. The home page,
// the navbar, the variant pages and the docs all link here.
export default function Download(): ReactNode {
  return (
    <Layout
      title="Download and install"
      description="Install TunaOS: make a USB installer with TunaOS Media Writer, try it from Windows and keep Windows, or switch from another Linux system.">
      <header className={page.hero}>
        <div className={page.heroInner}>
          <span className={page.eyebrow}>Download</span>
          <Heading as="h1" className={page.heroTitle}>
            Install TunaOS
          </Heading>
          <p className={page.heroLede}>
            There are three ways. Most people make a USB installer. To keep Windows, try it
            from Windows. Already on Linux? Open the third option.
          </p>
        </div>
      </header>
      <main className={clsx('container', styles.main)}>
        <InstallChooser />
      </main>
    </Layout>
  );
}
