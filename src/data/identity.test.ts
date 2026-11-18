import {describe, expect, it} from 'vitest';
import {desktopLogo, emojiMarkFor, wordmarkFor, MASTER_MARK} from './identity';

describe('variant identity', () => {
  it.each(['albacore', 'yellowfin', 'skipjack', 'bonito', 'bonito-rawhide', 'flounder',
    'flounder-sid', 'grouper', 'guppy', 'gurnard', 'hummingbird', 'marlin', 'sailfin', 'wahoo'])(
    'resolves emoji and both wordmark themes for %s', (id) => {
      expect(emojiMarkFor(id)).toBe(`/img/identity/emoji/${id}.svg`);
      expect(wordmarkFor(id)).toEqual({
        light: `/img/identity/wordmarks/${id}.svg`,
        dark: `/img/identity/wordmarks/${id}-dark.svg`,
      });
    },
  );

  it.each(['redfin', 'unknown', ''])('falls back for %s', (id) => {
    expect(emojiMarkFor(id)).toBe(MASTER_MARK);
    expect(wordmarkFor(id)).toBeNull();
  });
});

describe('desktop logos', () => {
  it.each(['gnome', 'kde', 'cosmic', 'niri', 'xfce'])(
    'resolves %s', (tag) => expect(desktopLogo(tag)).toBe(`/img/desktops/${tag}.svg`),
  );
  it.each(['gnome48', 'gnome49', 'gnome123'])(
    'normalizes versioned GNOME tag %s', (tag) => expect(desktopLogo(tag)).toBe('/img/desktops/gnome.svg'),
  );
  it.each(['', 'pantheon', 'GNOME', 'gnome-hwe', 'gnome49-extra', 'mygnome49', 'kde6'])(
    'does not invent a logo for %s', (tag) => expect(desktopLogo(tag)).toBeNull(),
  );
});
