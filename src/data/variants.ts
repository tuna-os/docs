// Shared variant metadata. Drives the homepage line-up, the per-variant
// landing pages (src/pages/<variant>.tsx), and the navbar/footer links.
// One source of truth so the marketing copy never drifts between surfaces.

export type Desktop = {
  emoji: string;
  name: string;
  tag: string; // image tag suffix, e.g. "gnome", "kde"
  blurb: string;
};

export type Feature = {
  emoji: string;
  title: string;
  text: string;
};

export type Flavor = {
  name: string;
  image: string; // full ghcr ref
  note?: string;
};

export type Variant = {
  id: string; // route slug + image repo, e.g. "yellowfin"
  emoji: string;
  name: string;
  base: string;
  baseUrl: string;
  recommended?: boolean;
  // Short one-liner used on cards.
  blurb: string;
  // Longer hero paragraph.
  lede: string;
  // Accent colours for the hero gradient + buttons.
  accent: string;
  accent2: string;
  // Quick-stat chips shown under the hero title.
  stats: {label: string; value: string}[];
  desktops: Desktop[];
  features: Feature[];
  flavors: Flavor[];
  // Whether grouped/flagship live ISOs are published for this variant.
  hasIsos: boolean;
};

export const ALL_DESKTOPS: Desktop[] = [
  {emoji: '🖥️', name: 'GNOME', tag: 'gnome', blurb: 'The polished default — latest GNOME, backported to Enterprise Linux.'},
  {emoji: '🌊', name: 'KDE Plasma', tag: 'kde', blurb: 'Endlessly customizable, feature-rich Plasma desktop.'},
  {emoji: '🚀', name: 'COSMIC', tag: 'cosmic', blurb: "System76's Rust-built next-gen desktop."},
  {emoji: '⚡', name: 'Niri', tag: 'niri', blurb: 'A scrollable-tiling Wayland compositor for keyboard-driven flow.'},
  {emoji: '🐭', name: 'XFCE', tag: 'xfce', blurb: 'The classic lightweight desktop — ported to Wayland with the new xfwl4 compositor.'},
];

const HOMEBREW: Feature = {
  emoji: '🍺',
  title: 'Homebrew baked in',
  text: 'Thousands of CLI tools and fonts a `brew install` away — no layering, no rebuilds.',
};
const FLATHUB: Feature = {
  emoji: '📦',
  title: 'Flathub by default',
  text: 'Full Flathub access out of the box. Install any Flatpak on the net, instantly.',
};
const BOOTC: Feature = {
  emoji: '🔄',
  title: 'Atomic & rollback-safe',
  text: 'Built on bootc: image-based updates that apply in one transaction and roll back just as cleanly.',
};
const NVIDIA: Feature = {
  emoji: '🎮',
  title: 'NVIDIA + CUDA option',
  text: 'A dedicated -nvidia flavor ships the proprietary driver and CUDA for gaming and AI workloads.',
};
const HWE: Feature = {
  emoji: '🔧',
  title: 'Hardware Enablement',
  text: 'An -hwe kernel stack for newer laptops and desktops, layered on the same userspace.',
};

