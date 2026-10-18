import {useEffect, useRef, useState} from 'react';
import type {KeyboardEvent, ReactNode} from 'react';
import {createPortal} from 'react-dom';
import styles from './styles.module.css';

type Ctx = 'host' | 'toolbox' | 'web';
type SpanClass = 'g' | 'b' | 'd' | 'e';
type Span = {t: string; c?: SpanClass};
type Line = {id: number; spans: Span[]};
type Tab = {key: number; ctx: Ctx; script: Step[] | null; started: boolean; portalEl: HTMLDivElement | null};

const COMMANDS = ['help', 'install', 'containers', 'profiles', 'theme', 'about', 'echo', 'clear', 'close'] as const;

const CTX_LABEL: Record<Ctx, string> = {
  host: 'host',
  toolbox: 'fedora-toolbox',
  web: 'web',
};

const CTX_SHELL: Record<Ctx, string> = {
  host: 'zsh',
  toolbox: 'bash · toolbox',
  web: 'bash · podman',
};

// One prompt shape everywhere — typed commands, answers, and the static
// transcript stay identical by construction.
function promptSpans(ctx: Ctx): Span[] {
  return [
    {t: 'user@', c: 'g'},
    {t: CTX_LABEL[ctx], c: 'b'},
    {t: ' ~ $ '},
  ];
}

type Step = {k: 'cmd'; cmd: string} | {k: 'out'; spans: Span[]} | {k: 'opentab'; ctx: Ctx};

const HOST_SCRIPT: Step[] = [
  {k: 'cmd', cmd: 'flatpak run org.tunaos.blueshell'},
  {k: 'out', spans: [{t: 'Pick a home for this tab:'}]},
  {k: 'out', spans: [{t: '  ▸ host · zsh'}]},
  {k: 'out', spans: [{t: '  ▸ fedora-toolbox · bash'}]},
  {k: 'out', spans: [{t: '  ▸ web · podman'}]},
  {k: 'opentab', ctx: 'toolbox'},
];

const TOOLBOX_SCRIPT: Step[] = [
  {k: 'cmd', cmd: 'help'},
  {k: 'out', spans: [{t: 'commands: help install containers profiles theme about echo clear close'}]},
  {k: 'out', spans: [{t: 'This demo shell is live — type a command.', c: 'd'}]},
];

// Minimal structural type for the tab-view element API used here: page list
// and selection state for mirroring, appendPage for tabs the user opens
// (declared children only adopt at connect time — appended later would sit
// outside the strip, so dynamic tabs go through the model instead).
type AdwTabViewElement = HTMLElement & {
  readonly pages: readonly {id: string}[];
  selectedPage: unknown;
  appendPage: (spec: {id: string; title: string; content: HTMLElement}) => number;
};

type SelectDetail = {selected: number; selectedId: string};

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

