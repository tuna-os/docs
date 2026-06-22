// Shared metadata for per-project landing pages (src/pages/<project>.tsx),
// rendered by src/components/ProjectLanding. Copy is sourced from each
// project's own docs under docs/<project>/.

export type ProjectStatus = 'stable' | 'beta' | 'alpha' | 'experimental' | 'internal';

export type PFeature = {emoji: string; title: string; text: string};
export type PInstall = {label: string; code: string};
export type PShot = {src: string; alt: string};
export type PHighlight = {title: string; text: string};

export type Project = {
  id: string; // route slug (/<id>) + docs slug (/docs/<id>)
  emoji: string;
  name: string;
  status: ProjectStatus;
  tagline: string;
  lede: string;
  accent: string;
  accent2: string;
  repo: string;
  docs: string; // doc path, usually /docs/<id>
  // Optional primary CTA beyond Docs + GitHub.
  cta?: {label: string; to: string};
  // Flathub app URL (renders as a Flathub install badge in the hero).
  flathub?: string;
  stats?: {label: string; value: string}[];
  features: PFeature[];
  install?: PInstall[];
  screenshots?: PShot[];
  // Dakota-style intro highlights (bold title + description cards).
  highlights?: PHighlight[];
  // Built with BuildStream from source (vs. the bootc/Containerfile images).
  // Flags the project as part of the BuildStream desktop family below.
  buildstream?: boolean;
  // External project (not in tuna-os org).
  external?: boolean;
  externalLink?: string;
  // Use the project emoji as a large animated background in the hero.
  heroEmojiLarge?: boolean;
  // Custom logo URL (rendered instead of emoji in hero).
  logo?: string;
  // If true, the logo is already light-colored — skip the invert filter.
  logoLight?: boolean;
};

export const STATUS_LABELS: Record<ProjectStatus, string> = {
  stable: 'Stable',
  beta: 'Beta',
  alpha: 'Alpha',
  experimental: 'Experimental',
  internal: 'Internal',
};

// Sibling BuildStream "Aurora-style" desktop layers — opinionated images that
// layer customizations on top of a vanilla desktop base (GNOME OS /
// gnome-build-meta, KDE Linux / kde-build-meta, etc.). Tromsø is the KDE member
// of this family; these are its GNOME and Niri counterparts.
export const BUILDSTREAM_UPSTREAMS: {desktop: string; emoji: string; name: string; url: string; note: string}[] = [
  {
    desktop: 'KDE',
    emoji: '🌌',
    name: 'Tromsø',
    url: '/tromso',
    note: 'Aurora KDE Plasma 6 — built from source on freedesktop-sdk.',
  },
  {
    desktop: 'XFCE',
    emoji: '🖥️',
    name: 'XFCE Linux',
    url: '/xfce-linux',
    note: 'Lightweight XFCE Wayland on the same freedesktop-sdk base.',
  },
  {
    desktop: 'Niri',
    emoji: '🌺',
    name: 'Zirconium Hawaii',
    url: '/hawaii',
    note: 'Niri compositor on freedesktop-sdk — 100% reproducible from source.',
  },
];

