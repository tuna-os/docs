import {afterEach, describe, expect, it, vi} from 'vitest';
import {buildsPerDay, buildStatus, getMatrixCell, matrixSummary} from './matrix';
import {VARIANTS, type Flavor, type Variant} from './variants';
import type {IsoEntry, IsoIndex} from '../hooks/useIsoIndex';

const variant = (flavors: Flavor[], extra: Partial<Variant> = {}): Variant => ({
  ...VARIANTS[0], id: 'test', flavors, ...extra,
});
const flavor = (tag: string, note?: string): Flavor => ({
  name: tag, image: `ghcr.io/tuna-os/test:${tag}`, note,
});
const iso = (name: string, extra: Partial<IsoEntry> = {}): IsoEntry => ({
  name, url: `https://example.test/${name}.iso`, size: 100,
  modified: '2026-01-02T12:00:00Z', arch: 'x86_64', latest: true, ...extra,
});
const index = (...all: IsoEntry[]): IsoIndex => ({
  all, entries: new Map(all.map((entry) => [entry.name, entry])), generatedAt: null,
});

describe('getMatrixCell', () => {
  it('distinguishes unavailable cells from a plain desktop without ISO metadata', () => {
    expect(getMatrixCell(variant([]), 'gnome')).toEqual({available: false, hwe: false, nvidia: false, iso: false});
    expect(getMatrixCell(variant([flavor('gnome')]), 'gnome')).toEqual({available: true, hwe: false, nvidia: false, iso: false});
  });

  it('combines edition flags and case-insensitive ISO notes across matching flavors', () => {
    const v = variant([flavor('gnome-hwe', 'Live ISO published'), flavor('gnome-nvidia')]);
    expect(getMatrixCell(v, 'gnome')).toEqual({available: true, hwe: true, nvidia: true, iso: true});
    expect(getMatrixCell(v, 'kde')).toEqual({available: false, hwe: false, nvidia: false, iso: false});
  });

  it('requires a desktop boundary, including for versioned tags', () => {
    const v = variant([flavor('gnome49-hwe'), flavor('mygnome-nvidia')]);
    expect(getMatrixCell(v, 'gnome').available).toBe(false);
    expect(getMatrixCell(v, 'gnome49').hwe).toBe(true);
  });
});

describe('buildStatus', () => {
  const v = variant([flavor('gnome-hwe'), flavor('gnome')]);

  it('distinguishes loading from an empty published index and prefers the plain image', () => {
    expect(buildStatus(v, 'gnome', null)).toEqual({
      built: true, image: 'ghcr.io/tuna-os/test:gnome', iso: null, builtAt: null,
      arches: [], nvidia: false, hwe: true, bytes: 0, builds: 0, localOnly: false, pending: true,
    });
    expect(buildStatus(v, 'gnome', index())).toEqual({...buildStatus(v, 'gnome', null), pending: false});
    expect(buildStatus(variant([], {localBuildOnly: true}), 'gnome', index())).toMatchObject({built: false, image: null, localOnly: true});
  });

  it('aggregates only the selected variant and desktop siblings', () => {
    const plain = iso('test-gnome-latest');
    const data = index(plain,
      iso('test-gnome-nvidia-latest', {arch: 'arm64', size: 200, modified: '2026-01-03T01:00:00Z'}),
      iso('test-gnome-hwe-latest', {arch: 'aarch64', modified: 'invalid'}),
      iso('test-gnome-10-x86_64-v2-latest', {arch: 'x86_64-v2'}),
      iso('test-gnome-unknown-latest', {arch: 'unknown'}),
      iso('test-gnome49-latest', {size: 999}), iso('other-gnome-latest', {size: 999}));
    expect(buildStatus(v, 'gnome', data)).toMatchObject({
      iso: plain, builtAt: '2026-01-03T01:00:00.000Z',
      arches: ['aarch64', 'x86_64', 'x86_64-v2'], builds: 5, bytes: 600, nvidia: true, hwe: true, pending: false,
    });
  });

  it('prefers the selected edition ISO, with a plain ISO fallback', () => {
    const edition = iso('test-gnome-hwe-latest');
    const plain = iso('test-gnome-latest');
    const editionsOnly = variant([flavor('gnome-hwe')]);
    expect(buildStatus(editionsOnly, 'gnome', index(plain, edition)).iso).toBe(edition);
    expect(buildStatus(editionsOnly, 'gnome', index(plain)).iso).toBe(plain);
  });

  it('reports sibling totals even when no downloadable primary ISO or valid date exists', () => {
    expect(buildStatus(v, 'gnome', index(iso('test-gnome-aarch64-latest', {modified: 'invalid'}))))
      .toMatchObject({iso: null, builds: 1, bytes: 100, builtAt: null});
  });
});

describe('matrixSummary', () => {
  it('keeps static counts while the index loads and aggregates live totals on arrival', () => {
    const empty = matrixSummary(null);
    expect(empty.variants).toBe(VARIANTS.length);
    expect(empty.desktops).toBeGreaterThan(0);
    expect(empty.combinations).toBeGreaterThan(empty.variants);
    expect(empty).toMatchObject({isos: 0, bytes: 0, newest: null});
    expect(matrixSummary(index())).toEqual(empty);
    expect(matrixSummary(index(iso('a'), iso('b', {size: 300, modified: '2026-01-04T00:00:00Z'}), iso('c', {modified: 'invalid'}))))
      .toEqual({...empty, isos: 3, bytes: 500, newest: '2026-01-04T00:00:00.000Z'});
  });
});

describe('buildsPerDay', () => {
  afterEach(() => vi.useRealTimers());

  it('anchors stale data to its latest build and fills gaps across a year boundary', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-01T23:00:00Z'));
    expect(buildsPerDay(index(iso('a', {modified: '2025-12-31T23:00:00Z'}), iso('b'), iso('c')), 3)).toEqual({
      anchor: '2026-01-02', buckets: [
        {day: '2025-12-31', count: 1}, {day: '2026-01-01', count: 0}, {day: '2026-01-02', count: 2},
      ],
    });
  });

  it('returns a default empty UTC window while loading or empty', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-03T01:00:00+05:00'));
    const empty = buildsPerDay(null);
    expect(empty.anchor).toBeNull();
    expect(empty.buckets).toHaveLength(14);
    expect(empty.buckets.at(-1)).toEqual({day: '2026-01-02', count: 0});
    expect(empty.buckets.every((bucket) => bucket.count === 0)).toBe(true);
    expect(buildsPerDay(index())).toEqual(empty);
  });

  it('caps future-dated builds at today', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-02T20:00:00Z'));
    expect(buildsPerDay(index(iso('future', {modified: '2026-01-04T00:00:00Z'})), 1))
      .toEqual({anchor: '2026-01-02', buckets: [{day: '2026-01-02', count: 0}]});
  });
});
