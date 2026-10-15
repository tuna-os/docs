import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import {useBaseUrlUtils} from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';

import styles from './styles.module.css';

/*
 * Unlisted preview. Universal Blue has not approved the use of the Bazzite
 * mark and name yet (wootc app/branding/bazzite/blessing.json: pending).
 * See README.md in this directory before you link this page from anywhere.
 */

/*
 * Test status. Change to 'proven' when Bazzite has a green branded E2E cell
 * in wootc docs/status.md, and put that run's link in the 'proven' text.
 */
const BAZZITE_STATUS: 'testing' | 'proven' = 'testing';

const STATUS_COPY = {
  testing: {
    label: 'In testing',
    text:
      'Bazzite on this installer is in testing. One automated test install of ' +
      'Bazzite on a Windows 11 test machine passed in August 2026. The full ' +
      'test set for Bazzite and Bazzite Deck is not complete. Bazzite Deck has ' +
      'no passed test install yet.',
  },
  proven: {
    label: 'Tested',
    text:
      'Bazzite passed the full automated test install on a Windows 11 test ' +
      'machine: install, start Linux, and go back to Windows.',
  },
} as const;

const RELEASES = 'https://github.com/tuna-os/wootc/releases/latest';
const DOWNLOAD = `${RELEASES}/download/Bazzite-Installer.exe`;
const VIDEO = 'https://tuna-os.github.io/wootc/e2e/bazzite/';
const BAZZITE_SITE = 'https://bazzite.gg';
const SOURCE = 'https://github.com/tuna-os/wootc';

const STEPS: {title: string; body: ReactNode}[] = [
  {
    title: 'Download the installer on Windows',
    body: (
      <>
        Get <code>Bazzite-Installer.exe</code> and run it as Administrator. You
        do not need a USB stick.
      </>
    ),
  },
  {
    title: 'Pick Bazzite or Bazzite Deck',
    body: (
      <>
        Set a password. The installer suggests your user name, the computer
        name and the disk size. You can change them under Advanced.
      </>
    ),
  },
  {
    title: 'Let it prepare on Windows',
    body: (
      <>
        The installer downloads Bazzite while you are still on Windows, so
        Wi-Fi is not necessary after the restart. It makes a Linux disk file on
        your Windows drive and adds a one-time boot entry.
      </>
    ),
  },
  {
    title: 'Restart into Bazzite',
    body: (
      <>
        Bazzite installs into the disk file. Windows then starts again. Open
        the installer and choose <strong>Restart into Bazzite</strong>. Windows
        stays in the boot menu.
      </>
    ),
  },
];

const IMAGES = [
  {
    name: 'Bazzite',
    desktop: 'KDE Plasma',
    tag: 'Default',
    ref: 'ghcr.io/ublue-os/bazzite:stable',
    description:
      'The next generation of Linux gaming — Steam and game-ready drivers out of the box.',
    fit: 'For a desktop or laptop that you also use for other work.',
  },
  {
    name: 'Bazzite Deck',
    desktop: 'Game Mode (KDE)',
    tag: 'Experimental',
    ref: 'ghcr.io/ublue-os/bazzite-deck:stable',
    description: "Bazzite's console-like experience — boots straight into Steam.",
    fit: 'For a PC that you use like a games console, for example under a TV.',
  },
];

const SHOTS = [
  {
    file: '01-launchpad.png',
    alt: 'Bazzite Installer, step 1 of 3. Two variant cards, Bazzite and Bazzite Deck, with Bazzite selected, then fields for user name, computer name and password, and an Install button.',
    caption: 'Step 1. Pick Bazzite or Bazzite Deck and set a password.',
  },
  {
    file: '02-progress.png',
    alt: 'Bazzite Installer, step 2 of 3. A progress bar at 60 percent and a list of steps from "Checking your PC" to "Saving your settings".',
    caption: 'Step 2. The installer prepares everything on Windows and shows each step.',
  },
  {
    file: '03-done.png',
    alt: 'Bazzite Installer, step 3 of 3. "Bazzite setup is ready", a note about the Windows Boot Manager, a note about MOK enrollment with the password universalblue, and a Reboot Now button.',
    caption: 'Step 3. Setup is ready. Save your work, then restart.',
  },
  {
    file: '04-manage.png',
    alt: 'Manage Bazzite screen. It shows the disk file C:\\wootc\\disks\\root.disk, a "Restart into Bazzite" button, an "Also delete my Linux data" check box, and Reinstall, Uninstall Bazzite and Close buttons.',
    caption: 'Later. Open the installer again to restart into Bazzite or to uninstall it.',
  },
];

const REQUIREMENTS: ReactNode[] = [
  <>Windows 10 or Windows 11, 64-bit, with UEFI firmware.</>,
  <>
    At least 35 GB of free space on <code>C:</code>. Linux uses 20 GB and the
    installer keeps 15 GB free for Windows.
  </>,
  <>Administrator rights on the PC.</>,
  <>
    The WebView2 runtime. If it is not installed, Windows can ask you to
    install it.
  </>,
  <>
    Secure Boot can stay on. The installer checks that your firmware trusts
    its signed loader. If it cannot confirm this, it stops.
  </>,
  <>
    BitLocker must be off on the Windows drive for now. The installer stops on
    an encrypted drive. It does not decrypt Windows for you.
  </>,
];