function TabShell({
  ctx,
  installCode,
  script,
  start,
  onScriptEvent,
  onTheme,
  onCloseTab,
}: {
  ctx: Ctx;
  installCode: string;
  script: Step[] | null;
  start: boolean;
  onScriptEvent?: (step: {k: 'opentab'; ctx: Ctx}) => void;
  onTheme: (arg: string) => string;
  onCloseTab: () => string | null;
}): ReactNode {
  const [lines, setLines] = useState<Line[]>([]);
  const [draft, setDraft] = useState('');
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(script !== null);

  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const lineId = useRef(1);
  const runId = useRef(0);
  const done = useRef(false);
  const hist = useRef<string[]>([]);
  const histPos = useRef(0);

  const pushLine = (spans: Span[]) => {
    const id = lineId.current++;
    setLines((prev) => [...prev, {id, spans}]);
  };

  // Keep the newest output in view.
  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines, draft]);

  // Scripted first run; each shell runs its own script, started by the parent.
  useEffect(() => {
    if (script === null || !start) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const id = ++runId.current;
    const alive = () => runId.current === id;
    const finish = () => {
      if (!alive() || done.current) return;
      done.current = true;
      setBusy(false);
    };

    const play = async () => {
      for (const step of script) {
        if (!alive()) return;
        if (step.k === 'cmd') {
          setDraft('');
          for (const ch of step.cmd) {
            if (!alive()) return;
            await new Promise<void>((resolve) => {
              setTimeout(resolve, 34);
            });
            if (!alive()) return;
            setDraft((d) => d + ch);
          }
          pushLine([...promptSpans(ctx), {t: step.cmd}]);
          setDraft('');
        } else if (step.k === 'out') {
          pushLine(step.spans);
        } else {
          onScriptEvent?.(step);
        }
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 220);
        });
        if (!alive()) return;
      }
      finish();
    };

    if (reduced) {
      for (const step of script) {
        if (step.k === 'cmd') {
          pushLine([...promptSpans(ctx), {t: step.cmd}]);
        } else if (step.k === 'out') {
          pushLine(step.spans);
        } else {
          onScriptEvent?.(step);
        }
      }
      finish();
    } else {
      void play();
    }
    return () => {
      runId.current++;
    };
    // One run per shell start; live values flow through refs and setters.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start]);

  const answer = (raw: string): void => {
    const [name = '', ...args] = raw.trim().split(/\s+/);
    switch (name) {
      case '':
        break;
      case 'help':
        pushLine([{t: 'commands: help install containers profiles theme about echo clear close'}]);
        pushLine([{t: 'Tabs above switch shells. `theme` follows this site, or pins light / dark.', c: 'd'}]);
        break;
      case 'install':
        for (const codeLine of installCode.split('\n')) {
          pushLine([{t: codeLine, c: 'b'}]);
        }
        break;
      case 'containers':
        for (const c of ['host', 'toolbox', 'web'] as Ctx[]) {
          const mark = c === ctx ? '●' : '○';
          pushLine([{t: `${mark} ${CTX_LABEL[c]} · ${CTX_SHELL[c]}${c === ctx ? ' — this tab' : ''}`, c: c === ctx ? 'g' : undefined}]);
        }
        pushLine([{t: 'The picker lists the same targets.', c: 'd'}]);
        break;
      case 'profiles':
        pushLine([{t: '● default (active)', c: 'g'}]);
        pushLine([{t: '○ work'}]);
        pushLine([{t: '○ plain'}]);
        pushLine([{t: 'Change profiles in the Preferences window.', c: 'd'}]);
        break;
      case 'theme':
        pushLine([{t: onTheme(args[0] ?? '')}]);
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
      case 'close': {
        const note = onCloseTab();
        if (note !== null) pushLine([{t: note}]);
        break;
      }
      case 'sudo':
        pushLine([{t: 'No root needed in this demo.', c: 'e'}]);
        break;
      default:
        pushLine([{t: `Unknown command: ${name}.`, c: 'e'}]);
        pushLine([{t: "Try 'help'.", c: 'd'}]);
    }
  };

  const submit = () => {
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
      pushLine([...promptSpans(ctx), {t: input}]);
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
      pushLine([...promptSpans(ctx), {t: `${input}^C`}]);
      setInput('');
    }
  };

  return (
    <div
      ref={bodyRef}
      className={styles.body}
      role="log"
      aria-live="off"
      aria-label={`Demo terminal output, ${CTX_LABEL[ctx]} tab`}
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
          <Spans spans={promptSpans(ctx)} />
          <span>{draft}</span>
          <span className={styles.caret} aria-hidden="true" />
        </div>
      )}
      {!busy && (
        <div className={styles.line}>
          <Spans spans={promptSpans(ctx)} />
          <input
            ref={inputRef}
            className={styles.input}
            value={input}
            aria-label={`Demo shell input, ${CTX_LABEL[ctx]} tab — type help and press Enter`}
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
  );
}

