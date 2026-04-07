import type {ReactNode} from 'react';
import {useState} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

type Variant = 'albacore' | 'yellowfin' | 'skipjack' | 'bonito';
type Desktop = 'gnome' | 'gnome50' | 'kde' | 'cosmic' | 'niri';
type Edition = 'standard' | 'gdx' | 'hwe';
type Arch = 'amd64' | 'amd64-v2' | 'arm64';
type StepId = 'variant' | 'desktop' | 'edition' | 'arch' | 'result';

type Selection = {
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

const VARIANT_OPTIONS: Option<Variant>[] = [
  {
    value: 'albacore',
    emoji: '🐟',
    label: 'Albacore',
    description: 'AlmaLinux 10 — 10-year support cycle, rock-solid stability for work.',
    badge: 'Recommended',
  },
  {
    value: 'yellowfin',
    emoji: '🐠',
    label: 'Yellowfin',
    description: 'AlmaLinux Kitten — newer packages, the developer daily driver.',
  },
  {
    value: 'skipjack',
    emoji: '🍣',
    label: 'Skipjack',
    description: 'CentOS Stream 10 — upstream-tracking, preview of future EL.',
  },
  {
    value: 'bonito',
    emoji: '🎣',
    label: 'Bonito',
    description: 'Fedora 44 — bleeding edge packages and the absolute latest kernel.',
  },
];

const DESKTOP_OPTIONS: Option<Desktop>[] = [
  {
    value: 'gnome',
    emoji: '🖥️',
    label: 'GNOME',
    description: 'The polished default. GNOME 48 backported to Enterprise Linux.',
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
    value: 'gdx',
    emoji: '🎮',
    label: 'AI / ML (GDX)',
    description: 'Adds NVIDIA drivers and CUDA support for AI/ML workloads.',
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
  variant: 'Base',
  desktop: 'Desktop',
  edition: 'Edition',
  arch: 'Architecture',
  result: 'Your Image',
};

function getDesktopOptions(variant: Variant | undefined): Option<Desktop>[] {
  if (variant === 'bonito') return DESKTOP_OPTIONS.filter((o) => o.value !== 'gnome50');
  return DESKTOP_OPTIONS;
}

function getNextStep(step: StepId, _sel: Selection): StepId {
  if (step === 'variant') return 'desktop';
  if (step === 'desktop') return 'edition';
  if (step === 'edition') return 'arch';
  if (step === 'arch') return 'result';
  return 'result';
}

function getPrevStep(step: StepId, _sel: Selection): StepId | null {
  if (step === 'desktop') return 'variant';
  if (step === 'edition') return 'desktop';
  if (step === 'arch') return 'edition';
  if (step === 'result') return 'arch';
  return null;
}

function buildImageName(sel: Selection): string {
  const variant = sel.variant ?? 'albacore';
  const desktop = sel.desktop ?? 'gnome';
  const edition = sel.edition ?? 'standard';
  let flavor = desktop;
  if (edition === 'gdx') flavor = `${desktop}-gdx`;
  else if (edition === 'hwe') flavor = `${desktop}-hwe`;
  return `ghcr.io/tuna-os/${variant}:${flavor}`;
}

function getIsoUrl(sel: Selection): string | null {
  if (!sel.variant || !sel.desktop) return null;
  if (sel.edition === 'hwe') return null;
  let flavor = sel.desktop;
  if (sel.edition === 'gdx') flavor = `${sel.desktop}-gdx`;
  return `https://download.tunaos.org/live-isos/${sel.variant}-${flavor}-latest.iso`;
}

function getDocsUrl(sel: Selection): string {
  const variant = sel.variant ?? 'albacore';
  const desktop = sel.desktop ?? 'gnome';
  const edition = sel.edition ?? 'standard';
  let anchor = desktop;
  if (edition === 'gdx') anchor = `${desktop}-gdx`;
  else if (edition === 'hwe') anchor = `${desktop}-hwe`;
  return `/docs/${variant}#${anchor}`;
}

function getVisibleSteps(_sel: Selection): StepId[] {
  return ['variant', 'desktop', 'edition', 'arch', 'result'];
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
  const imageName = buildImageName(sel);
  const isoUrl = getIsoUrl(sel);
  const docsUrl = getDocsUrl(sel);
  const variantOpt = VARIANT_OPTIONS.find((o) => o.value === sel.variant);
  const desktopOpt = DESKTOP_OPTIONS.find((o) => o.value === sel.desktop);
  const editionOpt = sel.edition ? EDITION_OPTIONS.find((o) => o.value === sel.edition) : null;
  const archOpt = sel.arch ? ARCH_OPTIONS.find((o) => o.value === sel.arch) : null;

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
        ) : (
          <div className={styles.resultNoIso}>
              {sel.edition === 'hwe'
                ? `🔄 No HWE ISO — download the standard ISO and run \`bootc switch ${imageName}\` after install.`
                : '📦 No ISO available for this combination.'}
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
  const [step, setStep] = useState<StepId>('variant');
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
    setStep('variant');
  };

  const pick = <T extends keyof Selection>(key: T, value: Selection[T]) => {
    const nextSel: Selection = {...sel, [key]: value};
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
            {step !== 'variant' && (
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
