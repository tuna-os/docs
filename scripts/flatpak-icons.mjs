// OCI AppStream caches icons/128x128; stores also need remote icon URLs.
// Clone the input so callers retain ownership of canonical publication data.
export function enrichFlatpakIndex(input) {
  const index = structuredClone(input);
  const pngSignature = Buffer.from('89504e470d0a1a0a', 'hex');
  let added = 0;
  const icons = new Map();
  const warnings = [];

  for (const result of index.Results) {
    for (const image of result.Images) {
      const labels = image.Labels;
      const match = /^app\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)\/([A-Za-z0-9._-]+)$/.exec(labels['org.flatpak.ref'] ?? '');
      if (!match || match.slice(1).some(part => part === '.' || part === '..')) throw new Error(`Invalid Flatpak ref in ${result.Name}`);
      const [, appId, arch] = match;
      // A publisher shipping without a usable icon must not break the whole
      // site build; check-flatpak-remote.py reports the missing remote icon.
      const iconLabel = labels['org.freedesktop.appstream.icon-128'] ?? '';
      if (!iconLabel.startsWith('data:image/png;base64,')) {
        warnings.push(`Skipping ${appId}/${arch}: no 128px PNG icon label`);
        continue;
      }
      const png = Buffer.from(iconLabel.slice('data:image/png;base64,'.length), 'base64');
      if (png.length < 24 || !png.subarray(0, 8).equals(pngSignature) || png.readUInt32BE(16) !== 128 || png.readUInt32BE(20) !== 128) {
        warnings.push(`Skipping ${appId}/${arch}: icon-128 label is not a 128x128 PNG`);
        continue;
      }

      icons.set(`${appId}-${arch}.png`, png);

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

  return { index, icons, warnings, added };
}
