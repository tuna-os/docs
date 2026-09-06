# Website design notes

Who tunaos.org is for, what we want each of those people to do, and the site
rules that follow from that. This is the reference for changes to
`src/pages/`, `src/components/` and the nav; the visual language itself
(Vesper dark base, one blue accent, JetBrains Mono, borderless panels on a 6px
radius, no gradients, no emoji) lives in `src/css/custom.css` and
`src/css/page.module.css`.

## Audiences and their calls to action

Five people arrive here. Each has exactly one thing the site wants them to do
next, and each of those actions is reachable from the front page in one click.

| # | Who | What they want | Primary CTA | Where it goes |
| - | --- | --- | --- | --- |
| 1 | **On Windows, curious about Linux.** Has one machine and cannot repartition it. | To try Linux without risking the machine | **Try from Windows** | `/wootc` |
| 2 | **Wants a desktop Linux to install.** Comparing distributions, or wants a long-support desktop. | A bootable ISO for their hardware | **Download** | `/download` |
| 3 | **Already runs bootc** (Universal Blue, Bluefin, Fedora Atomic). | A one-line switch to a TunaOS image | **Rebase** (`bootc switch …`) | `/download`, docs |
| 4 | **On some other distribution, wants the apps.** Does not care about the OS. | The office suite, terminal, file manager | **Apps** | `/flatpak` |
| 5 | **Builder or contributor.** | The tooling and where the code is | **Build an ISO** / **Docs** / GitHub | `/iso-builder`, `/docs`, GitHub |

Persona 1 is the one the site used to serve worst: wootc is the most
distinctive thing the org ships and had no page at all. It is now the first
CTA in the hero and has its own landing page.

## Rules that follow

1. **One click from the front page to every primary CTA.** The hero carries
   personas 1-3; the nav bar carries 2, 4 and 5. If a CTA needs a second hop,
   the front page is wrong.
2. **Lead with the path, not the product.** People choose how to install
   (from Windows, from a USB stick, by rebasing, in a VM) before they choose
   which image. The "Ways to install" band comes before the image lineup.
3. **Four images, not fourteen.** Albacore, Yellowfin, Skipjack and Bonito are
   the images we ask people to choose between. The other bases (Ubuntu, Arch,
   Debian, openSUSE, Gentoo, RHEL, and the rolling siblings) are real, but
   they are for people who came looking for them: they live on `/variants`
   and in the build matrix, not in the nav bar, the footer, or the docs
   sidebar. Their pages still exist and their URLs still work.
4. **Name things plainly.** No pitch copy, no "blazing fast", no exclamation
   points. Say what a thing is and what it runs on.
5. **No emoji in the interface.** Icons come from `src/components/Icon.tsx`.
   Emoji survive only where they are content (a project's own docs, synced
   from its repository).
6. **Every list on the site derives from `src/data/`.** The nav, the footer,
   the matrix, the picker and the landing pages read the same arrays.
   A hand-maintained second copy is how images went missing from menus before.

## Accessibility

The site is audited with axe-core (WCAG 2.2 A and AA rules) against the built
output; `npm run a11y` runs it over the pages people actually land on. Keep it
at zero violations — the checks that matter most here are contrast on the dark
panels, a visible focus ring on every control, and real button/label semantics
in the image picker and the carousels.

## Credits

The visual direction is by [@HuntedRaven7](https://github.com/HuntedRaven7)
(website remake, #380). It is credited in the site footer.