export const VARIANTS: Variant[] = [
  {
    id: 'albacore',
    emoji: '🐟',
    name: 'Albacore',
    base: 'AlmaLinux 10',
    baseUrl: 'https://almalinux.org',
    recommended: true,
    blurb: '10-year support cycle. The rock-solid daily driver for work.',
    lede:
      'Albacore is the flagship — a cloud-native desktop on AlmaLinux 10 with a full decade of support behind it. The variant you install on the machine you depend on every day.',
    accent: '#0b6e4f',
    accent2: '#0ea5e9',
    stats: [
      {label: 'Support', value: '10 years'},
      {label: 'Cadence', value: 'Enterprise-stable'},
      {label: 'Arch', value: 'x86_64 · aarch64'},
    ],
    desktops: ALL_DESKTOPS.filter((d) => d.tag !== 'xfce'), // EL10 xfce pending tuna-os/github-copr#65

    features: [BOOTC, HOMEBREW, FLATHUB, HWE, NVIDIA, {
      emoji: '🛡️',
      title: 'Enterprise stability',
      text: 'AlmaLinux 10 is a 1:1 RHEL-compatible base with a 10-year lifecycle — boring in the best way.',
    }],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/albacore:gnome', note: 'Live ISO published'},
      {name: 'GNOME (HWE)', image: 'ghcr.io/tuna-os/albacore:gnome-hwe', note: 'Live ISO published'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/albacore:kde'},
      {name: 'COSMIC', image: 'ghcr.io/tuna-os/albacore:cosmic'},
      {name: 'Niri', image: 'ghcr.io/tuna-os/albacore:niri'},
      {name: 'GNOME (NVIDIA)', image: 'ghcr.io/tuna-os/albacore:gnome-nvidia'},
    ],
    hasIsos: true,
  },
  {
    id: 'yellowfin',
    emoji: '🐠',
    name: 'Yellowfin',
    base: 'AlmaLinux Kitten 10',
    baseUrl: 'https://almalinux.org/blog/2024-11-20-introducing-almalinux-kitten-10/',
    blurb: 'Newer packages on a near-enterprise base. The developer pick.',
    lede:
      "Yellowfin tracks AlmaLinux Kitten — the upstream-tracking branch of AlmaLinux. Newer packages and features land here first, on a base that's still almost enterprise-stable. The lead developer's daily driver.",
    accent: '#d97706',
    accent2: '#f59e0b',
    stats: [
      {label: 'Base', value: 'Kitten 10'},
      {label: 'Cadence', value: 'Fresh + stable'},
      {label: 'Microarch', value: 'x86_64_v2 builds'},
    ],
    desktops: ALL_DESKTOPS.filter((d) => d.tag !== 'xfce'), // EL10 xfce pending tuna-os/github-copr#65

    features: [BOOTC, HOMEBREW, FLATHUB, HWE, NVIDIA, {
      emoji: '🐱',
      title: 'Kitten freshness',
      text: 'Newer GNOME, kernels, and toolchains before they reach stable EL — without leaving the EL ecosystem.',
    }],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/yellowfin:gnome', note: 'Live ISO published'},
      {name: 'GNOME (HWE)', image: 'ghcr.io/tuna-os/yellowfin:gnome-hwe', note: 'Live ISO published'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/yellowfin:kde'},
      {name: 'COSMIC', image: 'ghcr.io/tuna-os/yellowfin:cosmic'},
      {name: 'Niri', image: 'ghcr.io/tuna-os/yellowfin:niri'},
      {name: 'GNOME (NVIDIA)', image: 'ghcr.io/tuna-os/yellowfin:gnome-nvidia'},
    ],
    hasIsos: true,
  },
  {
    id: 'skipjack',
    emoji: '🍣',
    name: 'Skipjack',
    base: 'CentOS Stream 10',
    baseUrl: 'https://www.centos.org/stream/',
    blurb: 'Upstream-tracking — a preview of where Enterprise Linux is headed.',
    lede:
      'Skipjack rides CentOS Stream 10, the rolling preview of the next RHEL. It’s where you see what’s coming to Enterprise Linux next — ideal for testing and contributing upstream.',
    accent: '#7c3aed',
    accent2: '#a855f7',
    stats: [
      {label: 'Base', value: 'CentOS Stream 10'},
      {label: 'Cadence', value: 'Rolling preview'},
      {label: 'Role', value: 'Next-RHEL testing'},
    ],
    desktops: ALL_DESKTOPS.filter((d) => d.tag !== 'xfce'), // EL10 xfce pending tuna-os/github-copr#65

    features: [BOOTC, HOMEBREW, FLATHUB, HWE, {
      emoji: '🔭',
      title: 'See what’s next',
      text: 'CentOS Stream is the upstream of RHEL — Skipjack previews the Enterprise Linux of tomorrow.',
    }, {
      emoji: '🤝',
      title: 'Upstream-friendly',
      text: 'The natural place to reproduce, file, and fix issues that flow into the whole EL ecosystem.',
    }],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/skipjack:gnome'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/skipjack:kde'},
      {name: 'COSMIC', image: 'ghcr.io/tuna-os/skipjack:cosmic'},
      {name: 'Niri', image: 'ghcr.io/tuna-os/skipjack:niri'},
    ],
    hasIsos: true,
  },
  {
    id: 'bonito',
    emoji: '🎣',
    name: 'Bonito',
    base: 'Fedora 44',
    baseUrl: 'https://fedoraproject.org',
    blurb: 'Bleeding-edge packages and the very latest kernel.',
    lede:
      'Bonito is built on Fedora 44 — the freshest kernels, GNOME, and toolchains in the line-up. For the largest desktop Linux ecosystem and the people who want the latest of everything.',
    accent: '#2563eb',
    accent2: '#38bdf8',
    stats: [
      {label: 'Base', value: 'Fedora 44'},
      {label: 'Cadence', value: 'Bleeding edge'},
      {label: 'Kernel', value: 'Latest mainline'},
    ],
    desktops: ALL_DESKTOPS.filter((d) => d.tag !== 'gnome50'),
    features: [BOOTC, HOMEBREW, FLATHUB, NVIDIA, {
      emoji: '🚀',
      title: 'Freshest of everything',
      text: 'Fedora ships the latest kernel, GNOME, and Mesa — Bonito brings that to an immutable bootc desktop.',
    }, {
      emoji: '🌍',
      title: 'Largest ecosystem',
      text: 'Fedora is the most widely used desktop Linux base — broad hardware and software coverage out of the box.',
    }],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/bonito:gnome'},
      {name: 'GNOME (HWE)', image: 'ghcr.io/tuna-os/bonito:gnome-hwe'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/bonito:kde'},
      {name: 'COSMIC', image: 'ghcr.io/tuna-os/bonito:cosmic'},
      {name: 'Niri', image: 'ghcr.io/tuna-os/bonito:niri'},
      {name: 'GNOME (NVIDIA)', image: 'ghcr.io/tuna-os/bonito:gnome-nvidia'},
    ],
    hasIsos: false,
  },
  {
    id: 'grouper',
    emoji: '🐟',
    name: 'Grouper',
    base: 'Ubuntu 26.04',
    baseUrl: 'https://ubuntu.com',
    blurb: 'The Ubuntu you know, rebuilt as an immutable bootc image.',
    lede:
      'Grouper brings the bootc model to the most familiar base in Linux: Ubuntu. Atomic image updates, composefs, and the same desktops as every other TunaOS variant — experimental today, parity-bound tomorrow.',
    accent: '#e95420',
    accent2: '#f5a623',
    stats: [
      {label: 'Status', value: 'Experimental'},
      {label: 'Backend', value: 'composefs'},
      {label: 'Arch', value: 'x86_64'},
    ],
    desktops: ALL_DESKTOPS.filter((d) => ['gnome', 'kde', 'niri', 'xfce'].includes(d.tag)),
    features: [BOOTC, HOMEBREW, FLATHUB, {
      emoji: '🧪',
      title: 'Experimental by design',
      text: 'The proving ground for the Ubuntu bootc story — composefs root, apt-built desktops, and the newest ideas land here first.',
    }],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/grouper:gnome'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/grouper:kde'},
      {name: 'Niri', image: 'ghcr.io/tuna-os/grouper:niri'},
      {name: 'XFCE', image: 'ghcr.io/tuna-os/grouper:xfce'},
    ],
    hasIsos: false,
  },
  {
    id: 'redfin',
    emoji: '🔒',
    name: 'Redfin',
    base: 'RHEL 10',
    baseUrl: 'https://redhat.com',
    blurb: 'Secure enterprise workspace. Local-build only.',
    lede: 'Redfin is based on Red Hat Enterprise Linux 10, requiring a local build due to subscription constraints.',
    accent: '#cc0000',
    accent2: '#ef3333',
    stats: [
      {label: 'Status', value: 'Local-build'},
      {label: 'Support', value: '10 years'},
      {label: 'Role', value: 'Enterprise secure'},
    ],
    desktops: ALL_DESKTOPS,
    features: [BOOTC, HOMEBREW, FLATHUB, HWE, NVIDIA],
    flavors: [
      {name: 'GNOME', image: 'local/redfin:gnome'},
      {name: 'KDE Plasma', image: 'local/redfin:kde'},
      {name: 'COSMIC', image: 'local/redfin:cosmic'},
      {name: 'Niri', image: 'local/redfin:niri'},
      {name: 'XFCE', image: 'local/redfin:xfce'},
    ],
    hasIsos: false,
  },
  {
    id: 'marlin',
    emoji: '🚀',
    name: 'Marlin',
    base: 'Arch Linux',
    baseUrl: 'https://archlinux.org',
    blurb: 'Rolling release base with absolute latest packages.',
    lede: 'Marlin tracks Arch Linux rolling packages on top of the composefs-native bootc runtime.',
    accent: '#1793d1',
    accent2: '#33aaff',
    stats: [
      {label: 'Status', value: 'Production'},
      {label: 'Cadence', value: 'Rolling-release'},
      {label: 'Arch', value: 'x86_64'},
    ],
    desktops: ALL_DESKTOPS,
    features: [BOOTC, HOMEBREW, FLATHUB, NVIDIA],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/marlin:gnome'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/marlin:kde'},
      {name: 'COSMIC', image: 'ghcr.io/tuna-os/marlin:cosmic'},
      {name: 'Niri', image: 'ghcr.io/tuna-os/marlin:niri'},
      {name: 'XFCE', image: 'ghcr.io/tuna-os/marlin:xfce'},
    ],
    hasIsos: true,
  },
  {
    id: 'flounder',
    emoji: '🐡',
    name: 'Flounder',
    base: 'Debian 13 Trixie',
    baseUrl: 'https://debian.org',
    blurb: 'Stable Debian base with containerized package delivery.',
    lede: 'Flounder brings Debian 13 (Trixie) to the bootc model with stable package guarantees.',
    accent: '#a80030',
    accent2: '#d70a53',
    stats: [
      {label: 'Status', value: 'Production'},
      {label: 'Cadence', value: 'Debian stable'},
      {label: 'Arch', value: 'x86_64'},
    ],
    desktops: ALL_DESKTOPS,
    features: [BOOTC, HOMEBREW, FLATHUB],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/flounder:gnome'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/flounder:kde'},
      {name: 'COSMIC', image: 'ghcr.io/tuna-os/flounder:cosmic'},
      {name: 'Niri', image: 'ghcr.io/tuna-os/flounder:niri'},
      {name: 'XFCE', image: 'ghcr.io/tuna-os/flounder:xfce'},
    ],
    hasIsos: true,
  },
  {
    id: 'flounder-sid',
    emoji: '☢️',
    name: 'Flounder Sid',
    base: 'Debian Sid',
    baseUrl: 'https://debian.org',
    blurb: 'Rolling Debian development base.',
    lede: 'Flounder Sid tracks Debian unstable (Sid) packages for bleeding-edge deb-based systems.',
    accent: '#003554',
    accent2: '#005082',
    stats: [
      {label: 'Status', value: 'Production'},
      {label: 'Cadence', value: 'Debian unstable'},
      {label: 'Arch', value: 'x86_64'},
    ],
    desktops: ALL_DESKTOPS,
    features: [BOOTC, HOMEBREW, FLATHUB],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/flounder-sid:gnome'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/flounder-sid:kde'},
      {name: 'COSMIC', image: 'ghcr.io/tuna-os/flounder-sid:cosmic'},
      {name: 'Niri', image: 'ghcr.io/tuna-os/flounder-sid:niri'},
      {name: 'XFCE', image: 'ghcr.io/tuna-os/flounder-sid:xfce'},
    ],
    hasIsos: true,
  },
  {
    id: 'bonito-rawhide',
    emoji: '🐉',
    name: 'Bonito Rawhide',
    base: 'Fedora Rawhide',
    baseUrl: 'https://fedoraproject.org',
    blurb: 'Fedora Rawhide upstream development base.',
    lede: 'Bonito Rawhide tracks Fedora Rawhide packages for upstream-bleeding Fedora development.',
    accent: '#1b4332',
    accent2: '#2d6a4f',
    stats: [
      {label: 'Status', value: 'Production'},
      {label: 'Cadence', value: 'Rawhide'},
      {label: 'Arch', value: 'x86_64 · aarch64'},
    ],
    desktops: ALL_DESKTOPS.filter((d) => d.tag !== 'gnome50'),
    features: [BOOTC, HOMEBREW, FLATHUB],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/bonito-rawhide:gnome'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/bonito-rawhide:kde'},
      {name: 'Niri', image: 'ghcr.io/tuna-os/bonito-rawhide:niri'},
      {name: 'XFCE', image: 'ghcr.io/tuna-os/bonito-rawhide:xfce'},
    ],
    hasIsos: true,
  },
  {
    id: 'sailfin',
    emoji: '🦎',
    name: 'Sailfin',
    base: 'openSUSE Tumbleweed',
    baseUrl: 'https://opensuse.org',
    blurb: 'openSUSE Tumbleweed rolling package base.',
    lede: 'Sailfin is openSUSE Tumbleweed, providing a transactional-style rolling package base.',
    accent: '#73ba1f',
    accent2: '#93d93f',
    stats: [
      {label: 'Status', value: 'Production'},
      {label: 'Cadence', value: 'openSUSE rolling'},
      {label: 'Arch', value: 'x86_64'},
    ],
    desktops: ALL_DESKTOPS.filter((d) => ['gnome', 'kde', 'niri', 'xfce'].includes(d.tag)),
    features: [BOOTC, HOMEBREW, FLATHUB],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/sailfin:gnome'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/sailfin:kde'},
      {name: 'Niri', image: 'ghcr.io/tuna-os/sailfin:niri'},
      {name: 'XFCE', image: 'ghcr.io/tuna-os/sailfin:xfce'},
    ],
    hasIsos: true,
  },
  {
    id: 'guppy',
    emoji: '🐧',
    name: 'Guppy',
    base: 'Gentoo Linux',
    baseUrl: 'https://gentoo.org',
    blurb: 'Source-based Gentoo packages compiled on immutable layers.',
    lede: 'Guppy tracks Gentoo Linux stable packages with fast compile updates and portage binhost support.',
    accent: '#4e3a65',
    accent2: '#6b5883',
    stats: [
      {label: 'Status', value: 'Production'},
      {label: 'Cadence', value: 'Gentoo stable'},
      {label: 'Arch', value: 'x86_64'},
    ],
    desktops: ALL_DESKTOPS.filter((d) => ['gnome', 'kde'].includes(d.tag)),
    features: [BOOTC, HOMEBREW, FLATHUB],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/guppy:gnome'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/guppy:kde'},
    ],
    hasIsos: true,
  },}],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/guppy:gnome'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/guppy:kde'},
    ],
    hasIsos: false,
  },

>>>>>>> origin/main
];

export function getVariant(id: string): Variant | undefined {
  return VARIANTS.find((v) => v.id === id);
}