const FAQ: {q: string; a: ReactNode}[] = [
  {
    q: 'Is this an official Bazzite installer?',
    a: (
      <>
        No. The TunaOS project made it with{' '}
        <a href={SOURCE}>wootc</a>, its open-source installer engine. The
        Bazzite name and logo belong to Universal Blue. We have not received
        their approval yet. For official Bazzite downloads, go to{' '}
        <a href={BAZZITE_SITE}>bazzite.gg</a>.
      </>
    ),
  },
  {
    q: 'Do I need a USB stick?',
    a: <>No. You run the installer on Windows, and it does the rest after a restart.</>,
  },
  {
    q: 'Does it remove Windows?',
    a: (
      <>
        No. Bazzite goes into a disk file on your Windows drive. Windows stays
        in the boot menu, and Windows stays the default.
      </>
    ),
  },
  {
    q: 'What about my Steam games?',
    a: (
      <>
        On Bazzite, <strong>Bring Over From Windows</strong> has a Steam
        library bridge. It can use your games in place, without a new download.
        It also helps with your files, Wi-Fi networks and browser data. Check
        each item on Bazzite before you delete anything on Windows.
      </>
    ),
  },
  {
    q: 'What is the blue "MOK management" screen?',
    a: (
      <>
        Bazzite uses its own kernel key. On the first start, your PC can ask
        you to trust it. Choose <strong>Enroll MOK</strong>, then{' '}
        <strong>Continue</strong>, then <strong>Yes</strong>, and type the
        password <code>universalblue</code>. Secure Boot stays on.
      </>
    ),
  },
  {
    q: 'Why does Windows warn me about the download?',
    a: (
      <>
        The installer does not have a code signature yet. SmartScreen can show
        &ldquo;Windows protected your PC&rdquo;. If you trust the source, click{' '}
        <strong>More info</strong>, then <strong>Run anyway</strong>. You can
        compare the file with the <code>SHA256SUMS</code> file on the release
        page.
      </>
    ),
  },
  {
    q: 'Can I try Bazzite in a window first?',
    a: (
      <>
        Not yet. The plan is to run Linux inside Windows before the first
        restart, but that part is not complete. Today the installer restarts
        the PC to install Bazzite.
      </>
    ),
  },
];

function StatusPill(): ReactNode {
  const s = STATUS_COPY[BAZZITE_STATUS];
  return (
    <span className={styles.pill} data-status={BAZZITE_STATUS}>
      {s.label}
    </span>
  );
}

