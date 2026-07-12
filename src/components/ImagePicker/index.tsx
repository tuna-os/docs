import type {ReactNode} from 'react';
import {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import {VARIANTS} from '@site/src/data/variants';
import useIsoNames from '@site/src/hooks/useIsoNames';
import {ISO_BASE_URL} from '@site/src/utils/isoNaming';
import styles from './styles.module.css';

type Variant = string;
type Desktop = 'gnome' | 'gnome50' | 'kde' | 'cosmic' | 'niri';
type Edition = 'standard' | 'nvidia' | 'hwe';
type Arch = 'amd64' | 'amd64-v2' | 'arm64';
type Product = 'tunaos' | 'dakota' | 'tromso' | 'xfce' | 'hawaii';
type StepId = 'product' | 'variant' | 'desktop' | 'edition' | 'arch' | 'result';

type Selection = {
  product?: Product;
  variant?: Variant;
  desktop?: Desktop;
  edition?: Edition;
  arch?: Arch;
};

type Option<T extends string> = {
  value: T;
  emoji: string;
  label: string;
  description: string;
  badge?: string;
};

const PRODUCT_OPTIONS: Option<Product>[] = [
  {
    value: 'tunaos',
    emoji: '🐟',
    label: 'TunaOS',
    description: 'Enterprise Linux desktops — Albacore, Yellowfin, Skipjack, Bonito.',
    badge: 'Most popular',
  },
  {
    value: 'dakota',
    emoji: '🦖',
    label: 'Dakota (Bluefin)',
    description: 'GNOME OS built from source. The reference BuildStream desktop.',
  },
  {
    value: 'tromso',
    emoji: '🌌',
    label: 'Tromsø',
    description: 'Aurora KDE Plasma 6 — built from source on freedesktop-sdk.',
  },
  {
    value: 'xfce',
    emoji: '🖥️',
    label: 'XFCE Linux',
    description: 'Lightweight XFCE Wayland — built from source on freedesktop-sdk.',
  },
  {
    value: 'hawaii',
    emoji: '🌺',
    label: 'Zirconium Hawaii',
    description: 'Niri compositor on freedesktop-sdk. Experimental.',
  },
];

// Sourced from the same VARIANTS data that drives the variant landing pages,
// so this list can't silently fall behind as new bases are added (it used to
// hardcode just 4 of the 12 published variants).
const VARIANT_OPTIONS: Option<Variant>[] = VARIANTS.map((v) => ({
  value: v.id,
  emoji: v.emoji,
  label: v.name,
  description: v.blurb,
  badge: v.recommended ? 'Recommended' : undefined,
}));

const DESKTOP_OPTIONS: Option<Desktop>[] = [
  {
    value: 'gnome',
    emoji: '🖥️',
    label: 'GNOME',
    description: 'The polished default. GNOME 50 backported to Enterprise Linux.',
    badge: 'Default',
  },
  {
    value: 'gnome50',
    emoji: '✨',
    label: 'GNOME 50',
    description: 'Next-generation GNOME — if you want to live on the bleeding edge of the desktop.',
  },
  {
    value: 'kde',
    emoji: '🔵',
    label: 'KDE Plasma',
    description: 'Highly customizable. Familiar if you\'re coming from Windows.',
  },
  {
    value: 'cosmic',
    emoji: '🌌',
    label: 'COSMIC',
    description: 'New Rust-built desktop from System76. Modern and fast.',
  },
  {
    value: 'niri',
    emoji: '📜',
    label: 'Niri',
    description: 'Unique scrollable tiling Wayland compositor. For the keyboard-driven power user.',
  },
];

const EDITION_OPTIONS: Option<Edition>[] = [
  {
    value: 'standard',
    emoji: '👤',
    label: 'Standard',
    description: 'Just the desktop — great for everyday use.',
  },
  {
    value: 'nvidia',
    emoji: '🎮',
    label: 'AI / ML (NVIDIA)',
    description: 'Adds NVIDIA drivers and CUDA support for AI/ML, graphics, and VFX workloads.',
  },
  {
    value: 'hwe',
    emoji: '🖥️',
    label: 'New Hardware (HWE)',
    description: 'A newer kernel for very recent hardware like the latest AMD and Intel platforms.',
  },
];

const ARCH_OPTIONS: Option<Arch>[] = [
  {
    value: 'amd64',
    emoji: '💻',
    label: 'x86_64',
    description: 'Standard 64-bit. The right choice for most PCs and laptops.',
    badge: 'Most Common',
  },
  {
    value: 'amd64-v2',
    emoji: '🔩',
    label: 'x86_64_v2',
    description: 'Optimised for CPUs from ~2009-2013 lacking newer instructions.',
  },
  {
    value: 'arm64',
    emoji: '💪',
    label: 'ARM64',
    description: 'Apple Silicon (M-series), Snapdragon, Raspberry Pi 5, and similar.',
  },
];

const STEP_LABELS: Record<StepId, string> = {
  product: 'Product',
  variant: 'Base',
  desktop: 'Desktop',
  edition: 'Edition',
  arch: 'Architecture',
  result: 'Your Image',
};

function getNextStep(step: StepId, sel: Selection): StepId {
  if (step === 'product') {
    if (sel.product === 'tunaos') return 'variant';
    return 'result'; // skip to result for non-tunaOS products
  }
  if (step === 'variant') return 'desktop';
  if (step === 'desktop') return 'edition';
  if (step === 'edition') return 'arch';
  if (step === 'arch') return 'result';
  return 'result';
}

function getPrevStep(step: StepId, sel: Selection): StepId | null {
  if (step === 'variant') return 'product';
  if (step === 'desktop') return 'variant';
  if (step === 'edition') return 'desktop';
  if (step === 'arch') return 'edition';
  if (step === 'result') {
    if (sel.product !== 'tunaos') return 'product';
    return 'arch';
  }
  return null;
}

function buildImageName(sel: Selection): string {
  const variant = sel.variant ?? 'albacore';
  const desktop = sel.desktop ?? 'gnome';
  const edition = sel.edition ?? 'standard';
  let flavor: string = desktop;
  if (edition === 'nvidia') flavor = `${desktop}-nvidia`;
  else if (edition === 'hwe') flavor = `${desktop}-hwe`;
  return `ghcr.io/tuna-os/${variant}:${flavor}`;
}

function getIsoUrl(sel: Selection, isoNames: Set<string> | null): string | null {
  // Non-tunaOS products
  if (sel.product === 'dakota') return 'https://download.tunaos.org/dakota/dakota-live-latest.iso';
  if (sel.product === 'tromso') return 'https://download.tunaos.org/tromso/tromso-live-latest.iso';
  if (sel.product === 'xfce') return 'https://download.tunaos.org/xfce-linux/xfce-linux-live-latest.iso';
  if (sel.product === 'hawaii') return null; // no ISOs yet
  // TunaOS variants — validated against the live ISO index (static/iso-index.json)
  // rather than guessed, so this never wrongly claims an HWE/NVIDIA/GNOME 50
  // combo is or isn't downloadable. (HWE ISOs, for example, do exist for some
  // variant+desktop pairs — this used to hardcode them as always unavailable.)
  if (!sel.variant || !sel.desktop) return null;
  let flavor: string = sel.desktop;
  if (sel.edition === 'nvidia') flavor = `${sel.desktop}-nvidia`;
  else if (sel.edition === 'hwe') flavor = `${sel.desktop}-hwe`;
  const name = `${sel.variant}-${flavor}-latest`;
  if (!isoNames || !isoNames.has(name)) return null;
  return `${ISO_BASE_URL}/${name}.iso`;
}

function getDocsUrl(sel: Selection): string {
  if (sel.product === 'dakota') return '/dakota';
  if (sel.product === 'tromso') return '/tromso';
  if (sel.product === 'xfce') return '/xfce-linux';
  if (sel.product === 'hawaii') return '/hawaii';
  const variant = sel.variant ?? 'albacore';
  const desktop = sel.desktop ?? 'gnome';
  const edition = sel.edition ?? 'standard';
  let anchor: string = desktop;
  if (edition === 'nvidia') anchor = `${desktop}-nvidia`;
  else if (edition === 'hwe') anchor = `${desktop}-hwe`;
  return `/docs/${variant}#${anchor}`;
}

function getVisibleSteps(sel: Selection): StepId[] {
  if (sel.product !== 'tunaos') return ['product', 'result'];
  return ['product', 'variant', 'desktop', 'edition', 'arch', 'result'];
}

function ProgressBar({steps, current}: {steps: StepId[]; current: StepId}) {
  const currentIdx = steps.indexOf(current);
  return (
    <div className={styles.progress}>
      {steps.map((step, i) => (
        <div
          key={step}
          className={clsx(styles.progressStep, {
            [styles.progressDone]: i < currentIdx,
            [styles.progressActive]: i === currentIdx,
          })}
        >
          <div className={styles.progressDot}>
            {i < currentIdx ? '✓' : i + 1}
          </div>
          <span className={styles.progressLabel}>{STEP_LABELS[step]}</span>
        </div>
      ))}
    </div>
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
      type="button"
    >
      {option.badge && (
        <span className={clsx(styles.optionBadge, {
          [styles.optionBadgeWarning]: option.badge === 'Experimental' || option.badge === 'Incomplete',
          [styles.optionBadgePrimary]: option.badge === 'Recommended' || option.badge === 'Default' || option.badge === 'Most Common',
        })}>
          {option.badge}
        </span>
      )}
      <div className={styles.optionEmoji}>{option.emoji}</div>
      <div className={styles.optionLabel}>{option.label}</div>
      <div className={styles.optionDesc}>{option.description}</div>
      {selected && <div className={styles.optionCheck}>✓</div>}
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
      {copied ? '✓ Copied!' : '📋 Copy'}
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
  const variantOpt = VARIANT_OPTIONS.find((o) => o.value === sel.variant);
  const desktopOpt = DESKTOP_OPTIONS.find((o) => o.value === sel.desktop);
  const editionOpt = sel.edition ? EDITION_OPTIONS.find((o) => o.value === sel.edition) : null;
  const archOpt = sel.arch ? ARCH_OPTIONS.find((o) => o.value === sel.arch) : null;

  // Non-tunaOS result
  if (!isTunaOS) {
    const productName = productOpt?.label || sel.product;
    const productEmoji = productOpt?.emoji || '';
    return (
      <div className={styles.resultCard}>
        <div className={styles.resultHeader}>
          <div className={styles.resultEmoji}>{productEmoji}</div>
          <h3 className={styles.resultTitle}>{productName}</h3>
        </div>
        <div className={styles.resultActions}>
          {isoUrl ? (
            <a href={isoUrl} className="button button--primary button--lg">
              ⬇️ Download ISO
            </a>
          ) : (
            <div className={styles.resultNoIso}>
              📦 No ISO available yet for {productName}.
            </div>
          )}
        </div>
        <button className={styles.resetBtn} onClick={onReset} type="button">
          ← Start Over
        </button>
      </div>
    );
  }

  return (
    <div className={styles.resultCard}>
      <div className={styles.resultHeader}>
        <div className={styles.resultEmoji}>
          {variantOpt?.emoji}{desktopOpt?.emoji}
        </div>
        <h3 className={styles.resultTitle}>Your TunaOS Image</h3>
        <p className={styles.resultSummary}>
          {variantOpt?.label} · {desktopOpt?.label}
          {editionOpt && editionOpt.value !== 'standard' ? ` · ${editionOpt.label}` : ''}
          {archOpt ? ` · ${archOpt.label}` : ''}
        </p>
      </div>

      <div className={styles.resultImageBox}>
        <span className={styles.resultImageLabel}>Container Image</span>
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
            ⬇️ Download ISO
          </a>
        ) : isoNames === null ? (
          <div className={styles.resultNoIso}>⏳ Checking what's published…</div>
        ) : (
          <div className={styles.resultNoIso}>
            {`📦 No live ISO for this combination — install the standard ISO and run \`bootc switch ${imageName}\` afterward.`}
          </div>
        )}
        <Link to={docsUrl} className="button button--outline button--md">
          📖 View Docs
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
      nextSel.arch = undefined;
    }
    if (key === 'variant') {
      nextSel.desktop = undefined;
      nextSel.edition = undefined;
      nextSel.arch = undefined;
    }
    if (key === 'desktop') {
      nextSel.edition = undefined;
      nextSel.arch = undefined;
    }
    if (key === 'edition') {
      nextSel.arch = undefined;
    }
    const nextStep = getNextStep(step, nextSel);
    advance(nextSel, nextStep);
  };

  const STEP_QUESTIONS: Record<StepId, string> = {
    product: 'Which product line?',
    variant: 'Which base suits you?',
    desktop: 'Which desktop environment?',
    edition: 'Standard desktop or something specialized?',
    arch: 'What\'s your CPU architecture?',
    result: '',
  };

  return (
    <div className={styles.picker}>
      {step !== 'result' && (
        <ProgressBar steps={visibleSteps} current={step} />
      )}

      <div className={clsx(styles.stepWrap, styles[`anim-${animDir}`])} key={step}>
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
                DESKTOP_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    option={opt}
                    selected={sel.desktop === opt.value}
                    onClick={() => pick('desktop', opt.value)}
                  />
                ))}
              {step === 'edition' &&
                EDITION_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    option={opt}
                    selected={sel.edition === opt.value}
                    onClick={() => pick('edition', opt.value)}
                  />
                ))}
              {step === 'arch' &&
                ARCH_OPTIONS.map((opt) => (
                  <OptionCard
                    key={opt.value}
                    option={opt}
                    selected={sel.arch === opt.value}
                    onClick={() => pick('arch', opt.value)}
                  />
                ))}
            </div>
            {step !== 'product' && (
              <button className={styles.backBtn} onClick={goBack} type="button">
                ← Back
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
