// Shared metadata for per-project landing pages (src/pages/<project>.tsx),
// rendered by src/components/ProjectLanding. Copy is sourced from each
// project's own docs under docs/<project>/.

export type ProjectStatus = 'stable' | 'beta' | 'alpha' | 'experimental' | 'internal';

export type PFeature = {emoji: string; title: string; text: string};
export type PInstall = {label: string; code: string};
export type PShot = {src: string; alt: string};

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
  stats?: {label: string; value: string}[];
  features: PFeature[];
  install?: PInstall[];
  screenshots?: PShot[];
  // Built with BuildStream from source (vs. the bootc/Containerfile images).
  // Flags the project as part of the BuildStream desktop family below.
  buildstream?: boolean;
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
export const BUILDSTREAM_UPSTREAMS: {desktop: string; name: string; url: string; note: string}[] = [
  {
    desktop: 'GNOME',
    name: 'Dakota (Project Bluefin)',
    url: 'https://projectbluefin.io/dakota/',
    note: 'Project Bluefin’s BuildStream layer on GNOME OS — the reference Tromsø is modeled on.',
  },
  {
    desktop: 'Niri',
    name: 'zirconium-hawaii',
    url: 'https://github.com/zirconium-dev/zirconium-hawaii/tree/stable',
    note: 'Opinionated Niri bootc image built on freedesktop-sdk (a.k.a. Niri OS).',
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
    emoji: '🌋',
    name: 'Tromsø',
    status: 'alpha',
    tagline: 'A BuildStream-based KDE Linux distribution, built from source with reproducible pipelines.',
    lede:
      'Aurora Tromsø is a BuildStream-based KDE Linux OCI/bootc image, modeled on Project Bluefin’s dakota. It builds KDE Plasma 6 on top of freedesktop-sdk and publishes a bootable OCI image — and it boots to a working Plasma 6 Wayland desktop.',
    accent: '#b91c1c',
    accent2: '#f97316',
    repo: 'https://github.com/tuna-os/tromso',
    docs: '/docs/tromso',
    buildstream: true,
    stats: [
      {label: 'Desktop', value: 'KDE Plasma 6'},
      {label: 'Build', value: 'BuildStream'},
      {label: 'Base', value: 'freedesktop-sdk'},
    ],
    features: [
      {emoji: '🧩', title: 'Built from source', text: 'A complete KDE desktop assembled from ~170 BuildStream elements (Qt6, Frameworks, Plasma, apps).'},
      {emoji: '🔁', title: 'Reproducible pipelines', text: 'BuildStream gives deterministic, cacheable builds — the same inputs always yield the same image.'},
      {emoji: '🐳', title: 'OCI + bootc native', text: 'Publishes a bootable OCI image you can run, rebase onto, or turn into installable media.'},
      {emoji: '🧱', title: 'Two-repo model', text: 'kde-build-meta builds the KDE base (like gnome-build-meta); Tromsø layers Aurora theming and apps on top.'},
    ],
    install: [
      {label: 'Build the image', code: 'git clone https://github.com/tuna-os/tromso.git\ncd tromso\njust build'},
      {label: 'Boot a test VM', code: 'just generate-bootable-image\njust boot-vm'},
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
    id: 'xfce-linux',
    emoji: '🖥️',
    name: 'XFCE Linux',
    status: 'alpha',
    tagline: 'A lightweight XFCE Wayland desktop on an immutable bootc base, built with BuildStream.',
    lede:
      'XFCE Linux is an XFCE Wayland OCI image built with BuildStream — a lightweight, fast desktop experience layered on an immutable, atomically-updated base. Early-stage and evolving.',
    accent: '#475569',
    accent2: '#0ea5e9',
    repo: 'https://github.com/tuna-os/xfce-linux',
    docs: '/docs/xfce-linux',
    buildstream: true,
    stats: [
      {label: 'Desktop', value: 'XFCE (Wayland)'},
      {label: 'Build', value: 'BuildStream'},
      {label: 'Status', value: 'Alpha'},
    ],
    features: [
      {emoji: '🪶', title: 'Lightweight', text: 'XFCE keeps the desktop fast and out of the way — ideal for older or resource-constrained hardware.'},
      {emoji: '🌊', title: 'Wayland', text: 'A modern Wayland session rather than legacy X11.'},
      {emoji: '🔄', title: 'Immutable + atomic', text: 'bootc image-based updates with clean rollbacks, like the rest of the TunaOS family.'},
      {emoji: '🧩', title: 'BuildStream pipeline', text: 'Reproducible, cacheable builds from source.'},
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