export default function BlueshellTerminal({installCode}: {installCode: string}): ReactNode {
  const [ready, setReady] = useState<'loading' | 'ready' | 'failed'>('loading');
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [overview, setOverview] = useState(false);

  const viewRef = useRef<HTMLElement>(null);
  const tabKey = useRef(1);
  const pageIds = useRef<string[]>([]);
  const pinnedScheme = useRef<string | null>(null);

  // Load the Adwaita web components client-side, then follow this site's
  // light/dark theme through the library's meta-tag handoff.
  useEffect(() => {
    let cancelled = false;
    const syncScheme = () => {
      if (pinnedScheme.current) return;
      const t = document.documentElement.dataset.theme;
      const meta = document.head.querySelector('meta[name="adw-color-scheme"]');
      if (meta && (t === 'light' || t === 'dark')) meta.setAttribute('content', t);
    };
    void import('@gjsify/adwaita-web')
      .then(() => {
        if (cancelled) return;
        syncScheme();
        setReady('ready');
      })
      .catch(() => {
        if (!cancelled) setReady('failed');
      });
    const mo = new MutationObserver(syncScheme);
    mo.observe(document.documentElement, {attributes: true, attributeFilter: ['data-theme']});
    return () => {
      cancelled = true;
      mo.disconnect();
    };
  }, []);

  // Seed the session, then mirror the strip. Declared children only adopt at
  // connect time, so every tab — initial and user-opened — goes through the
  // model with a portal container, and pageIds tracks model ids purely from
  // attach/detach events. The strip draws no close buttons (no-close):
  // closing happens through the `close` shell command instead, which removes
  // the model page and the portal together and always keeps one tab.
  useEffect(() => {
    if (ready !== 'ready') return;
    const view = viewRef.current as AdwTabViewElement | null;
    if (!view) return;
    const onSelect = (e: Event) => {
      setActiveIdx((e as CustomEvent<SelectDetail>).detail.selected);
      setOverview(false);
    };
    const onAttached = (e: Event) => {
      const {id, position} = (e as CustomEvent<{id: string; position: number}>).detail;
      pageIds.current = [...pageIds.current.slice(0, position), id, ...pageIds.current.slice(position)];
    };
    const onDetached = (e: Event) => {
      const {position} = (e as CustomEvent<{position: number}>).detail;
      pageIds.current = pageIds.current.filter((_, i) => i !== position);
    };
    view.addEventListener('notify::selected-page', onSelect);
    view.addEventListener('page-attached', onAttached);
    view.addEventListener('page-detached', onDetached);
    const seeds: {ctx: Ctx; script: Step[] | null; started: boolean}[] = [
      {ctx: 'host', script: HOST_SCRIPT, started: true},
      {ctx: 'toolbox', script: TOOLBOX_SCRIPT, started: false},
      {ctx: 'web', script: null, started: false},
    ];
    const fresh: Tab[] = [];
    for (const s of seeds) {
      const el = document.createElement('div');
      const key = tabKey.current++;
      view.appendPage({id: `tab-${key}`, title: CTX_LABEL[s.ctx], content: el});
      fresh.push({key, ctx: s.ctx, script: s.script, started: s.started, portalEl: el});
    }
    setTabs(fresh);
    setActiveIdx(0);
    const first = view.pages[0];
    if (first) view.selectedPage = first;
    return () => {
      view.removeEventListener('notify::selected-page', onSelect);
      view.removeEventListener('page-attached', onAttached);
      view.removeEventListener('page-detached', onDetached);
    };
    // Seed once; the strip and the page registry are the source of truth after.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const selectIndex = (index: number) => {
    const view = viewRef.current as AdwTabViewElement | null;
    if (view && view.pages[index]) view.selectedPage = view.pages[index];
    setActiveIdx(index);
  };

  const closeCurrentTab = () => {
    if (tabs.length <= 1) return 'A demo keeps one tab.';
    const view = viewRef.current as AdwTabViewElement | null;
    const id = pageIds.current[activeIdx];
    setTabs((prev) => prev.filter((_, i) => i !== activeIdx));
    if (view && id !== undefined) {
      (view as AdwTabViewElement & {closePage: (pageId: string) => boolean}).closePage(id);
    }
    return null;
  };

  const appendTab = (ctx: Ctx) => {
    const view = viewRef.current as AdwTabViewElement | null;
    if (!view) return;
    const el = document.createElement('div');
    const key = tabKey.current++;
    view.appendPage({id: `tab-${key}`, title: CTX_LABEL[ctx], content: el});
    setTabs((prev) => [...prev, {key, ctx, script: null, started: false, portalEl: el}]);
    setOverview(false);
    requestAnimationFrame(() => {
      const v = viewRef.current as AdwTabViewElement | null;
      if (v && v.pages.length > 0) v.selectedPage = v.pages[v.pages.length - 1];
    });
  };

  const openCtxTab = (ctx: Ctx) => {
    const at = tabs.findIndex((t) => t.ctx === ctx);
    if (at >= 0) {
      selectIndex(at);
      setOverview(false);
      return;
    }
    appendTab(ctx);
  };

  const applyTheme = (arg: string) => {
    const meta = document.head.querySelector('meta[name="adw-color-scheme"]');
    if (arg !== 'light' && arg !== 'dark') {
      pinnedScheme.current = null;
      const t = document.documentElement.dataset.theme;
      if (meta && (t === 'light' || t === 'dark')) meta.setAttribute('content', t);
      return `Theme follows this site${t === 'light' || t === 'dark' ? ` (${t})` : ''}.`;
    }
    pinnedScheme.current = arg;
    if (meta) meta.setAttribute('content', arg);
    return `Theme pinned to ${arg} — 'theme auto' follows the site again.`;
  };

  if (ready === 'loading') {
    return <div className={styles.skeleton} aria-hidden="true" />;
  }
  if (ready === 'failed') {
    return <BlueshellTerminalStatic />;
  }

  const active = tabs[Math.min(activeIdx, tabs.length - 1)] ?? tabs[0];

  return (
    <div className={styles.frame}>
      <adw-window>
        <adw-toolbar-view>
          <adw-header-bar slot="top" title="Blueshell" subtitle={active ? CTX_LABEL[active.ctx] : 'Terminal'}>
            <gtk-button slot="start" icon-name="list-add" tooltip-text="New tab" onClick={() => appendTab('host')} />
            <gtk-button
              slot="end"
              icon-name="view-grid"
              tooltip-text="Show containers"
              aria-pressed={overview}
              onClick={() => setOverview((v) => !v)}
            />
          </adw-header-bar>
          <div className={styles.viewWrap}>
            <adw-tab-view ref={viewRef} inert={overview ? true : undefined} no-close>
              {tabs.map((t) =>
                t.portalEl === null ? null : (
                  createPortal(
                    <TabShell
                      ctx={t.ctx}
                      installCode={installCode}
                      script={t.script}
                      start={t.started}
                      onScriptEvent={(step) => {
                        if (step.k === 'opentab') {
                          setTabs((prev) => prev.map((p) => (p.ctx === 'toolbox' ? {...p, started: true} : p)));
                          openCtxTab(step.ctx);
                        }
                      }}
                      onTheme={applyTheme}
                      onCloseTab={closeCurrentTab}
                    />,
                    t.portalEl,
                    `tab-${t.key}`,
                  )
                ),
              )}
            </adw-tab-view>
            {overview && (
              <div className={styles.overview} role="group" aria-label="Container picker">
                {(['host', 'toolbox', 'web'] as Ctx[]).map((c) => (
                  <button key={c} type="button" className={styles.card} onClick={() => openCtxTab(c)}>
                    <span className={styles.cardName}>{CTX_LABEL[c]}</span>
                    <span className={styles.cardSub}>{CTX_SHELL[c]}</span>
                  </button>
                ))}
                <p className={styles.cardNote}>Pick a home — a tab opens inside it.</p>
              </div>
            )}
          </div>
        </adw-toolbar-view>
      </adw-window>
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
    [{t: 'commands: help install containers profiles theme about echo clear close'}],
    [{t: 'Enable JavaScript to type here.', c: 'd'}],
  ];
  return (
    <div className={styles.frame}>
      <div className={styles.staticBar}>
        <span className={styles.staticTitle}>Blueshell</span>
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
