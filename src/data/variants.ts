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
    id: 'bonito-rawhide',
    emoji: '🐉',
    name: 'Bonito Rawhide',
    base: 'Fedora Rawhide',
    baseUrl: 'https://docs.fedoraproject.org/en-US/releases/rawhide/',
    blurb: 'Rolling Fedora development — the very latest of everything.',
    lede: 'Bonito Rawhide rides Fedora Rawhide, the rolling development branch of Fedora. Bleeding-edge kernels, GNOME, and toolchains that land upstream before any release.',
    accent: '#dc2626',
    accent2: '#f87171',
    stats: [
      {label: 'Base', value: 'Fedora Rawhide'},
      {label: 'Cadence', value: 'Rolling dev'},
      {label: 'Arch', value: 'x86_64 · aarch64'},
    ],
    desktops: ALL_DESKTOPS,
    features: [BOOTC, HOMEBREW, FLATHUB, HWE, NVIDIA, {
      emoji: '🔴',
      title: 'Rawhide freshness',
      text: 'Everything that lands in Fedora Rawhide within hours — kernels, drivers, and desktop stacks at the bleeding edge.',
    }],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/bonito-rawhide:gnome'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/bonito-rawhide:kde'},
      {name: 'Niri', image: 'ghcr.io/tuna-os/bonito-rawhide:niri'},
      {name: 'XFCE', image: 'ghcr.io/tuna-os/bonito-rawhide:xfce'},
    ],
    hasIsos: false,
  },
  {
    id: 'marlin',
    emoji: '🚀',
    name: 'Marlin',
    base: 'Arch Linux',
    baseUrl: 'https://archlinux.org',
    blurb: 'Rolling-release Arch Linux — latest everything, atomic updates.',
    lede: 'Marlin brings Arch Linux to the bootc world. Rolling-release, latest kernels and desktops, with atomic updates and composefs. CachyOS performance kernel available as an overlay flavor.',
    accent: '#1793d1',
    accent2: '#38bdf8',
    stats: [
      {label: 'Base', value: 'Arch Linux'},
      {label: 'Cadence', value: 'Rolling'},
      {label: 'Arch', value: 'x86_64'},
    ],
    desktops: ALL_DESKTOPS,
    features: [BOOTC, HOMEBREW, FLATHUB, {
      emoji: '📦',
      title: 'AUR access',
      text: 'The Arch User Repository — thousands of community packages at your fingertips.',
    }, {
      emoji: '⚡',
      title: 'CachyOS overlay',
      text: 'The -cachyos flavor replaces the stock kernel with the performance-tuned linux-cachyos kernel (BORE scheduler, LTO, x86-64-v3).',
    }],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/marlin:gnome'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/marlin:kde'},
      {name: 'COSMIC', image: 'ghcr.io/tuna-os/marlin:cosmic'},
      {name: 'Niri', image: 'ghcr.io/tuna-os/marlin:niri'},
      {name: 'XFCE', image: 'ghcr.io/tuna-os/marlin:xfce'},
      {name: 'GNOME (CachyOS)', image: 'ghcr.io/tuna-os/marlin:gnome-cachyos'},
      {name: 'KDE (CachyOS)', image: 'ghcr.io/tuna-os/marlin:kde-cachyos'},
    ],
    hasIsos: false,
  },
  {
    id: 'flounder',
    emoji: '🛡️',
    name: 'Flounder',
    base: 'Debian 13 Trixie',
    baseUrl: 'https://www.debian.org',
    blurb: 'Debian stable on bootc — solid, familiar, atomic.',
    lede: 'Flounder is the Debian stable variant. Debian 13 Trixie with bootc atomic updates — the rock-solid Debian ecosystem reimagined as an immutable desktop.',
    accent: '#d70a53',
    accent2: '#e8a87c',
    stats: [
      {label: 'Base', value: 'Debian 13 Trixie'},
      {label: 'Status', value: 'Blocked (ostree)'},
      {label: 'Arch', value: 'x86_64'},
    ],
    desktops: [],
    features: [BOOTC, {
      emoji: '⛔',
      title: 'Currently blocked',
      text: 'Debian Trixie ships ostree 2025.2. bootc requires >= 2025.3. Flounder is blocked until the package is updated or backported.',
    }],
    flavors: [],
    hasIsos: false,
  },
  {
    id: 'flounder-sid',
    emoji: '☢️',
    name: 'Flounder Sid',
    base: 'Debian Sid',
    baseUrl: 'https://www.debian.org/releases/sid/',
    blurb: 'Debian rolling — the newest Debian packages on an immutable base.',
    lede: 'Flounder Sid is the Debian Sid rolling variant. Sid always has the newest Debian packages, and bootc keeps them atomic and rollback-safe.',
    accent: '#d70a53',
    accent2: '#ffb347',
    stats: [
      {label: 'Base', value: 'Debian Sid'},
      {label: 'Cadence', value: 'Rolling'},
      {label: 'Arch', value: 'x86_64'},
    ],
    desktops: ALL_DESKTOPS,
    features: [BOOTC, HOMEBREW, FLATHUB, {
      emoji: '📦',
      title: 'Debian ecosystem',
      text: 'Thousands of apt packages, same familiar Debian package management, now on an atomic base.',
    }],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/flounder-sid:gnome'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/flounder-sid:kde'},
      {name: 'COSMIC', image: 'ghcr.io/tuna-os/flounder-sid:cosmic'},
      {name: 'Niri', image: 'ghcr.io/tuna-os/flounder-sid:niri'},
      {name: 'XFCE', image: 'ghcr.io/tuna-os/flounder-sid:xfce'},
    ],
    hasIsos: false,
  },
  {
    id: 'opensuse',
    emoji: '🦎',
    name: 'openSUSE',
    base: 'openSUSE Tumbleweed',
    baseUrl: 'https://www.opensuse.org',
    blurb: 'Rolling-release Tumbleweed — the SUSE ecosystem on bootc.',
    lede: 'openSUSE Tumbleweed brings the rolling SUSE ecosystem to bootc. Zypper-based, latest packages, atomic updates.',
    accent: '#73ba25',
    accent2: '#adc922',
    stats: [
      {label: 'Base', value: 'openSUSE Tumbleweed'},
      {label: 'Status', value: 'Experimental'},
      {label: 'Arch', value: 'x86_64'},
    ],
    desktops: ALL_DESKTOPS,
    features: [BOOTC, {
      emoji: '🦎',
      title: 'SUSE ecosystem',
      text: 'The openSUSE package ecosystem with zypper — rolling release, latest packages, now on bootc.',
    }],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/opensuse:gnome'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/opensuse:kde'},
      {name: 'Niri', image: 'ghcr.io/tuna-os/opensuse:niri'},
      {name: 'XFCE', image: 'ghcr.io/tuna-os/opensuse:xfce'},
    ],
    hasIsos: false,
  },
  {
    id: 'gentoo',
    emoji: '🐧',
    name: 'Gentoo',
    base: 'Gentoo Linux',
    baseUrl: 'https://www.gentoo.org',
    blurb: 'Source-based Gentoo — fully customizable, compiles everything.',
    lede: 'Gentoo on bootc. Source-based, emerge/portage-driven — every package compiled with your USE flags. Experimental, hours-long builds, unparalleled flexibility.',
    accent: '#54487a',
    accent2: '#7c3aed',
    stats: [
      {label: 'Base', value: 'Gentoo'},
      {label: 'Status', value: 'Experimental'},
      {label: 'Arch', value: 'x86_64'},
    ],
    desktops: ALL_DESKTOPS.filter((d) => ['gnome', 'kde'].includes(d.tag)),
    features: [BOOTC, {
      emoji: '🐧',
      title: 'Source-based flexibility',
      text: 'Gentoo's emerge compiles everything with your USE flags — ultimate customization on an immutable bootc base.',
    }],
    flavors: [
      {name: 'GNOME', image: 'ghcr.io/tuna-os/gentoo:gnome'},
      {name: 'KDE Plasma', image: 'ghcr.io/tuna-os/gentoo:kde'},
    ],
    hasIsos: false,
  },

];

export function getVariant(id: string): Variant | undefined {
  return VARIANTS.find((v) => v.id === id);
}
