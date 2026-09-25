import type {ReactNode} from 'react';
import {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {VARIANTS} from '@site/src/data/variants';
import useIsoNames from '@site/src/hooks/useIsoNames';
import styles from './styles.module.css';
import {
  type Selection,
  type StepId,
  ROLLING_SIBLING_OF,
  type Option,
  PRODUCT_OPTIONS,
  VARIANT_OPTIONS,
  DESKTOP_OPTIONS,
  getEditionOptions,
  getDesktopOptions,
  hasDesktopOptions,
  STEP_LABELS,
  hasExtraEditions,
  getNextStep,
  getPrevStep,
  buildImageName,
  getIsoUrl,
  getBuilderUrl,
  getDocsUrl,
  getVisibleSteps,
} from './selection';

function ProgressBar({steps, current}: {steps: StepId[]; current: StepId}) {
  const currentIdx = steps.indexOf(current);
  return (
    <ol className={styles.progress} aria-label="Steps">
      {steps.map((step, i) => (
        <li
          key={step}
          aria-current={i === currentIdx ? 'step' : undefined}
          className={clsx(styles.progressStep, {
            [styles.progressDone]: i < currentIdx,
            [styles.progressActive]: i === currentIdx,
          })}
        >
          <span className={styles.progressDot}>{String(i + 1).padStart(2, '0')}</span>
          <span className={styles.progressLabel}>{STEP_LABELS[step]}</span>
        </li>
      ))}
    </ol>
  );
}

function OptionCard<T extends string>({
  option,
  selected,
  onClick,
}: {
  option: Option<T>;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={clsx(styles.optionCard, {[styles.optionSelected]: selected})}
      onClick={onClick}
      aria-pressed={selected}
      type="button"
    >
      <span className={styles.optionHead}>
        {option.mark && (
          <img className={styles.optionMark} src={option.mark} alt="" width={24} height={24} loading="lazy" />
        )}
        <span className={styles.optionLabel}>{option.label}</span>
        {option.badge && (
          <span className={clsx(styles.optionBadge, {
            [styles.optionBadgeWarning]: option.badge === 'Experimental' || option.badge === 'Incomplete',
            [styles.optionBadgePrimary]: option.badge === 'Recommended' || option.badge === 'Default' || option.badge === 'Most Common',
          })}>
            {option.badge}
          </span>
        )}
      </span>
      <span className={styles.optionDesc}>{option.description}</span>
    </button>
  );
}

function CopyButton({text}: {text: string}) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return (
    <button className={styles.copyBtn} onClick={handleCopy} type="button">
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

function ResultCard({sel, onReset}: {sel: Selection; onReset: () => void}) {
  const isoNames = useIsoNames();
  const isTunaOS = sel.product === 'tunaos';
  const imageName = buildImageName(sel);
  const isoUrl = getIsoUrl(sel, isoNames);
  const docsUrl = getDocsUrl(sel);
  const productOpt = PRODUCT_OPTIONS.find((o) => o.value === sel.product);
  const variantMeta = VARIANTS.find((v) => v.id === sel.variant);
  const variantOpt = VARIANT_OPTIONS.find((o) => o.value === sel.variant);
  const desktopOpt = DESKTOP_OPTIONS.find((o) => o.value === sel.desktop);
  const editionOpt = sel.edition ? getEditionOptions(sel.variant).find((o) => o.value === sel.edition) : null;

  // Non-tunaOS result
  if (!isTunaOS) {
    const productName = productOpt?.label || sel.product;
    return (
      <div className={styles.resultCard}>
        <div className={styles.resultHeader}>
          <h3 className={styles.resultTitle}>{productName}</h3>
        </div>
        <div className={styles.resultActions}>
          {isoUrl ? (
            <a href={isoUrl} className="button button--primary button--lg">
              Download ISO
            </a>
          ) : (
            <div className={styles.resultNoIso}>
              No ISO available yet for {productName}.
            </div>
          )}
        </div>
        <button className={styles.resetBtn} onClick={onReset} type="button">
          Start over
        </button>
      </div>
    );
  }

  // Redfin (and any future base with no public image/ISO) — RHEL's EULA
  // means there's nothing to pull or download, only a local build.
  if (variantMeta?.localBuildOnly) {
    return (
      <div className={styles.resultCard}>
        <div className={styles.resultHeader}>
          <h3 className={styles.resultTitle}>{variantOpt?.label} — local build only</h3>
          <p className={styles.resultSummary}>
            {variantMeta.base} restricts redistribution, so there's no public image or ISO —
            build it yourself instead.
          </p>
        </div>

        <div className={styles.resultImageBox}>
          <span className={styles.resultImageLabel}>Build command</span>
          <div className={styles.resultImageRow}>
            <code className={styles.resultImageName}>{`just build ${sel.variant} ${sel.desktop ?? 'gnome'}`}</code>
            <CopyButton text={`just build ${sel.variant} ${sel.desktop ?? 'gnome'}`} />
          </div>
        </div>

        <div className={styles.resultActions}>
          <Link to={docsUrl} className="button button--outline button--md">
            View Docs
          </Link>
        </div>

        <button className={styles.resetBtn} onClick={onReset} type="button">
          Start over
        </button>
      </div>
    );
  }

  return (
    <div className={styles.resultCard}>
      <div className={styles.resultHeader}>
        <h3 className={styles.resultTitle}>Your TunaOS Image</h3>
        <p className={styles.resultSummary}>
          {variantOpt?.label}
          {desktopOpt ? ` · ${desktopOpt?.label}` : ''}
          {editionOpt && editionOpt.value !== 'standard' ? ` · ${editionOpt.label}` : ''}
        </p>
      </div>

      <div className={styles.resultImageBox}>
        <span className={styles.resultImageLabel}>Container image</span>
        <div className={styles.resultImageRow}>
          <code className={styles.resultImageName}>{imageName}</code>
          <CopyButton text={imageName} />
        </div>
        <div className={styles.resultRebaseHint}>
          <code>bootc switch {imageName}</code>
        </div>
      </div>

      <div className={styles.resultActions}>
        {isoUrl ? (
          <a href={isoUrl} className="button button--primary button--lg">
            Download ISO
          </a>
        ) : isoNames === null ? (
          <div className={styles.resultNoIso}>Checking what is published…</div>
        ) : (
          <div className={styles.resultNoIso}>
            {`No prebuilt ISO for this combination. Build one below, or install a standard ISO and run \`bootc switch ${imageName}\` afterward.`}
          </div>
        )}
        <a href={getBuilderUrl(imageName)} className="button button--outline button--md">
          Build this ISO in the browser
        </a>
        <Link to={docsUrl} className="button button--outline button--md">
          Docs
        </Link>
      </div>

      <button className={styles.resetBtn} onClick={onReset} type="button">
        ← Start Over
      </button>
    </div>
  );
}

export default function ImagePicker(): ReactNode {
  const [step, setStep] = useState<StepId>('product');
  const [sel, setSel] = useState<Selection>({});
  const [animDir, setAnimDir] = useState<'forward' | 'back'>('forward');

  const visibleSteps = getVisibleSteps(sel);

  const advance = (nextSel: Selection, nextStep: StepId) => {
    setAnimDir('forward');
    setSel(nextSel);
    setStep(nextStep);
  };

  const goBack = () => {
    const prev = getPrevStep(step, sel);
    if (!prev) return;
    setAnimDir('back');
    setStep(prev);
  };

  const reset = () => {
    setAnimDir('back');
    setSel({});
    setStep('product');
  };

  const pick = <T extends keyof Selection>(key: T, value: Selection[T]) => {
    const nextSel: Selection = {...sel, [key]: value};
    if (key === 'product') {
      nextSel.variant = undefined;
      nextSel.desktop = undefined;
      nextSel.edition = undefined;
    }
    if (key === 'variant') {
      nextSel.desktop = undefined;
      nextSel.edition = undefined;
    }
    if (key === 'desktop') {
      nextSel.edition = undefined;
    }
    const nextStep = getNextStep(step, nextSel);
    advance(nextSel, nextStep);
  };

  const STEP_QUESTIONS: Record<StepId, string> = {
    product: 'Which product line?',
    variant: 'Which base distribution?',
    desktop: 'Which desktop?',
    edition: 'Standard, or a specialized edition?',
    result: '',
  };

  return (
    <div className={styles.picker}>
      {step !== 'result' && (
        <ProgressBar steps={visibleSteps} current={step} />
      )}

      <div
        className={clsx(styles.stepWrap, styles[`anim-${animDir}`])}
        key={step}
        aria-live="polite"
      >
        {step === 'result' ? (
          <ResultCard sel={sel} onReset={reset} />
        ) : (
          <>
            <h2 className={styles.question}>{STEP_QUESTIONS[step]}</h2>
            <div className={styles.optionGrid}>
              {step === 'product' &&
                PRODUCT_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    option={opt}
                    selected={sel.product === opt.value}
                    onClick={() => pick('product', opt.value)}
                  />
                ))}
              {step === 'variant' &&
                VARIANT_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    option={opt}
                    selected={sel.variant === opt.value}
                    onClick={() => pick('variant', opt.value)}
                  />
                ))}
              {step === 'desktop' &&
                getDesktopOptions(sel.variant).map((opt) => (
                  <OptionCard
                    key={opt.value}
                    option={opt}
                    selected={sel.desktop === opt.value}
                    onClick={() => pick('desktop', opt.value)}
                  />
                ))}
              {step === 'edition' &&
                getEditionOptions(sel.variant).map((opt) => (
                  <OptionCard
                    key={opt.value}
                    option={opt}
                    selected={sel.edition === opt.value}
                    onClick={() => pick('edition', opt.value)}
                  />
                ))}
            </div>
            {step === 'variant' && (
              <p className={styles.rollingNote}>
                Want a rolling-release edge instead?{' '}
                {Object.entries(ROLLING_SIBLING_OF).map(([siblingId, parentId], i, arr) => {
                  const sibling = VARIANTS.find((v) => v.id === siblingId);
                  const parent = VARIANTS.find((v) => v.id === parentId);
                  if (!sibling || !parent) return null;
                  return (
                    <span key={siblingId}>
                      <button
                        className={styles.rollingLink}
                        type="button"
                        onClick={() => pick('variant', siblingId)}
                      >
                        {sibling.name} (rolling {parent.name})
                      </button>
                      {i < arr.length - 1 ? ' · ' : ''}
                    </span>
                  );
                })}
              </p>
            )}
            {step !== 'product' && (
              <button className={styles.backBtn} onClick={goBack} type="button">
                Back
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