export default function SwitchToBazzite(): ReactNode {
  const {withBaseUrl} = useBaseUrlUtils();
  const img = (f: string) => withBaseUrl(`/img/switch-to-bazzite/${f}`);
  const logo = img('bazzite-logo.svg');
  const shots = SHOTS.map((s) => ({...s, src: img(s.file)}));
  const status = STATUS_COPY[BAZZITE_STATUS];

  return (
    <Layout
      title="Switch to Bazzite (preview)"
      description="Preview: a Windows installer for Bazzite that keeps your Windows files. Pending approval from the Bazzite project."
      noFooter
      wrapperClassName={styles.wrapper}>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
        <meta name="googlebot" content="noindex, nofollow" />
      </Head>

      <div className={styles.preview} role="note" aria-label="Preview notice">
        <strong>Preview</strong> — pending approval from the Bazzite project.
        Not an official Bazzite page.{' '}
        <Link to="/" className={styles.previewLink}>
          Made by TunaOS
        </Link>
      </div>

      <main className={styles.page} id="bazzite-main">
        <header className={styles.hero}>
          <div className={styles.inner}>
            <div className={styles.brandRow}>
              <img src={logo} alt="" className={styles.brandMark} width={40} height={40} />
              <span className={styles.brandName}>Bazzite Installer</span>
              <span className={styles.brandFor}>for Windows</span>
            </div>
            <h1 className={styles.heroTitle}>
              Switch to Bazzite — keep your Windows files
            </h1>
            <p className={styles.tagline}>
              The next generation of Linux gaming — your Windows files come along.
            </p>
            <div className={styles.ctaRow}>
              <a className={styles.btnPrimary} href={DOWNLOAD}>
                Download Bazzite-Installer.exe
              </a>
              <a className={styles.btnGhost} href={RELEASES}>
                All release files
              </a>
            </div>
            <p className={styles.ctaNote}>
              Windows 10 or 11, 64-bit. Alpha software: keep a backup of your
              files.
            </p>
            <div className={styles.status} role="status">
              <StatusPill />
              <span>
                {status.text}{' '}
                <a href={VIDEO}>Watch the recorded test install</a>.
              </span>
            </div>
          </div>
          <img
            src={logo}
            alt=""
            aria-hidden="true"
            className={styles.heroMark}
            width={600}
            height={600}
          />
        </header>

        <section className={styles.section} aria-labelledby="bz-who">
          <div className={styles.inner}>
            <h2 id="bz-who">For Windows gamers</h2>
            <p className={styles.lede}>
              You play on Windows and you want to try Bazzite. You do not want
              to lose your files, and you do not want to make a USB stick. This
              installer runs on Windows. It puts Bazzite next to Windows and
              helps you bring your files, Wi-Fi networks and Steam library
              across.
            </p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="bz-how">
          <div className={styles.inner}>
            <h2 id="bz-how">How it works</h2>
            <ol className={styles.steps}>
              {STEPS.map((s, i) => (
                <li key={s.title} className={styles.step}>
                  <span className={styles.stepNum} aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="bz-pick">
          <div className={styles.inner}>
            <h2 id="bz-pick">Pick your Bazzite</h2>
            <div className={styles.cards}>
              {IMAGES.map((im) => (
                <article key={im.name} className={styles.card}>
                  <div className={styles.cardHead}>
                    <img src={logo} alt="" width={28} height={28} />
                    <h3>{im.name}</h3>
                    <span className={styles.chip}>{im.desktop}</span>
                  </div>
                  <p className={styles.cardDesc}>{im.description}</p>
                  <p className={styles.cardFit}>{im.fit}</p>
                  <p className={styles.cardMeta}>
                    <span className={styles.tag}>{im.tag}</span>{' '}
                    <code>{im.ref}</code>
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="bz-look">
          <div className={styles.inner}>
            <h2 id="bz-look">What you see</h2>
            <p className={styles.lede}>
              These are the real installer screens. An automated test makes
              them from the Bazzite build.
            </p>
            <div className={styles.shots}>
              {shots.map((s) => (
                <figure key={s.file} className={styles.shot}>
                  <img src={s.src} alt={s.alt} width={820} height={620} loading="lazy" />
                  <figcaption>{s.caption}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="bz-need">
          <div className={styles.inner}>
            <div className={styles.twoCol}>
              <div>
                <h2 id="bz-need">What you need</h2>
                <ul className={styles.list}>
                  {REQUIREMENTS.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 id="bz-safe">What happens to Windows</h2>
                <ul className={styles.list}>
                  <li>Windows stays. Bazzite does not replace it.</li>
                  <li>
                    The installer changes boot entries and boot files. It also
                    turns off Fast Startup and hibernation.
                  </li>
                  <li>
                    After the install, Windows stays the default. You choose
                    when to start Bazzite.
                  </li>
                  <li>
                    If setup stops, open the installer again. Its recovery
                    screen can keep Windows only or repair the boot files.
                  </li>
                  <li>Keep your own backup. A failed install can need recovery.</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="bz-back">
          <div className={styles.inner}>
            <h2 id="bz-back">Go back to Windows, or uninstall</h2>
            <ul className={styles.list}>
              <li>
                To use Windows, choose <strong>Windows Boot Manager</strong> in
                the boot menu. Windows is the default after the install.
              </li>
              <li>
                To uninstall, run <code>Bazzite-Installer.exe</code> again as
                Administrator and choose <strong>Uninstall Bazzite</strong>. You
                can also use <strong>Settings → Apps → Installed apps</strong>.
              </li>
              <li>
                Uninstall keeps your Linux disk file. Select{' '}
                <strong>Also delete my Linux data</strong> only if you want to
                delete it and the files in it.
              </li>
              <li>
                Cleanup can be incomplete. Read any error that it shows before
                you try again.
              </li>
            </ul>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="bz-faq">
          <div className={styles.inner}>
            <h2 id="bz-faq">Questions</h2>
            <div className={styles.faq}>
              {FAQ.map((f) => (
                <details key={f.q} className={styles.faqItem}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="bz-links">
          <div className={styles.inner}>
            <h2 id="bz-links">Links</h2>
            <ul className={styles.links}>
              <li>
                <a href={DOWNLOAD}>Download Bazzite-Installer.exe</a> — from
                the latest wootc release
              </li>
              <li>
                <a href={BAZZITE_SITE}>bazzite.gg</a> — the Bazzite project
              </li>
              <li>
                <a href={VIDEO}>Recorded test install of Bazzite</a> — a sped-up
                video of an automated run
              </li>
              <li>
                <Link to="/docs/wootc/user-guide">wootc user guide</Link> — the
                engine behind this installer, in full detail
              </li>
              <li>
                <a href={SOURCE}>Source code on GitHub</a>
              </li>
            </ul>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.inner}>
            <p>
              Bazzite and the Bazzite logo belong to Universal Blue. This page
              uses them as a preview, pending their approval. Made by the{' '}
              <Link to="/">TunaOS</Link> project with{' '}
              <a href={SOURCE}>wootc</a>.
            </p>
          </div>
        </footer>
      </main>
    </Layout>
  );
}
