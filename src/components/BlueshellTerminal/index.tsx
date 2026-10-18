import {useEffect, useRef, useState} from 'react';
import type {KeyboardEvent, ReactNode} from 'react';
import clsx from 'clsx';
import styles from './styles.module.css';

type Ctx = 'host' | 'toolbox';
type SpanClass = 'g' | 'b' | 'd' | 'e';
type Span = {t: string; c?: SpanClass};
type Line = {id: number; spans: Span[]};
type Tab = {id: number; ctx: Ctx};

const COMMANDS = ['help', 'install', 'containers', 'profiles', 'theme', 'about', 'echo', 'clear'] as const;

const CTX_LABEL: Record<Ctx, string> = {host: 'host', toolbox: 'fedora-toolbox'};

// One prompt shape, eight call sites — typed commands, answers, and the
// static transcript all stay identical by construction.
function promptSpans(ctx: Ctx): Span[] {
  return [
    {t: 'user@', c: 'g'},
    {t: CTX_LABEL[ctx], c: 'b'},
    {t: ' ~ $ '},
  ];
}

type Step =
  | {k: 'cmd'; cmd: string}
  | {k: 'out'; spans: Span[]}
  | {k: 'tab'; ctx: Ctx; note: string};

// Scripted first run: launch, pick a container tab, meet the demo shell.
const INTRO: Step[] = [
  {k: 'cmd', cmd: 'flatpak run org.tunaos.blueshell'},
  {k: 'out', spans: [{t: 'Pick a home for this tab:'}]},
  {k: 'out', spans: [{t: '  ▸ host · zsh'}]},
  {k: 'out', spans: [{t: '  ▸ fedora-toolbox · bash'}]},
  {k: 'out', spans: [{t: '  ▸ web · podman'}]},
  {k: 'tab', ctx: 'toolbox', note: 'Attached to fedora-toolbox.'},
  {k: 'cmd', cmd: 'help'},
  {k: 'out', spans: [{t: 'commands: help install containers profiles theme about echo clear'}]},
  {k: 'out', spans: [{t: 'This demo shell is live — type a command.', c: 'd'}]},
];

function Spans({spans}: {spans: Span[]}): ReactNode {
  return (
    <>
      {spans.map((s, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <span key={i} className={s.c ? styles[s.c] : undefined}>
          {s.t}
        </span>
      ))}
    </>
  );
}

