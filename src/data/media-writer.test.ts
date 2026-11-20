import {describe, expect, it} from 'vitest';
import {detectPlatform, parseMediaWriter} from './media-writer';

const UA = {
  windows:
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  macos:
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Safari/605.1.15',
  linux: 'Mozilla/5.0 (X11; Linux x86_64; rv:133.0) Gecko/20100101 Firefox/133.0',
  linuxArm: 'Mozilla/5.0 (X11; Linux aarch64; rv:133.0) Gecko/20100101 Firefox/133.0',
  android:
    'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36',
  iphone:
    'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1',
  chromeos:
    'Mozilla/5.0 (X11; CrOS x86_64 14541.0.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
};

describe('detectPlatform', () => {
  it('maps desktop user agents to their Media Writer asset', () => {
    expect(detectPlatform({userAgent: UA.windows})).toEqual({kind: 'windows', asset: 'windows-x64'});
    expect(detectPlatform({userAgent: UA.macos, platform: 'MacIntel'})).toEqual({kind: 'macos', asset: 'macos'});
    expect(detectPlatform({userAgent: UA.linux})).toEqual({kind: 'linux', asset: 'linux-x86_64'});
    expect(detectPlatform({userAgent: UA.linuxArm})).toEqual({kind: 'linux', asset: 'linux-aarch64'});
  });

  it('treats phones and tablets as mobile, even when the user agent says Linux or Mac', () => {
    expect(detectPlatform({userAgent: UA.android}).kind).toBe('mobile');
    expect(detectPlatform({userAgent: UA.iphone}).kind).toBe('mobile');
    // iPadOS sends the desktop Safari user agent.
    expect(detectPlatform({userAgent: UA.macos, platform: 'MacIntel', maxTouchPoints: 5}).kind).toBe('mobile');
  });

  it('does not offer the Flatpak to ChromeOS', () => {
    expect(detectPlatform({userAgent: UA.chromeos}).kind).toBe('unknown');
  });
});

describe('parseMediaWriter', () => {
  it('keeps the known https assets and drops the rest', () => {
    const parsed = parseMediaWriter({
      mediaWriter: {
        version: '0.1.0',
        assets: {
          'windows-x64': {url: 'https://example.org/a.msi', size: 81020092, signed: false},
          macos: {url: 'javascript:alert(1)'},
          'linux-x86_64': {url: 'https://example.org/a.flatpak'},
          extra: {url: 'https://example.org/x'},
        },
      },
    });
    expect(parsed).toEqual({
      version: '0.1.0',
      assets: {
        'windows-x64': {url: 'https://example.org/a.msi', size: 81020092, signed: false},
        'linux-x86_64': {url: 'https://example.org/a.flatpak', size: undefined, signed: undefined},
      },
    });
  });

  it('returns null without a mediaWriter block', () => {
    expect(parseMediaWriter(null)).toBeNull();
    expect(parseMediaWriter({prebuilt: {}})).toBeNull();
  });
});