export const PROJECTS: Project[] = [
  {
    id: 'tacklebox',
    emoji: '🛠',
    name: 'Tacklebox',
    status: 'stable',
    tagline: 'A high-performance bootc orchestrator for multi-boot, updatable, deduplicated media.',
    lede:
      'Tacklebox provisions multi-tenant, updatable, deduplicated bootable media — USB drives, SD cards, disk images, and ISOs — from bootc OCI images. Born from superiso, it evolves static ISOs into dynamic, writable GPT disks with a unified bootloader.',
    accent: '#b45309',
    accent2: '#f59e0b',
    repo: 'https://github.com/tuna-os/tacklebox',
    docs: '/docs/tacklebox',
    stats: [
      {label: 'Bootloader', value: 'systemd-boot'},
      {label: 'Dedup', value: 'shared store + ostree'},
      {label: 'Targets', value: 'USB · disk · ISO'},
    ],
    features: [
      {emoji: '🚀', title: 'Multi-boot, unified', text: 'Installs and manages systemd-boot on a unified ESP, resolving Ostree/Composefs backend conflicts.'},
      {emoji: '🧠', title: 'Intelligent dedup', text: 'Shares one containers/storage + ostree repo across every environment on a disk — ~80%+ savings.'},
      {emoji: '🔄', title: 'In-place updates', text: '`tacklebox update` rotates BLS entries and extracts new kernels/initrd safely, without wiping persistence.'},
      {emoji: '💾', title: 'Modal booting', text: 'Live (ephemeral) and persistent boot entries for the same image via smart kernel-arg manipulation.'},
      {emoji: '📂', title: 'Shared persistence', text: 'OverlayFS mounts share /home/liveuser across OSes while isolating per-desktop config (KDE vs GNOME).'},
      {emoji: '🛡️', title: 'Integrity first', text: 'Auto-enables fs-verity to support modern container backends like Composefs.'},
    ],
    install: [
      {label: 'Build a multi-boot image', code: 'sudo tacklebox build recipe.json --xz'},
      {label: 'Provision a physical USB', code: 'sudo tacklebox build recipe.json /dev/sda'},
      {label: 'Refresh an existing drive', code: 'sudo tacklebox update recipe.json /dev/sda'},
    ],
  },
  {
    id: 'tromso',
    emoji: '🌌',
    name: 'Tromsø',
    status: 'alpha',
    tagline: 'Aurora on your desktop.',
    lede:
      "A freedesktop.org and KDE Plasma image, designed from the ground up to bring Aurora's visual identity to KDE. Built from the best OS tech from the CNCF, Apache Foundation, and the freedesktop.org community — BuildStream pipelines, bootc delivery, and a fully Wayland Plasma 6 desktop. This is what KDE looks like when you build it from source.",
    accent: '#0c0032',
    accent2: '#6366f1',
    heroEmojiLarge: true,
    repo: 'https://github.com/tuna-os/tromso',
    docs: '/docs/tromso',
    buildstream: true,
    highlights: [
      {title: 'KDE Plasma 6', text: 'The latest stable release of Plasma, <a href="https://kde.org/plasma-desktop" target="_blank">built from source</a> — no distribution middleman, no lag.'},
      {title: 'Freedesktop SDK', text: 'Same battle-tested libraries as <a href="https://flathub.org" target="_blank">Flathub</a>. Continuously upgraded, always up to date.'},
      {title: 'Modern Userspace', text: '<a href="https://github.com/bootc-dev/bootc" target="_blank">bootc</a>, systemd-boot, container-first, and legacy-free. Wayland from the ground up.'},
      {title: 'Designed for Contributors', text: 'Your path to contributing to <a href="https://kde.org" target="_blank">KDE</a>, <a href="https://gitlab.com/freedesktop-sdk/freedesktop-sdk" target="_blank">freedesktop-sdk</a>, and the <a href="https://buildstream.build" target="_blank">BuildStream</a> ecosystem. Start here, level up, become part of upstream.'},
      {title: 'BuildStream & BuildGrid', text: 'Hermetic sandbox builds with <a href="https://buildstream.build" target="_blank">distributed execution</a>, reproducible and fully auditable.'},
    ],
    stats: [
      {label: 'Desktop', value: 'KDE Plasma 6'},
      {label: 'Built with', value: 'BuildStream'},
      {label: 'Base', value: 'freedesktop-sdk'},
      {label: 'Modeled on', value: 'GNOME OS'},
    ],
    features: [
      {emoji: '🧱', title: 'Everything from source', text: 'Qt 6, KDE Frameworks, Plasma, and apps — ~170 BuildStream elements built on freedesktop-sdk, the same minimal Linux runtime that powers GNOME OS. No binary packages.'},
      {emoji: '🔁', title: 'Reproducible by design', text: 'BuildStream caches every build artifact. Same inputs, same image — every time. No "works on my machine" drift between contributors.'},
      {emoji: '🌌', title: 'Aurora-themed Plasma', text: "KDE Plasma 6 with Aurora's visual identity — not stock upstream, not a re-skin. A coherent desktop built to look like it belongs together."},
      {emoji: '🐳', title: 'Native bootc image', text: 'The output is a standard bootc OCI image. Pull it, boot it, rebase onto it, or turn it into installable media with tacklebox.'},
      {emoji: '🖥️', title: 'Shared family', text: 'Tromsø and XFCE Linux are siblings — same freedesktop-sdk base, same BuildStream pipeline, different desktop. Fix the base once, both benefit.'},
    ],
    install: [
      {label: 'Build from source', code: 'git clone https://github.com/tuna-os/tromso.git\ncd tromso\njust build'},
      {label: 'Boot in a VM', code: 'just generate-bootable-image\njust boot-vm'},
      {label: 'Rebase an existing bootc system', code: 'sudo bootc switch ghcr.io/tuna-os/tromso:latest'},
    ],
  },
  {
    id: 'tavern',
    emoji: '🍻',
    name: 'Tavern',
    status: 'stable',
    tagline: 'A modern, fast, beautiful Homebrew client for Linux — GTK 4 + Libadwaita.',
    lede:
      'Tavern is a premium “App Store” experience for managing your Homebrew formulae and casks, built with Python, GTK 4, and Libadwaita. Browse, search, and install with a native, responsive, dark-mode-ready interface.',
    accent: '#a16207',
    accent2: '#eab308',
    repo: 'https://github.com/tuna-os/Tavern',
    docs: '/docs/tavern',
    stats: [
      {label: 'Toolkit', value: 'GTK 4 · Libadwaita'},
      {label: 'Backend', value: 'Homebrew'},
      {label: 'Install', value: 'Flatpak · brew'},
    ],
    features: [
      {emoji: '🏠', title: 'Curated browse', text: 'Discover popular and featured applications at a glance.'},
      {emoji: '🔍', title: 'Fast search', text: 'Instant searching across thousands of formulae and casks.'},
      {emoji: '📦', title: 'Rich package details', text: 'Descriptions, versions, dependencies, and screenshots for every package.'},
      {emoji: '📄', title: 'Brewfile support', text: 'Open and manage .Brewfiles to bulk-install or remove entire environments.'},
      {emoji: '⚡', title: 'Parallel tasks', text: 'Concurrent installs and removals with a global progress indicator.'},
      {emoji: '🐧', title: 'Linux first', text: 'Smart filtering hides macOS-only casks on Linux; full dark-mode and responsive layouts.'},
    ],
    install: [
      {label: 'Flatpak (Linux, recommended)', code: 'flatpak remote-add --user --if-not-exists tuna-os oci+https://tuna-os.github.io/Tavern\nflatpak install --user tuna-os dev.hanthor.Tavern'},
      {label: 'Homebrew (macOS + Linux)', code: 'brew tap hanthor/homebrew-tap\nbrew install --cask hanthor/tap/tavern'},
    ],
    screenshots: [
      {src: 'https://raw.githubusercontent.com/tuna-os/Tavern/main/data/screenshots/main-window.png', alt: 'Tavern main window'},
      {src: 'https://raw.githubusercontent.com/tuna-os/Tavern/main/data/screenshots/search%20results.png', alt: 'Tavern search results'},
      {src: 'https://raw.githubusercontent.com/tuna-os/Tavern/main/data/screenshots/App%20View.png', alt: 'Tavern package detail view'},
      {src: 'https://raw.githubusercontent.com/tuna-os/Tavern/main/data/screenshots/Tap%20View.png', alt: 'Tavern taps browser'},
    ],
  },
  {
    id: 'bluefin-cli',
    emoji: '⌨️',
    name: 'bluefin-cli',
    status: 'stable',
    tagline: 'A modern CLI for shell config and dev-environment customization, with beautiful Charm TUIs.',
    lede:
      'bluefin-cli manages your shell configuration and development-environment tooling from one place — toggle modern shell enhancements, install curated tool bundles, apply Starship themes, and more, all through polished terminal UIs.',
    accent: '#1d4ed8',
    accent2: '#22d3ee',
    repo: 'https://github.com/tuna-os/bluefin-cli',
    docs: '/docs/bluefin-cli',
    stats: [
      {label: 'Language', value: 'Go'},
      {label: 'TUI', value: 'Charm'},
      {label: 'OS', value: 'Linux · macOS · Windows'},
    ],
    features: [
      {emoji: '🎨', title: 'Interactive menu', text: 'A default TUI experience for easy navigation of every command.'},
      {emoji: '✨', title: 'Bling', text: 'Toggle modern shell enhancements: eza, bat, ugrep, zoxide, atuin, starship.'},
      {emoji: '📰', title: 'MOTD', text: 'A beautiful Message of the Day with system info and random tips.'},
      {emoji: '📦', title: 'Bundle installer', text: 'Install curated tool bundles (ai, cli, fonts, k8s) from Universal Blue.'},
      {emoji: '🖼️', title: 'Wallpapers & themes', text: 'Install wallpaper collections and browse/apply Starship prompt themes.'},
      {emoji: '📊', title: 'Status at a glance', text: 'View your configuration and installed tools with one command.'},
    ],
    install: [
      {label: 'macOS / Linux (Go)', code: 'go install github.com/hanthor/bluefin-cli@latest'},
      {label: 'Homebrew (experimental)', code: 'brew tap ublue-os/homebrew-experimental-tap\nbrew install bluefin-cli'},
    ],
  },
  {
    id: 'tables',
    emoji: '📊',
    name: 'Tables',
    status: 'alpha',
    tagline: 'A GNOME spreadsheet — Excel-equivalent with ~400 functions, charts, and multi-sheet workbooks.',
    lede:
      'Tables is a modern, libadwaita spreadsheet application for GNOME — powered by Jspreadsheet CE and HyperFormula. Reads and writes XLSX, ODS, and CSV via openpyxl, calamine, and odfpy. Shares the suite-common scaffold with Letters and Decks.',
    accent: '#1d6f42',
    accent2: '#22c55e',
    repo: 'https://github.com/tuna-os/tables',
    docs: '/docs/tables',
    stats: [
      {label: 'Engine', value: 'Jspreadsheet CE + HyperFormula'},
      {label: 'Formats', value: 'XLSX · ODS · CSV'},
      {label: 'Functions', value: '~400 Excel-compatible'},
    ],
    features: [
      {emoji: '🧮', title: '~400 formulas', text: 'SUM, IF, VLOOKUP, and ~400 more via HyperFormula — full Excel compatibility.'},
      {emoji: '📑', title: 'Multi-sheet', text: 'Workbook tabs, sheet navigation, freeze panes, sort, and filter.'},
      {emoji: '📊', title: 'Charts', text: 'Bar, line, and pie charts embedded in XLSX via openpyxl.'},
      {emoji: '⌨️', title: 'Excel shortcuts', text: 'Ctrl+B/I/U, Ctrl+D/R fill, Ctrl/Space column select, Shift+Space row select.'},
      {emoji: '🎨', title: 'Libadwaita native', text: 'Responsive, dark-mode-ready GTK 4 interface that looks at home on GNOME.'},
      {emoji: '🤝', title: 'Suite family', text: 'Shares the suite-common scaffold with <a href="/letters">Letters</a> and <a href="/decks">Decks</a>.'},
    ],
    install: [
      {label: 'Flatpak (TunaOS remote)', code: 'flatpak remote-add tuna-os oci+https://tuna-os.github.io/flatpak-index\nflatpak install tuna-os org.tunaos.tables'},
      {label: 'Build from source', code: 'git clone https://github.com/tuna-os/tables.git\ncd tables\njust setup\njust build'},
    ],
  },
  {
    id: 'letters',
    emoji: '📝',
    name: 'Letters',
    status: 'alpha',
    tagline: 'A modern, minimalist word processor for the GNOME desktop — DOCX, ODT, Markdown, and PDF.',
    lede:
      'Letters is a clean, focused word processor for GNOME. It reads and writes DOCX, ODT, Markdown, and HTML via Pandoc, and exports to PDF via WeasyPrint. A hard fork of Letters by Satvik Patwardhan, maintained as part of the TunaOS GNOME office suite.',
    accent: '#1e40af',
    accent2: '#3b82f6',
    logo: 'https://raw.githubusercontent.com/tuna-os/letters/main/data/icons/hicolor/scalable/apps/org.tunaos.letters.svg',
    repo: 'https://github.com/tuna-os/letters',
    docs: '/docs/letters',
    stats: [
      {label: 'Formats', value: 'DOCX · ODT · MD · HTML'},
      {label: 'Export', value: 'PDF via WeasyPrint'},
      {label: 'Engine', value: 'Pandoc + WebKitGTK'},
    ],
    features: [
      {emoji: '✍️', title: 'Rich editing', text: 'Bold, italic, underline, headings, lists, tables, and find/replace.'},
      {emoji: '📄', title: 'Multi-format I/O', text: 'Open and save DOCX, ODT, Markdown, and HTML. Export to PDF.'},
      {emoji: '🔢', title: 'Word count', text: 'Live word and character count in the status bar.'},
      {emoji: '⌨️', title: 'Full keyboard nav', text: 'Comprehensive keyboard shortcuts for formatting, navigation, and editing.'},
      {emoji: '🎨', title: 'Libadwaita native', text: 'Clean, responsive GTK 4 interface with light and dark mode.'},
      {emoji: '🤝', title: 'Suite family', text: 'Shares the suite-common scaffold with <a href="/tables">Tables</a> and <a href="/decks">Decks</a>.'},
    ],
    flathub: 'https://flathub.org/apps/org.tunaos.letters',
    install: [
      {label: 'TunaOS Flatpak remote', code: 'flatpak remote-add tuna-os oci+https://tuna-os.github.io/flatpak-index\nflatpak install tuna-os org.tunaos.letters'},
      {label: 'Build from source', code: 'git clone https://github.com/tuna-os/letters.git\ncd letters\njust setup\njust build'},
    ],
    screenshots: [
      {src: 'https://raw.githubusercontent.com/tuna-os/letters/main/screenshot.png', alt: 'Letters main window'},
    ],
  },
  {
    id: 'decks',
    emoji: '📽️',
    name: 'Decks',
    status: 'alpha',
    tagline: 'A GNOME presentation app — PowerPoint-equivalent with Fabric.js canvas editing and Reveal.js fullscreen.',
    lede:
      'Decks is a modern presentation app for GNOME. Edit slides on a Fabric.js canvas, manage them in a sidebar, and present fullscreen with Reveal.js. Reads and writes PPTX and ODP via python-pptx and odfpy. Exports multi-page PDFs via Pillow.',
    accent: '#991b1b',
    accent2: '#ef4444',
    repo: 'https://github.com/tuna-os/decks',
    docs: '/docs/decks',
    stats: [
      {label: 'Engine', value: 'Fabric.js + Reveal.js'},
      {label: 'Formats', value: 'PPTX · ODP'},
      {label: 'Export', value: 'PDF via Pillow'},
    ],
    features: [
      {emoji: '🎨', title: 'Canvas editing', text: 'Text boxes, shapes, and images on a Fabric.js canvas with 30-level undo/redo.'},
      {emoji: '🖼️', title: 'Slide management', text: 'Add, delete, duplicate, and reorder slides via a sidebar thumbnail strip.'},
      {emoji: '📐', title: 'Layout presets', text: 'Blank, Title, Title+Content, and Two-Column layouts for every slide.'},
      {emoji: '🎬', title: 'Fullscreen present mode', text: 'Reveal.js fullscreen with slide transitions and B/W/. blank shortcuts.'},
      {emoji: '⌨️', title: 'PowerPoint shortcuts', text: 'Ctrl+M new slide, Ctrl+Shift+D duplicate, F5 present, Home/End navigate.'},
      {emoji: '🤝', title: 'Suite family', text: 'Shares the suite-common scaffold with <a href="/tables">Tables</a> and <a href="/letters">Letters</a>.'},
    ],
    install: [
      {label: 'Flatpak (TunaOS remote)', code: 'flatpak remote-add tuna-os oci+https://tuna-os.github.io/flatpak-index\nflatpak install tuna-os org.tunaos.decks'},
      {label: 'Build from source', code: 'git clone https://github.com/tuna-os/decks.git\ncd decks\njust setup\njust build'},
    ],
  },
  {
    id: 'xfce-linux',
    emoji: '🖥️',
    name: 'XFCE Linux',
    status: 'alpha',
    tagline: 'The lightweight one. XFCE Wayland on the same freedesktop-sdk base as Tromsø and GNOME OS.',
    lede:
      "XFCE Linux shares its DNA with Tromsø — both are BuildStream images built on freedesktop-sdk, the same minimal Linux runtime that powers GNOME OS. The difference: where Tromsø layers KDE Plasma 6, XFCE Linux layers the XFCE desktop. Lightweight, fast, and fully Wayland.",
    accent: '#1e3a5f',
    accent2: '#0ea5e9',
    repo: 'https://github.com/tuna-os/xfce-linux',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Xfce_logo.svg',
    docs: '/docs/xfce-linux',
    buildstream: true,
    stats: [
      {label: 'Desktop', value: 'XFCE (Wayland)'},
      {label: 'Built with', value: 'BuildStream'},
      {label: 'Base', value: 'freedesktop-sdk'},
      {label: 'Sibling', value: 'Tromsø (KDE)'},
    ],
    features: [
      {emoji: '🪶', title: 'XFCE on Wayland', text: 'A modern Wayland session with the classic XFCE desktop. Fast, familiar, and resource-light — ideal for older hardware or minimal setups.'},
      {emoji: '🧱', title: 'Built on freedesktop-sdk', text: 'The same <a href="https://gitlab.com/freedesktop-sdk/freedesktop-sdk" target="_blank">freedesktop-sdk</a> minimal Linux runtime used by <a href="https://os.gnome.org" target="_blank">GNOME OS</a> and <a href="/tromso">Tromsø</a>. A shared, battle-tested foundation — not a one-off base image.'},
      {emoji: '🔁', title: 'Reproducible from source', text: '<a href="https://buildstream.build" target="_blank">BuildStream</a> pipelines give deterministic, cacheable builds. Every package, from the kernel to the panel plugins, is built from source with pinned revisions.'},
      {emoji: '🐳', title: 'bootc OCI image', text: 'The output is a standard <a href="https://github.com/bootc-dev/bootc" target="_blank">bootc</a> image. Pull it, boot it, rebase onto it — same workflow as every other TunaOS image.'},
      {emoji: '🌌', title: 'Shared family', text: '<a href="/tromso">Tromsø</a> and XFCE Linux are siblings — same build system, same base, different desktop. Fix the base once, both benefit.'},
    ],
    install: [
      {label: 'Build from source', code: 'git clone https://github.com/tuna-os/xfce-linux.git\ncd xfce-linux\njust build'},
      {label: 'Rebase an existing bootc system', code: 'sudo bootc switch ghcr.io/tuna-os/xfce-linux:latest'},
    ],
  },
  {
    id: 'hawaii',
    emoji: '🌺',
    name: 'Zirconium Hawaii',
    status: 'experimental',
    tagline: 'Zirconium, rebuilt on freedesktop-sdk. Closer to the source.',
    lede:
      "Zirconium Hawaii is an experiment — initially Niri OS — that turned into a real project. It builds its own components from source on freedesktop-sdk with BuildStream, 100% reproducible. The closest comparison is GNOME OS, which is the project's biggest inspiration — same build system, shared components, different desktop.",
    accent: '#14532d',
    accent2: '#22c55e',
    repo: 'https://github.com/zirconium-linux/hawaii',
    docs: '',
    external: true,
    externalLink: 'https://github.com/zirconium-linux/hawaii',
    logo: 'https://raw.githubusercontent.com/zirconium-dev/assets/bbcc598039cc9c48b631677ff3bd267217cf8509/logos/logo-z.svg',
    buildstream: true,
    stats: [
      {label: 'Desktop', value: 'Niri (Wayland)'},
      {label: 'Built with', value: 'BuildStream'},
      {label: 'Base', value: 'freedesktop-sdk'},
      {label: 'Inspired by', value: 'GNOME OS'},
    ],
    features: [
      {emoji: '📜', title: 'Niri compositor', text: '<a href="https://github.com/YaLTeR/niri" target="_blank">Scrollable-tiling</a> Wayland compositor. No floating windows, no overlap — just an infinite horizontal workspace.'},
      {emoji: '🧱', title: 'Built from source', text: 'Every component in the stack is built from source with <a href="https://buildstream.build" target="_blank">BuildStream</a>. No binary packages from any distribution.'},
      {emoji: '🔁', title: 'Reproducible', text: 'Same inputs, same image — every time. <a href="https://buildstream.build" target="_blank">BuildStream</a> caches and verifies every build artifact.'},
      {emoji: '🔄', title: 'Zirconium reborn', text: 'Zirconium, but on <a href="https://gitlab.com/freedesktop-sdk/freedesktop-sdk" target="_blank">freedesktop-sdk</a> instead of Fedora. Same spirit, different foundation — closer to <a href="https://os.gnome.org" target="_blank">GNOME OS</a>.'},
    ],
    install: [
      {label: 'Build from source', code: 'git clone https://github.com/zirconium-linux/hawaii.git\ncd hawaii\njust build'},
    ],
  },
  {
    id: 'dakota',
    emoji: '🎣',
    name: 'Dakota',
    status: 'beta',
    tagline: 'The Final Form. Bluefin Perfected.',
    lede:
      "A freedesktop.org and GNOME OS image, designed from the ground up to be the most modern raptor in the pack. The familiar Bluefin desktop and developer experience in a whole new streamlined package — built from the best OS tech from the CNCF, Apache Foundation, and the UAPI Group.",
    accent: '#0f172a',
    accent2: '#3b82f6',
    repo: 'https://github.com/projectbluefin/dakota',
    docs: '',
    external: true,
    externalLink: 'https://github.com/projectbluefin/dakota',
    logo: 'https://docs.projectbluefin.io/assets/images/01b99cdf-2b10-4be4-88bf-23da3a945be8-ea4ce28757013465dc1434aaa7a18742.png',
    logoLight: true,
    buildstream: true,
    stats: [
      {label: 'Desktop', value: 'GNOME'},
      {label: 'Built with', value: 'BuildStream'},
      {label: 'Base', value: 'freedesktop-sdk / GNOME OS'},
    ],
    highlights: [
      {title: 'GNOME OS', text: 'The latest stable release of GNOME, no delays. Built from source on the same pipelines as <a href="https://os.gnome.org" target="_blank">GNOME OS</a> itself.'},
      {title: 'Freedesktop SDK', text: 'Same battle-tested libraries as <a href="https://flathub.org" target="_blank">Flathub</a>. Continuously upgraded, always up to date.'},
      {title: 'Modern Userspace', text: '<a href="https://github.com/bootc-dev/bootc" target="_blank">bootc</a>, brew, uutils, systemd-boot, container-first, and legacy-free.'},
      {title: 'Designed for Contributors', text: 'Your path to contributing to some of the coolest projects in desktop Linux. Start here, then level up and become part of the upstream teams.'},
      {title: 'BuildStream & BuildGrid', text: 'Hermetic sandbox builds with <a href="https://buildstream.build" target="_blank">distributed execution</a>, reproducible and fully auditable.'},
    ],
    features: [
      {emoji: '🦖', title: 'GNOME on freedesktop-sdk', text: 'The reference BuildStream desktop — <a href="https://os.gnome.org" target="_blank">GNOME OS</a> patterns, Bluefin experience, built from source with <a href="https://buildstream.build" target="_blank">BuildStream</a>.'},
      {emoji: '🔁', title: 'Built-in feedback loop', text: '<code>ujust report</code>, <code>ujust confirm</code>, <code>ujust verify</code> — structured hardware diagnostics that flow back to upstream.'},
      {emoji: '🧱', title: 'Reproducible', text: '<a href="https://buildstream.build" target="_blank">BuildStream</a> pipelines. Same inputs, same image — every time. Fully auditable.'},
    ],
  },
  {
    id: 'tunaos',
    emoji: '🐟',
    name: 'TunaOS',
    status: 'stable',
    tagline: 'Cloud-native Enterprise Linux desktop images built with bootc.',
    lede:
      'TunaOS is a curated collection of bootc-based desktop operating systems that bring a modern desktop experience to Enterprise Linux — stable, immutable, and up-to-date. GNOME, KDE, COSMIC, and Niri on AlmaLinux, CentOS Stream, and Fedora.',
    accent: '#0056b3',
    accent2: '#0ea5e9',
    repo: 'https://github.com/tuna-os/tunaOS',
    docs: '/docs/tunaos',
    cta: {label: 'Download ISOs 📦', to: '/download'},
    stats: [
      {label: 'Variants', value: '4 bases'},
      {label: 'Desktops', value: 'GNOME · KDE · COSMIC · Niri'},
      {label: 'Built on', value: 'bootc'},
    ],
    features: [
      {emoji: '🖥️', title: 'Modern desktops', text: 'GNOME, KDE Plasma, COSMIC, and Niri — your choice, on Enterprise Linux.'},
      {emoji: '✨', title: 'Latest GNOME', text: 'We backport the latest desktop features instead of leaving you on a 3-year-old GNOME.'},
      {emoji: '🍺', title: 'Homebrew baked in', text: 'All your CLI apps and fonts are a `brew` command away.'},
      {emoji: '📦', title: 'Flathub by default', text: 'Full Flathub access out of the box.'},
      {emoji: '🔧', title: 'HWE option', text: 'Hardware Enablement kernel for newer hardware.'},
      {emoji: '🎮', title: 'NVIDIA option', text: 'NVIDIA drivers and CUDA for graphics and AI workflows.'},
    ],
    install: [
      {label: 'Rebase an existing bootc system', code: 'sudo bootc switch ghcr.io/tuna-os/albacore:gnome'},
    ],
  },
];

export function getProject(id: string): Project | undefined {
  return PROJECTS.find((p) => p.id === id);
}