export default function BlueshellTerminal({installCode}: {installCode: string}): ReactNode {
  const [tabs, setTabs] = useState<Tab[]>([{id: 1, ctx: 'host'}]);
  const [activeId, setActiveId] = useState(1);
  const [lines, setLines] = useState<Line[]>([]);
  const [draft, setDraft] = useState('');
  const [draftCtx, setDraftCtx] = useState<Ctx>('host');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const wrapRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lineId = useRef(1);
  const tabId = useRef(2);
  const runId = useRef(0);
  const started = useRef(false);
  const hist = useRef<string[]>([]);
  const histPos = useRef(0);

  const activeTab = tabs.find((t) => t.id === activeId) ?? tabs[0];

  const pushLine = (spans: Span[]) => {
    const id = lineId.current++;
    setLines((prev) => [...prev, {id, spans}]);
  };

  // Keep the newest output in view.
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines, draft]);

  useEffect(() => {
    if (started.current) return;
    const el = wrapRef.current;
    if (!el) return;
    started.current = true;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = ++runId.current;
    const alive = () => runId.current === id;

    const typeCmd = async (ctx: Ctx, cmd: string) => {
      setDraftCtx(ctx);
      setDraft('');
      for (const ch of cmd) {
        if (!alive()) return;
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 34);
        });
        if (!alive()) return;
        setDraft((d) => d + ch);
      }
      pushLine([...promptSpans(ctx), {t: cmd}]);
      setDraft('');
    };

    const play = async () => {
      setBusy(true);
      let ctx: Ctx = 'host';
      for (const step of INTRO) {
        if (!alive()) return;
        if (step.k === 'cmd') {
          await typeCmd(ctx, step.cmd);
        } else if (step.k === 'out') {
          pushLine(step.spans);
        } else {
          ctx = step.ctx;
          setTabs([{id: 1, ctx}]);
          setActiveId(1);
          pushLine([{t: step.note, c: 'd'}]);
        }
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 220);
        });
        if (!alive()) return;
      }
      if (alive()) setBusy(false);
    };

    const instant = () => {
      let ctx: Ctx = 'host';
      for (const step of INTRO) {
        if (step.k === 'cmd') {
          pushLine([...promptSpans(ctx), {t: step.cmd}]);
        } else if (step.k === 'out') {
          pushLine(step.spans);
        } else {
          ctx = step.ctx;
          setTabs([{id: 1, ctx}]);
          setActiveId(1);
          pushLine([{t: step.note, c: 'd'}]);
        }
      }
      setBusy(false);
    };

    if (reduced) {
      instant();
      return () => {
        runId.current++;
      };
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          void play();
        }
      },
      {threshold: 0.3},
    );
    io.observe(el);
    return () => {
      runId.current++;
      io.disconnect();
    };
    // Run once on mount; all live state flows through refs and setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const answer = (raw: string): void => {
    const ctx = activeTab.ctx;
    const [name = '', ...args] = raw.trim().split(/\s+/);
    switch (name) {
      case '':
        break;
      case 'help':
        pushLine([{t: 'commands: help install containers profiles theme about echo clear'}]);
        pushLine([{t: 'Tabs above switch between host and container. `theme` flips light and dark.', c: 'd'}]);
        break;
      case 'install':
        for (const codeLine of installCode.split('\n')) {
          pushLine([{t: codeLine, c: 'b'}]);
        }
        break;
      case 'containers':
        for (const c of ['host', 'toolbox'] as Ctx[]) {
          const mark = c === ctx ? '●' : '○';
          pushLine([{t: `${mark} ${CTX_LABEL[c]}${c === ctx ? ' — this tab' : ''}`, c: c === ctx ? 'g' : undefined}]);
        }
        pushLine([{t: '○ web · podman'}]);
        pushLine([{t: 'The picker lists the same targets.', c: 'd'}]);
        break;
      case 'profiles':
        pushLine([{t: '● default (active)', c: 'g'}]);
        pushLine([{t: '○ work'}]);
        pushLine([{t: '○ plain'}]);
        pushLine([{t: 'Change profiles in the Preferences window.', c: 'd'}]);
        break;
      case 'theme':
        setTheme((t) => {
          pushLine([{t: `Theme: ${t === 'dark' ? 'light' : 'dark'}.`}]);
          return t === 'dark' ? 'light' : 'dark';
        });
        break;
      case 'about':
        pushLine([{t: 'Blueshell is a container-native terminal for GNOME.'}]);
        pushLine([{t: 'Engine: Ghostty. Interface: Ptyxis-style.', c: 'd'}]);
        break;
      case 'echo':
        pushLine([{t: args.join(' ')}]);
        break;
      case 'clear':
        setLines([]);
        break;
      case 'sudo':
        pushLine([{t: 'No root needed in this demo.', c: 'e'}]);
        break;
      default:
        pushLine([{t: `Unknown command: ${name}.`, c: 'e'}]);
        pushLine([{t: "Try 'help'.", c: 'd'}]);
    }
  };

  const submit = () => {
    const ctx = activeTab.ctx;
    pushLine([...promptSpans(ctx), {t: input}]);
    if (input.trim()) {
      hist.current.push(input);
    }
    histPos.current = hist.current.length;
    answer(input);
    setInput('');
  };

  const complete = () => {
    const prefix = input.replace(/^\s+/, '');
    if (!prefix) return;
    const matches = COMMANDS.filter((c) => c.startsWith(prefix) && c !== prefix);
    if (matches.length === 1) {
      setInput(`${matches[0]} `);
    } else if (matches.length > 1) {
      pushLine([...promptSpans(activeTab.ctx), {t: input}]);
      pushLine([{t: matches.join('  '), c: 'd'}]);
    }
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      submit();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (histPos.current > 0) {
        const p = histPos.current - 1;
        histPos.current = p;
        setInput(hist.current[p]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (histPos.current < hist.current.length) {
        const p = histPos.current + 1;
        histPos.current = p;
        setInput(hist.current[p] ?? '');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      complete();
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      pushLine([...promptSpans(activeTab.ctx), {t: `${input}^C`}]);
      setInput('');
    }
  };

  const newTab = () => {
    const id = tabId.current++;
    setTabs((prev) => [...prev, {id, ctx: 'host'}]);
    setActiveId(id);
    inputRef.current?.focus();
  };

  const closeTab = (id: number) => {
    setTabs((prev) => {
      if (prev.length === 1) return [{id: tabId.current++, ctx: 'host'}];
      const next = prev.filter((t) => t.id !== id);
      if (id === activeId) setActiveId(next[next.length - 1].id);
      return next;
    });
    inputRef.current?.focus();
  };

  return (
    <div ref={wrapRef} className={clsx(styles.win, theme === 'light' && styles.light)}>
      <div className={styles.bar}>
        <span className={styles.title}>Blueshell</span>
        <button
          type="button"
          className={styles.themeBtn}
          aria-pressed={theme === 'light'}
          aria-label={theme === 'dark' ? 'Theme: dark — switch to light' : 'Theme: light — switch to dark'}
          onClick={() => setTheme((t) => (t === 'dark' ? 'light' : 'dark'))}>
          Theme: {theme}
        </button>
      </div>
      <div className={styles.tabs} role="group" aria-label="Demo tabs">
        {tabs.map((t) => (
          <span key={t.id} className={clsx(styles.tab, t.id === activeId && styles.tabActive)}>
            <button
              type="button"
              className={styles.tabBtn}
              aria-pressed={t.id === activeId}
              aria-label={`Switch to ${CTX_LABEL[t.ctx]} tab`}
              onClick={() => {
                setActiveId(t.id);
                inputRef.current?.focus();
              }}>
              {CTX_LABEL[t.ctx]}
            </button>
            <button
              type="button"
              className={styles.tabClose}
              aria-label={`Close ${CTX_LABEL[t.ctx]} tab`}
              onClick={() => closeTab(t.id)}>
              ×
            </button>
          </span>
        ))}
        <button type="button" className={styles.tabNew} aria-label="New tab" onClick={newTab}>
          +
        </button>
      </div>
      <div
        ref={bodyRef}
        className={styles.body}
        role="log"
        aria-live="off"
        aria-label="Demo terminal output"
        onClick={() => {
          if (!busy) inputRef.current?.focus();
        }}>
        {lines.map((line) => (
          <div key={line.id} className={styles.line}>
            <Spans spans={line.spans} />
          </div>
        ))}
        {busy && (
          <div className={styles.line}>
            <Spans spans={promptSpans(draftCtx)} />
            <span>{draft}</span>
            <span className={styles.caret} aria-hidden="true" />
          </div>
        )}
        {!busy && (
          <div className={styles.line}>
            <Spans spans={promptSpans(activeTab.ctx)} />
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              aria-label="Demo shell input — type help and press Enter"
              autoCapitalize="off"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
        )}
      </div>
      <p className={styles.hint}>History: ↑ ↓ · Complete: Tab · Clear: Ctrl+L</p>
    </div>
  );
}

// Static transcript for no-JavaScript renders.
export function BlueshellTerminalStatic(): ReactNode {
  const transcript: Span[][] = [
    [...promptSpans('host'), {t: 'flatpak run org.tunaos.blueshell'}],
    [{t: 'Pick a home for this tab:'}],
    [{t: '  ▸ host · zsh'}],
    [{t: '  ▸ fedora-toolbox · bash'}],
    [{t: '  ▸ web · podman'}],
    [{t: 'Attached to fedora-toolbox.', c: 'd'}],
    [...promptSpans('toolbox'), {t: 'help'}],
    [{t: 'commands: help install containers profiles theme about echo clear'}],
    [{t: 'Enable JavaScript to type here.', c: 'd'}],
  ];
  return (
    <div className={styles.win}>
      <div className={styles.bar}>
        <span className={styles.title}>Blueshell</span>
      </div>
      <div className={styles.body}>
        {transcript.map((spans, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <div key={i} className={styles.line}>
            <Spans spans={spans} />
          </div>
        ))}
      </div>
    </div>
  );
}
