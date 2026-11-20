import {useEffect, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {
  OS_LABEL,
  detectPlatform,
  formatSize,
  parseMediaWriter,
  type MediaWriterRelease,
  type Platform,
} from '@site/src/data/media-writer';
import page from '@site/src/css/page.module.css';
import styles from './styles.module.css';

const DOWNLOADS_URL = 'https://iso.tunaos.org/downloads.json';
const RELEASES_URL = 'https://github.com/tuna-os/iso-builder/releases/latest';
const BROWSER_BUILDER_URL = 'https://iso.tunaos.org/';

const FILE_KIND = {windows: '.msi installer', macos: '.dmg disk image', linux: 'Flatpak bundle'};

// The top of /download: one button for the app that matches the visitor's
// computer. The server render has no user agent, so it shows the generic
// release link until the browser detects the platform.
export default function MediaWriterDownload(): ReactNode {
  const [platform, setPlatform] = useState<Platform | null>(null);
  const [release, setRelease] = useState<MediaWriterRelease | null>(null);

  useEffect(() => {
    setPlatform(
      detectPlatform({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        maxTouchPoints: navigator.maxTouchPoints,
      }),
    );

    // If this fails (offline, blocked, or no CORS header), the buttons keep
    // pointing at the GitHub release page.
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);
    fetch(DOWNLOADS_URL, {cache: 'no-cache', signal: controller.signal})
      .then((res) => (res.ok ? res.json() : null))
      .then((doc) => setRelease(parseMediaWriter(doc)))
      .catch(() => setRelease(null))
      .finally(() => clearTimeout(timeout));
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  if (platform?.kind === 'mobile') {
    return (
      <section className={styles.card} aria-labelledby="media-writer-title">
        <h2 id="media-writer-title" className={styles.title}>
          Install TunaOS from a computer
        </h2>
        <p className={styles.text}>
          TunaOS installs on a desktop or laptop PC. Open{' '}
          <strong>tunaos.org/download</strong> on the Windows, macOS or Linux computer you
          want to use: the page then offers TunaOS Media Writer, which gets the ISO and
          writes it to a USB stick.
        </p>
      </section>
    );
  }

  const desktop = platform?.kind === 'windows' || platform?.kind === 'macos' || platform?.kind === 'linux';
  const asset = desktop ? release?.assets[platform.asset] : undefined;
  const label = desktop ? `Get TunaOS Media Writer for ${OS_LABEL[platform.kind]}` : 'Get TunaOS Media Writer';
  const meta = [
    release?.version && `Version ${release.version}`,
    asset && desktop && FILE_KIND[platform.kind],
    asset?.size && formatSize(asset.size),
  ].filter(Boolean);
  const otherArch =
    platform?.kind === 'linux'
      ? release?.assets[platform.asset === 'linux-x86_64' ? 'linux-aarch64' : 'linux-x86_64']
      : undefined;

  return (
    <section className={styles.card} aria-labelledby="media-writer-title">
      <h2 id="media-writer-title" className={styles.title}>
        The easy way: TunaOS Media Writer
      </h2>
      <p className={styles.text}>
        Pick an image in the app. It downloads or builds the ISO and, if you want,
        writes it to a USB stick.
      </p>
      <div className={clsx(page.btnRow, page.btnRowLeft, styles.actions)}>
        <a className={clsx('button', page.btnPrimary)} href={asset?.url ?? RELEASES_URL}>
          {label}
        </a>
        <a className={clsx('button', page.btnGhost)} href={BROWSER_BUILDER_URL}>
          Or build an ISO in your browser
        </a>
      </div>
      {meta.length > 0 && <p className={styles.meta}>{meta.join(' · ')}</p>}
      {asset?.signed === false && platform?.kind === 'windows' && (
        <p className={styles.meta}>
          The installer is not code-signed yet, so Windows SmartScreen can show a warning.
        </p>
      )}
      {asset?.signed === false && platform?.kind === 'macos' && (
        <p className={styles.meta}>
          The app is not notarized yet: if macOS blocks it, open System Settings › Privacy
          &amp; Security and choose Open Anyway.
        </p>
      )}
      <ul className={styles.links}>
        {platform?.kind === 'windows' && (
          <li>
            <Link to="/wootc">Install from Windows without a USB stick (wootc)</Link>
          </li>
        )}
        {otherArch && platform?.kind === 'linux' && (
          <li>
            <a href={otherArch.url}>
              {platform.asset === 'linux-x86_64' ? 'Linux on ARM (aarch64)' : 'Linux on x86_64'}
            </a>
          </li>
        )}
        <li>
          <a href={RELEASES_URL}>All Media Writer downloads</a>
        </li>
      </ul>
    </section>
  );
}
