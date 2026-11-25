import {useEffect, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useBrokenLinks from '@docusaurus/useBrokenLinks';
import {
  OS_LABEL,
  detectPlatform,
  formatSize,
  parseMediaWriter,
  type MediaWriterRelease,
  type Platform,
} from '@site/src/data/media-writer';
import {WOOTC_INSTALLER_SIZE, WOOTC_INSTALLER_URL} from '@site/src/data/wootc';
import IsoDownloads from '@site/src/components/IsoDownloads';
import {X13S_BUILDER_URL, X13S_GUIDE_URL, X13S_REPORT_URL} from '@site/src/data/x13s';
import FactoryHealth from '@site/src/components/FactoryHealth';
import page from '@site/src/css/page.module.css';
import styles from './styles.module.css';

const DOWNLOADS_URL = 'https://iso.tunaos.org/downloads.json';
const RELEASES_URL = 'https://github.com/tuna-os/iso-builder/releases/latest';
const BROWSER_BUILDER_URL = 'https://iso.tunaos.org/';
const ETCHER_URL = 'https://etcher.balena.io/';
const RECOMMENDED_ISO = {
  name: 'Yellowfin (AlmaLinux Kitten 10) with GNOME',
  url: 'https://download.tunaos.org/live-isos/yellowfin-gnome-latest.iso',
  size: '6.2 GB',
};
const REBASE_COMMAND = 'sudo bootc-migrate --target-image ghcr.io/tuna-os/yellowfin:gnome';
const FLATPAK_SETUP = [
  'sudo apt install flatpak gnome-software-plugin-flatpak',
  'flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo',
].join('\n');

const FILE_KIND = {windows: '.msi installer', macos: '.dmg disk image', linux: 'Flatpak bundle'};

// navigator.userAgentData is Chromium-only and missing from the DOM lib.
type UADataNavigator = Navigator & {
  userAgentData?: {getHighEntropyValues(hints: string[]): Promise<{architecture?: string}>};
};

type Visitor = {
  platform: Platform | null;
  // True only when the browser says so (Chromium client hints). Safari and
  // Firefox report every Mac as Intel, so macOS visitors see the Apple
  // Silicon notice whatever this is.
  armMac: boolean;
  ubuntu: boolean;
};

function useVisitor(): Visitor {
  const [visitor, setVisitor] = useState<Visitor>({platform: null, armMac: false, ubuntu: false});
  useEffect(() => {
    const platform = detectPlatform({
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      maxTouchPoints: navigator.maxTouchPoints,
    });
    // Ubuntu's Firefox names the distribution in its user agent; Chrome does not.
    const ubuntu = /Ubuntu/i.test(navigator.userAgent);
    setVisitor({platform, armMac: false, ubuntu});
    const uaData = (navigator as UADataNavigator).userAgentData;
    if (platform.kind === 'macos' && uaData) {
      uaData
        .getHighEntropyValues(['architecture'])
        .then(({architecture}) => {
          if (architecture === 'arm') setVisitor({platform, armMac: true, ubuntu});
        })
        .catch(() => {});
    }
  }, []);
  return visitor;
}

function useMediaWriterRelease(): MediaWriterRelease | null {
  const [release, setRelease] = useState<MediaWriterRelease | null>(null);
  useEffect(() => {
    // If this fails (offline, blocked, or no CORS header), the button keeps
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
  return release;
}

function AppleSiliconNotice({armMac}: {armMac: boolean}): ReactNode {
  return (
    <aside className={clsx(styles.notice, styles.noticeWarn)} role="note">
      <strong>
        {armMac
          ? 'Your Mac has an Apple chip. TunaOS is not available for it yet.'
          : 'Mac with an Apple chip (M1 or newer)? TunaOS is not available for it yet.'}
      </strong>{' '}
      An installer for M1 and M2 Macs is in development.{' '}
      {!armMac && 'Macs with an Intel processor can use the USB installer below. '}
      <Link to="/docs/apple-silicon">Which Mac do I have?</Link>
    </aside>
  );
}

function PhoneNotice(): ReactNode {
  const [copied, setCopied] = useState(false);
  const share = () => {
    const url = 'https://tunaos.org/download';
    if (navigator.share) {
      navigator.share({title: 'Install TunaOS', url}).catch(() => {});
      return;
    }
    navigator.clipboard?.writeText(url).then(() => setCopied(true)).catch(() => {});
  };
  return (
    <aside className={styles.notice} role="note">
      <strong>You&apos;ll need a Windows, Mac or Linux PC and a 16 GB USB stick.</strong>{' '}
      TunaOS installs on a desktop or laptop computer, not on a phone or tablet. Open this
      page on that computer.
      <div className={styles.noticeActions}>
        <button type="button" className={clsx('button', page.btnGhost, page.btnSmall)} onClick={share}>
          {copied ? 'Link copied' : 'Send this link to my computer'}
        </button>
      </div>
    </aside>
  );
}

function EraseWarning({windows}: {windows: boolean}): ReactNode {
  return (
    <p className={styles.warn}>
      <strong>Installing erases the computer&apos;s drive.</strong>{' '}
      {windows ? 'Want to keep Windows? ' : 'Want to keep Windows on a PC? '}
      <a href="#windows">Use wootc</a>.
    </p>
  );
}

function UsbCard({visitor, release}: {visitor: Visitor; release: MediaWriterRelease | null}): ReactNode {
  const {platform, ubuntu} = visitor;
  const desktop =
    platform?.kind === 'windows' || platform?.kind === 'macos' || platform?.kind === 'linux';
  const asset = desktop ? release?.assets[platform.asset] : undefined;
  const meta = [
    release?.version && `Version ${release.version}`,
    asset && desktop && FILE_KIND[platform.kind],
    asset?.size && formatSize(asset.size),
  ].filter(Boolean);
  const otherArch =
    platform?.kind === 'linux'
      ? release?.assets[platform.asset === 'linux-x86_64' ? 'linux-aarch64' : 'linux-x86_64']
      : undefined;
  const fileName = asset?.url.split('/').pop();

  return (
    <section id="usb" className={clsx(styles.option, styles.optionMain)} aria-labelledby="usb-title">
      <div className={styles.optionHead}>
        <span className={styles.badge}>Recommended</span>
        <h2 id="usb-title" className={styles.optionTitle}>
          Make a USB installer
        </h2>
        <p className={styles.optionLede}>
          Replace the system on a computer with TunaOS. TunaOS Media Writer downloads TunaOS
          and puts it on a USB stick for you.
        </p>
      </div>
      <dl className={styles.needs}>
        <dt>You need</dt>
        <dd>A USB stick, 16 GB or larger. Everything on it is erased.</dd>
      </dl>
      <EraseWarning windows={platform?.kind === 'windows'} />

      {platform?.kind === 'mobile' ? (
        <p className={styles.text}>Open this page on the computer to get TunaOS Media Writer.</p>
      ) : (
        <>
          {platform?.kind === 'linux' && (
            <details className={styles.fold} open={ubuntu}>
              <summary>First time on Ubuntu or Debian? Set up Flatpak first</summary>
              <p className={styles.text}>
                The Linux app comes as a Flatpak. Ubuntu and Debian do not include Flatpak, so run
                this once in a terminal, then restart the computer:
              </p>
              <pre className={page.code}>
                <code>{FLATPAK_SETUP}</code>
              </pre>
              {fileName && (
                <p className={styles.text}>
                  After the download, open the file with <strong>Software</strong>, or run{' '}
                  <code>flatpak install ~/Downloads/{fileName}</code>.
                </p>
              )}
              <p className={styles.text}>
                Fedora, Linux Mint and most other systems already have Flatpak.
              </p>
            </details>
          )}
          <div className={clsx(page.btnRow, page.btnRowLeft, styles.actions)}>
            <a className={clsx('button', page.btnPrimary)} href={asset?.url ?? RELEASES_URL}>
              {desktop ? `Get TunaOS Media Writer for ${OS_LABEL[platform.kind]}` : 'Get TunaOS Media Writer'}
            </a>
          </div>
          {meta.length > 0 && <p className={styles.meta}>{meta.join(' · ')}</p>}
          {asset?.signed === false && platform?.kind === 'windows' && (
            <p className={styles.meta}>
              The installer is not code-signed yet. If Windows shows &quot;Windows protected your
              PC&quot;, select <strong>More info</strong>, then <strong>Run anyway</strong>.
            </p>
          )}
          {asset?.signed === false && platform?.kind === 'macos' && (
            <p className={styles.meta}>
              The app is not notarized yet. If macOS blocks it, open System Settings › Privacy
              &amp; Security and choose <strong>Open Anyway</strong>.
            </p>
          )}
        </>
      )}

      <ol className={styles.steps}>
        <li>
          In Media Writer, choose <strong>{RECOMMENDED_ISO.name}</strong> (recommended if you are
          not sure) and your USB stick.
        </li>
        <li>
          <Link to="/docs/start-from-usb">Start your computer from the USB stick</Link>.
        </li>
        <li>
          <Link to="/docs/installer">Install TunaOS</Link> (about 15 minutes).
        </li>
      </ol>

      <ul className={styles.links}>
        {otherArch && platform?.kind === 'linux' && (
          <li>
            <a href={otherArch.url}>
              {platform.asset === 'linux-x86_64' ? 'Linux on ARM (aarch64)' : 'Linux on x86_64'}
            </a>
          </li>
        )}
        <li>
          <a href={RELEASES_URL}>Media Writer for other systems</a>
        </li>
        {platform?.kind !== 'mobile' && (
          <li>
            Or use <a href={ETCHER_URL}>balenaEtcher</a> with the{' '}
            <a href={RECOMMENDED_ISO.url}>Yellowfin GNOME ISO ({RECOMMENDED_ISO.size})</a>
          </li>
        )}
      </ul>
    </section>
  );
}

function WindowsCard({platform}: {platform: Platform | null}): ReactNode {
  // Before detection (and in the server render) the card is active; it only
  // greys out once the browser says it is not Windows.
  const other = platform !== null && platform.kind !== 'windows';
  return (
    <section
      id="windows"
      className={clsx(styles.option, other && styles.optionMuted)}
      aria-labelledby="windows-title">
      <div className={styles.optionHead}>
        <span className={clsx(styles.badge, styles.badgeAlpha)}>Alpha</span>
        <h2 id="windows-title" className={styles.optionTitle}>
          Try it from Windows, keep Windows
        </h2>
        <p className={styles.optionLede}>
          wootc installs TunaOS next to Windows, with no USB stick. Windows stays on the
          computer, and you choose at each start.
        </p>
      </div>
      <dl className={styles.needs}>
        <dt>You need</dt>
        <dd>
          A Windows 10 or 11 PC and an administrator account. This alpha stops if drive C: is
          encrypted with BitLocker: use the USB installer on those PCs.
        </dd>
      </dl>
      {other ? (
        <p className={styles.onlyFor}>
          Windows PCs only. Open this page on the Windows PC to download it.
        </p>
      ) : (
        <>
          <div className={clsx(page.btnRow, page.btnRowLeft, styles.actions)}>
            <a className={clsx('button', page.btnPrimary)} href={WOOTC_INSTALLER_URL}>
              Download TunaOS Installer for Windows
            </a>
          </div>
          <p className={styles.meta}>TunaOS-Installer.exe · {WOOTC_INSTALLER_SIZE}</p>
          <ol className={styles.steps}>
            <li>
              Open <strong>TunaOS-Installer.exe</strong>. It is not code-signed yet: if Windows
              shows &quot;Windows protected your PC&quot;, select <strong>More info</strong>, then{' '}
              <strong>Run anyway</strong>.
            </li>
            <li>
              Select <strong>Yes</strong> when Windows asks to allow changes. The installer needs
              administrator rights.
            </li>
            <li>Choose an image, type a password, and restart when the installer asks.</li>
          </ol>
        </>
      )}
      <ul className={styles.links}>
        <li>
          <Link to="/wootc">How wootc works, and how to remove it</Link>
        </li>
      </ul>
    </section>
  );
}

function X13sDownload(): ReactNode {
  return (
    <>
      <h3 id="x13s" className={styles.subTitle}>
        ThinkPad X13s (preview)
      </h3>
      <p className={styles.text}>
        Bonito GNOME for the Lenovo ThinkPad X13s Gen 1 (Snapdragon 8cx Gen 3). Build the ISO in
        your browser, or choose Bonito GNOME X13s (ARM64) in TunaOS Media Writer.{' '}
        <strong>Nobody has started it on an X13s yet.</strong> Turn off Secure Boot first. It is not
        for laptops with Snapdragon X Elite.
      </p>
      <div className={clsx(page.btnRow, page.btnRowLeft, styles.actions)}>
        <a className={clsx('button', page.btnGhost, page.btnSmall)} href={X13S_BUILDER_URL}>
          Build the X13s ISO
        </a>
      </div>
      <p className={styles.meta}>
        <a href={X13S_GUIDE_URL}>What to expect</a> · <a href={X13S_REPORT_URL}>Report your result</a>
      </p>
    </>
  );
}

function LinuxCard(): ReactNode {
  // Links to /download#linux (the FAQ, the home page) land on this card open.
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (window.location.hash === '#linux') setOpen(true);
  }, []);
  return (
    <section id="linux" className={styles.option} aria-labelledby="linux-title">
      <details
        className={styles.advanced}
        open={open}
        onToggle={(e) => setOpen(e.currentTarget.open)}>
        <summary>
          <span className={styles.optionHead}>
            <span className={clsx(styles.badge, styles.badgePlain)}>Advanced</span>
            <span id="linux-title" className={styles.optionTitle}>
              I already run Linux
            </span>
            <span className={styles.optionLede}>
              Switch a bootc system such as Bluefin or Fedora Atomic to TunaOS, download an ISO
              file, or build your own ISO.
            </span>
          </span>
        </summary>

        <h3 className={styles.subTitle}>Switch from a bootc system</h3>
        <p className={styles.text}>
          On Bluefin, Aurora, Bazzite, Fedora Atomic or another bootc system, switch to TunaOS
          and keep your files. Your old system stays on the boot menu until you commit.{' '}
          <Link to="/docs/bootc-migrate">bootc-migrate guide</Link>.
        </p>
        <pre className={page.code}>
          <code>{REBASE_COMMAND}</code>
        </pre>
        <p className={styles.meta}>
          Replace <code>yellowfin:gnome</code> with the image and desktop you want, for example{' '}
          <code>albacore:kde</code>. Plain <code>sudo bootc switch</code> takes the same image name.
        </p>

        <h3 className={styles.subTitle}>Download an ISO file</h3>
        <p className={styles.text}>
          Write the ISO to a USB stick (16 GB or larger) with TunaOS Media Writer or{' '}
          <a href={ETCHER_URL}>balenaEtcher</a>, then{' '}
          <Link to="/docs/start-from-usb">start the computer from it</Link>.
        </p>
        <IsoDownloads />
        <details className={styles.fold}>
          <summary>Command line: write the ISO with dd</summary>
          <pre className={page.code}>
            <code>sudo dd if=tunaos.iso of=/dev/sdX bs=4M status=progress oflag=direct</code>
          </pre>
          <p className={styles.text}>
            Replace <code>/dev/sdX</code> with your USB stick. Check it with <code>lsblk</code>{' '}
            first: dd erases the device that you name.
          </p>
        </details>

        <X13sDownload />

        <h3 className={styles.subTitle}>Build your own ISO</h3>
        <p className={styles.text}>
          Pick an image and your apps, and your browser builds the ISO. Nothing is uploaded.
        </p>
        <div className={clsx(page.btnRow, page.btnRowLeft, styles.actions)}>
          <a className={clsx('button', page.btnGhost, page.btnSmall)} href={BROWSER_BUILDER_URL}>
            Open the ISO builder
          </a>
          <Link className={clsx('button', page.btnGhost, page.btnSmall)} to="/iso-builder">
            Help me choose an image
          </Link>
        </div>

        <FactoryHealth />
      </details>
    </section>
  );
}

// The single install entry point (/download): three ways to install. The two
// main ones sit side by side; the advanced one is folded below them.
export default function InstallChooser(): ReactNode {
  const visitor = useVisitor();
  const release = useMediaWriterRelease();
  const {platform} = visitor;
  // The home page links to /download#usb, #windows and #linux. The cards are
  // <section>s, not Headings, so register their ids for the link checker.
  const brokenLinks = useBrokenLinks();
  for (const id of ['usb', 'windows', 'linux']) brokenLinks.collectAnchor(id);
  return (
    <div className={styles.chooser}>
      {platform?.kind === 'mobile' && <PhoneNotice />}
      {platform?.kind === 'macos' && <AppleSiliconNotice armMac={visitor.armMac} />}
      <div className={styles.pair}>
        <UsbCard visitor={visitor} release={release} />
        <WindowsCard platform={platform} />
      </div>
      <LinuxCard />
    </div>
  );
}
