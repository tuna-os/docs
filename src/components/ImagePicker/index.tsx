import type {ReactNode} from 'react';
import {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {VARIANTS} from '@site/src/data/variants';
import useIsoNames from '@site/src/hooks/useIsoNames';
import {ISO_BASE_URL} from '@site/src/utils/isoNaming';
import styles from './styles.module.css';
import {markFor} from '@site/src/data/marks';

type Variant = string;
type Desktop = 'gnome' | 'gnome50' | 'kde' | 'cosmic' | 'niri' | 'pantheon';
type Edition = 'standard' | 'nvidia' | 'hwe' | 'cachyos';
type Product = 'tunaos' | 'dakota' | 'tromso' | 'xfce';
type StepId = 'product' | 'variant' | 'desktop' | 'edition' | 'result';

type Selection = {
  product?: Product;
  variant?: Variant;
  desktop?: Desktop;
  edition?: Edition;
};

// Rolling-release siblings that ride the same desktop/edition catalog as
// their stable base — kept out of the main variant grid so the picker
// doesn't present 12 equally-weighted choices, but still reachable from
// their parent's card.
const ROLLING_SIBLING_OF: Record<string, string> = {
  'bonito-rawhide': 'bonito',
  'flounder-sid': 'flounder',
};

type Option<T extends string> = {
  value: T;
  // Variant options carry their branding mark; the other steps have none.
  mark?: string;
  label: string;
  description: string;
  badge?: string;
};

const PRODUCT_OPTIONS: Option<Product>[] = [
  {
    value: 'tunaos',
    label: 'TunaOS',
    description: 'Enterprise Linux desktops — Albacore, Yellowfin, Skipjack, Bonito.',
    badge: 'Most popular',
  },
  {
    value: 'dakota',
    label: 'Dakota (Bluefin)',
    description: 'GNOME OS built from source. The reference BuildStream desktop.',
  },
  {
    value: 'tromso',
    label: 'Tromsø',
    description: 'Aurora KDE Plasma 6 — built from source on freedesktop-sdk.',
  },
  {
    value: 'xfce',
    label: 'XFCE Linux',
    description: 'Lightweight XFCE Wayland — built from source on freedesktop-sdk.',
  },
];

// Sourced from the same VARIANTS data that drives the variant landing pages,
// so this list can't silently fall behind as new bases are added (it used to
// hardcode just 4 of the 12 published variants). Rolling-release siblings
// (Bonito Rawhide, Flounder Sid) are excluded here and offered as a
// secondary choice under their parent's card instead.
const VARIANT_OPTIONS: Option<Variant>[] = VARIANTS.filter((v) => !(v.id in ROLLING_SIBLING_OF)).map((v) => ({
  value: v.id,
  mark: markFor(v.id),
  label: v.name,
  description: v.blurb,
  badge: v.recommended ? 'Recommended' : undefined,
}));

const DESKTOP_OPTIONS: Option<Desktop>[] = [
  {
    value: 'gnome',
    label: 'GNOME',
    description: 'The polished default. GNOME 50 backported to Enterprise Linux.',
    badge: 'Default',
  },
  {
    value: 'gnome50',
    label: 'GNOME 50',
    description: 'Next-generation GNOME — if you want to live on the bleeding edge of the desktop.',
  },
  {
    value: 'kde',
    label: 'KDE Plasma',
    description: 'Highly customizable. Familiar if you\'re coming from Windows.',
  },
  {
    value: 'cosmic',
    label: 'COSMIC',
    description: 'New Rust-built desktop from System76. Modern and fast.',
  },
  {
    value: 'niri',
    label: 'Niri',
    description: 'Unique scrollable tiling Wayland compositor. For the keyboard-driven power user.',
  },
  {
    value: 'pantheon',
    label: 'Pantheon',
    description: 'The elegant, minimal elementary OS desktop.',
  },
];

// Catalog of every possible edition; which ones actually apply to a given
// variant is looked up from that variant's real `editions` list (sourced
// from build-config.yml) via getEditionOptions() below — so a base that
// doesn't build an HWE or NVIDIA flavor (Sailfin, Guppy, Grouper, Flounder,
// Flounder Sid) never even offers the choice, and Marlin's real third
// edition (a CachyOS kernel overlay) shows up instead of a fake NVIDIA/HWE
// option it doesn't have.
const EDITION_CATALOG: Record<Edition, Option<Edition>> = {
  standard: {
    value: 'standard',
    label: 'Standard',
    description: 'Just the desktop — great for everyday use.',
  },
  nvidia: {
    value: 'nvidia',
    label: 'AI / ML (NVIDIA)',
    description: 'Adds NVIDIA drivers and CUDA support for AI/ML, graphics, and VFX workloads.',
  },
  hwe: {
    value: 'hwe',
    label: 'New Hardware (HWE)',
    description: 'A newer kernel for very recent hardware like the latest AMD and Intel platforms.',
  },
  cachyos: {
    value: 'cachyos',
    label: 'CachyOS kernel',
    description: 'The performance-tuned CachyOS kernel overlay on the same Arch userspace.',
  },
};

function getEditionOptions(variantId: Variant | undefined): Option<Edition>[] {
  const variant = VARIANTS.find((v) => v.id === variantId);
  const extra = variant?.editions ?? [];
  return [EDITION_CATALOG.standard, ...extra.map((e) => EDITION_CATALOG[e])];
}

// Only offer desktops a variant actually ships (from the same VARIANTS data
// that drives its landing page). Base-only variants like Hummingbird end up
// with an empty list, which skips the desktop step entirely.
function getDesktopOptions(variantId: Variant | undefined): Option<Desktop>[] {
  if (!variantId) return DESKTOP_OPTIONS;
  const variant = VARIANTS.find((v) => v.id === variantId);
  if (!variant) return DESKTOP_OPTIONS;
  const tags = new Set(variant.desktops.map((d) => d.tag));
  return DESKTOP_OPTIONS.filter((o) => tags.has(o.value));
}

function hasDesktopOptions(variantId: Variant | undefined): boolean {
  return getDesktopOptions(variantId).length > 0;
}

const STEP_LABELS: Record<StepId, string> = {
  product: 'Product',
  variant: 'Base',
  desktop: 'Desktop',
  edition: 'Edition',
  result: 'Your Image',
};

// The suffix a given edition appends to a desktop tag, matching build-config.yml
// flavor ids exactly (gnome-nvidia, gnome-hwe, gnome-cachyos, ...).
function editionSuffix(edition: Edition | undefined): string {
  if (edition === 'nvidia') return '-nvidia';
  if (edition === 'hwe') return '-hwe';
  if (edition === 'cachyos') return '-cachyos';
  return '';
}

// True when the selected variant only builds the standard edition — the
// edition step has nothing to offer, so it's skipped entirely rather than
// showing a one-option "choice."
function hasExtraEditions(variantId: Variant | undefined): boolean {
  return getEditionOptions(variantId).length > 1;
}

function getNextStep(step: StepId, sel: Selection): StepId {
  if (step === 'product') {
    if (sel.product === 'tunaos') return 'variant';
    return 'result'; // skip to result for non-tunaOS products
  }
  if (step === 'variant') return hasDesktopOptions(sel.variant) ? 'desktop' : 'result';
  if (step === 'desktop') return hasExtraEditions(sel.variant) ? 'edition' : 'result';
  if (step === 'edition') return 'result';
  return 'result';
}

function getPrevStep(step: StepId, sel: Selection): StepId | null {
  if (step === 'variant') return 'product';
  if (step === 'desktop') return 'variant';
  if (step === 'edition') return 'desktop';
  if (step === 'result') {
    if (sel.product !== 'tunaos') return 'product';
    return hasDesktopOptions(sel.variant) ? (hasExtraEditions(sel.variant) ? 'edition' : 'desktop') : 'variant';
  }
  return null;
}

function buildImageName(sel: Selection): string {
  const variant = sel.variant ?? 'albacore';
  // Base-only variants (e.g. Hummingbird) have no desktop step; fall back to
  // their sole published flavor tag instead of a desktop that doesn't exist.
  const desktop = sel.desktop ?? (getDesktopOptions(sel.variant)[0]?.value ?? 'base');
  return `ghcr.io/tuna-os/${variant}:${desktop}${editionSuffix(sel.edition)}`;
}

function getIsoUrl(sel: Selection, isoNames: Set<string> | null): string | null {
  // Non-tunaOS products
  if (sel.product === 'dakota') return 'https://download.tunaos.org/dakota/dakota-live-latest.iso';
  if (sel.product === 'tromso') return 'https://download.tunaos.org/tromso/tromso-live-latest.iso';
  if (sel.product === 'xfce') return 'https://download.tunaos.org/xfce-linux/xfce-linux-live-latest.iso';
  // TunaOS variants — validated against the live ISO index (static/iso-index.json)
  // rather than guessed, so this never wrongly claims an HWE/NVIDIA/GNOME 50
  // combo is or isn't downloadable. (HWE ISOs, for example, do exist for some
  // variant+desktop pairs — this used to hardcode them as always unavailable.)
  if (!sel.variant || !sel.desktop) return null;
  if (VARIANTS.find((v) => v.id === sel.variant)?.localBuildOnly) return null;
  const name = `${sel.variant}-${sel.desktop}${editionSuffix(sel.edition)}-latest`;
  if (!isoNames || !isoNames.has(name)) return null;
  return `${ISO_BASE_URL}/${name}.iso`;
}

// iso.tunaos.org accepts the image as a URL parameter, so a picked image can
// be handed straight to the in-browser builder (see /iso-builder).
const BUILDER_URL = 'https://iso.tunaos.org';

function getBuilderUrl(imageName: string): string {
  const short = imageName.replace(/^ghcr\.io\//, '');
  return `${BUILDER_URL}/?image=${encodeURIComponent(short)}`;
}

function getDocsUrl(sel: Selection): string {
  if (sel.product === 'dakota') return '/dakota';
  if (sel.product === 'tromso') return '/tromso';
  if (sel.product === 'xfce') return '/xfce-linux';
  const variant = sel.variant ?? 'albacore';
  const desktop = sel.desktop ?? (getDesktopOptions(sel.variant)[0]?.value ?? 'base');
  return `/docs/${variant}#${desktop}${editionSuffix(sel.edition)}`;
}

function getVisibleSteps(sel: Selection): StepId[] {
  if (sel.product !== 'tunaos') return ['product', 'result'];
  const steps: StepId[] = ['product', 'variant'];
  if (hasDesktopOptions(sel.variant)) steps.push('desktop');
  if (hasExtraEditions(sel.variant)) steps.push('edition');
  steps.push('result');
  return steps;
}

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
