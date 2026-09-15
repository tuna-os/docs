// OCI AppStream caches icons/128x128, while Bazaar currently searches
// icons/flatpak/128x128. Offer a remote URL as a fallback for software stores.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const base = join(process.cwd(), 'static', 'flatpak');
const indexPath = join(base, 'index', 'static');
const iconDir = join(base, 'icons');
const index = JSON.parse(readFileSync(indexPath, 'utf8'));
const pngSignature = Buffer.from('89504e470d0a1a0a', 'hex');
let added = 0;

for (const result of index.Results) {
  for (const image of result.Images) {
    const labels = image.Labels;
    const match = /^app\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/.exec(labels['org.flatpak.ref'] ?? '');
    if (!match) throw new Error(`Invalid Flatpak ref in ${result.Name}`);
    const [, appId, arch] = match;
    const iconLabel = labels['org.freedesktop.appstream.icon-128'] ?? '';
    if (!iconLabel.startsWith('data:image/png;base64,')) {
      throw new Error(`Missing 128px PNG icon for ${appId}/${arch}`);
    }
    const png = Buffer.from(iconLabel.slice('data:image/png;base64,'.length), 'base64');
    if (!png.subarray(0, 8).equals(pngSignature) || png.readUInt32BE(16) !== 128 || png.readUInt32BE(20) !== 128) {
      throw new Error(`Invalid 128px PNG icon for ${appId}/${arch}`);
    }

    mkdirSync(iconDir, { recursive: true });
    const iconPath = join(iconDir, `${appId}-${arch}.png`);
    try {
      if (!readFileSync(iconPath).equals(png)) writeFileSync(iconPath, png);
    } catch (error) {
      if (error.code !== 'ENOENT') throw error;
      writeFileSync(iconPath, png);
    }

    const appdata = labels['org.freedesktop.appstream.appdata'] ?? '';
    if (!appdata.includes(`<id>${appId}</id>`)) {
      throw new Error(`AppStream ID does not match ${appId}/${arch}`);
    }
    const url = `https://tunaos.org/flatpak/icons/${appId}-${arch}.png`;
    const remoteIcon = `<icon type="remote" width="128" height="128">${url}</icon>`;
    if (!appdata.includes(remoteIcon)) {
      const stockIcon = appdata.match(/<icon type="stock">[^<]+<\/icon>/);
      if (stockIcon) {
        labels['org.freedesktop.appstream.appdata'] = appdata.replace(stockIcon[0], `${remoteIcon}\n    ${stockIcon[0]}`);
      } else if (appdata.includes('</component>')) {
        labels['org.freedesktop.appstream.appdata'] = appdata.replace('</component>', `    ${remoteIcon}\n  </component>`);
      } else {
        throw new Error(`Invalid AppStream catalogue for ${appId}/${arch}`);
      }
      added++;
    }
  }
}

if (added) writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
console.log(`Flatpak remote icons ready (${added} AppStream entries enriched)`);
