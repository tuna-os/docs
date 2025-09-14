import type {ReactNode} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

function HeroGraphics(): ReactNode {
  return (
    <section className={styles.heroGraphics}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <div className={styles.graphicsContainer}>
              <div className={styles.fishGraphic}>
                <div className={styles.fishEmoji}>🐟</div>
                <div className={styles.fishName}>TunaOS</div>
              </div>
              <div className={styles.powerSection}>
                <div className={styles.powerText}>Powered by</div>
                <div className={styles.bootcContainer}>
                  <img 
                    src="/docs/img/bootc-logo.png" 
                    alt="Bootc Logo" 
                    className={styles.bootcLogo}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroGraphics;