import {useEffect, useState, type ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {detectPlatform, type Platform} from '@site/src/data/media-writer';
import {WOOTC_INSTALLER_SIZE, WOOTC_INSTALLER_URL} from '@site/src/data/wootc';
import page from '@site/src/css/page.module.css';
import styles from './styles.module.css';

// The steps a person sees after "Download for Windows" on /wootc: the
// download itself, then the Windows dialogs the site cannot show.
export default function WootcGetStarted(): ReactNode {
  const [platform, setPlatform] = useState<Platform | null>(null);
  useEffect(() => {
    setPlatform(
      detectPlatform({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        maxTouchPoints: navigator.maxTouchPoints,
      }),
    );
  }, []);
  const notWindows = platform !== null && platform.kind !== 'windows';

  return (
    <section id="get-started" className={styles.section}>
      <div className="container">
        <Heading as="h2" className={styles.title}>
          Get started
        </Heading>

        {notWindows && (
          <p className={styles.notice}>
            <strong>wootc is for Windows PCs.</strong> This computer does not run Windows. To
            install TunaOS on it, <Link to="/download">make a USB installer</Link>.
          </p>
        )}

        <div className={styles.columns}>
          <div>
            <Heading as="h3" className={styles.subTitle}>
              Before you start
            </Heading>
            <ul className={styles.list}>
              <li>A PC with Windows 10 or 11, and an administrator account.</li>
              <li>
                <strong>BitLocker:</strong> this alpha stops if drive C: is encrypted with
                BitLocker, which many Windows 11 laptops turn on. To check, search the Start menu
                for &quot;Manage BitLocker&quot;. If it is on, use the{' '}
                <Link to="/download">USB installer</Link> instead.
              </li>
              <li>Back up your files. wootc is an alpha.</li>
            </ul>
          </div>
          <div>
            <Heading as="h3" className={styles.subTitle}>
              Steps
            </Heading>
            <ol className={styles.list}>
              <li>
                <a href={WOOTC_INSTALLER_URL}>Download TunaOS-Installer.exe</a> (
                {WOOTC_INSTALLER_SIZE}) and open it.
              </li>
              <li>
                The installer is not code-signed yet. If Windows shows &quot;Windows protected your
                PC&quot;, select <strong>More info</strong>, then <strong>Run anyway</strong>.
              </li>
              <li>
                Select <strong>Yes</strong> when Windows asks to allow changes: the installer needs
                administrator rights.
              </li>
              <li>Choose an image, type a password, and restart when the installer asks.</li>
              <li>At each start, choose TunaOS or Windows.</li>
            </ol>
          </div>
          <div>
            <Heading as="h3" className={styles.subTitle}>
              Remove it
            </Heading>
            <p className={styles.text}>
              In Windows, open <strong>Settings › Apps</strong>, select <strong>TunaOS
              Installer</strong> (or <strong>wootc</strong>), then <strong>Uninstall</strong>. The
              uninstaller tries to remove everything. In this alpha it can leave files or a
              start-up entry behind, and it tells you when it does.
            </p>
          </div>
        </div>

        {!notWindows && (
          <div className={clsx(page.btnRow, page.btnRowLeft)}>
            <a className={clsx('button', page.btnPrimary)} href={WOOTC_INSTALLER_URL}>
              Download for Windows ({WOOTC_INSTALLER_SIZE})
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
