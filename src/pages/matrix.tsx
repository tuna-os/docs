import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import BuildMatrix from '@site/src/components/BuildMatrix';
import BuildPulse, {elapsed} from '@site/src/components/BuildPulse';
import useIsoIndex from '@site/src/hooks/useIsoIndex';
import BuildStreamFamily from '@site/src/components/BuildStreamFamily';
import {ALL_DESKTOPS} from '@site/src/data/variants';
import {desktopLogo} from '@site/src/data/identity';

import page from '@site/src/css/page.module.css';
import styles from './matrix.module.css';

function Desktops(): ReactNode {
  return (
    <ul className={styles.desktops}>
      {ALL_DESKTOPS.map((d) => (
        <li key={d.tag} className={styles.desktop}>
          {desktopLogo(d.tag) && (
            <img
              className={styles.desktopLogo}
              src={desktopLogo(d.tag)!}
              alt=""
              width={26}
              height={26}
              loading="lazy"
            />
          )}
          <span className={styles.desktopName}>{d.name}</span>
          <span className={styles.desktopBlurb}>{d.blurb}</span>
        </li>
      ))}
    </ul>
  );
}

export default function Matrix(): ReactNode {
  const index = useIsoIndex();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => setNow(Date.now()), [index]);

  const asOf =
    index?.generatedAt && now !== null ? `${elapsed(index.generatedAt, now)} ago` : null;

  return (
    <Layout
      title="Build matrix"
      description="The TunaOS distro × desktop image grid with live ISO state, plus a separate catalog of independently built BuildStream images.">
      <header className={page.hero}>
        <div className={clsx(page.heroInner, page.heroWide)}>
          <span className={page.eyebrow}>Build matrix</span>
          <Heading as="h1" className={page.heroTitle}>
            Every base, every desktop, as it stands right now
          </Heading>
          <p className={page.heroLede}>
            Fourteen base distributions × six desktops, with live ISO state from the release
            index. The separately built BuildStream image family is listed below; its
            products are not distro-by-desktop cells.
          </p>
        </div>
      </header>

      <main>
        <section className={clsx(page.section, page.sectionFirst)}>
          <div className={page.sectionInner}>
            <BuildPulse index={index} />
          </div>
        </section>

        <section className={clsx(page.section, page.sectionAlt)}>
          <div className={page.sectionInner}>
            <div className={page.sectionHead}>
              <Heading as="h2" className={page.sectionTitle}>
                <span className={page.sectionMark}>01.</span>
                The matrix
              </Heading>
              <p className={page.sectionSub}>
                Each cell is one base plus one desktop. A filled cell has a live ISO you
                can download, shaded by how recently it was built; an outlined one is an
                OCI image you can rebase onto. <strong>N</strong> and <strong>H</strong>
                {' '}mark bases that also ship NVIDIA and HWE-kernel editions.
              </p>
            </div>
            <BuildMatrix index={index} />
            <p className={styles.asOf}>
              {asOf
                ? `Index regenerated ${asOf} · refreshed from the release bucket on a schedule`
                : 'Reading the live index…'}
            </p>
            <div className={clsx(page.btnRow, page.btnRowLeft)}>
              <Link className={clsx('button', page.btnPrimary)} to="/download">
                Download an ISO
              </Link>
              <Link className={clsx('button', page.btnGhost)} to="/iso-builder">
                Build your own
              </Link>
              <Link className={clsx('button', page.btnGhost)} to="/variants">
                Compare the bases
              </Link>
            </div>
          </div>
        </section>

        <section className={page.section}>
          <div className={page.sectionInner}>
            <div className={page.sectionHead}>
              <Heading as="h2" className={page.sectionTitle}>
                <span className={page.sectionMark}>02.</span>
                The desktops
              </Heading>
              <p className={page.sectionSub}>
                The same desktop layer, built across every base that can carry it. Pick
                the desktop you want and the base you trust — they are separate choices.
              </p>
            </div>
            <Desktops />
          </div>
        </section>

        <section className={clsx(page.section, page.sectionAlt)}>
          <div className={page.sectionInner}>
            <div className={page.sectionHead}>
              <Heading as="h2" className={page.sectionTitle}>
                <span className={page.sectionMark}>03.</span>
                BuildStream image variants
              </Heading>
              <p className={page.sectionSub}>
                These TunaOS images have independent BuildStream projects and release pipelines.
                Their rows belong in this image matrix, but not in the distro × desktop counts
                above. Athens is experimental and has no published image.
              </p>
            </div>
            <BuildStreamFamily />
          </div>
        </section>
      </main>
    </Layout>
  );
}
