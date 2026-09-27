import {validateAdoption} from '../src/data/adoption.mjs';

const headers = {'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff'};
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname !== '/api/adoption') return env.ASSETS.fetch(request);
    if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, {status: 405, headers: {'Allow': 'GET, HEAD'}});
    try {
      const upstream = new URL(env.ADOPTION_METRICS_URL || 'https://countme.tunaos.org/v1/metrics');
      if (upstream.protocol !== 'https:' || upstream.username || upstream.password || upstream.search || upstream.hash) throw Error('Invalid upstream');
      // Application code copies no visitor headers, cookies, or query strings.
      // Cloudflare can add transport headers; the collector does not read/store them.
      const transport = env.COUNTME || globalThis;
      const response = await transport.fetch(upstream.href, {headers: {'Accept': 'application/json'}, redirect: 'manual', signal: AbortSignal.timeout(8000)});
      if (!response.ok || !response.headers.get('content-type')?.includes('application/json')) throw Error('Unavailable feed');
      const reader = response.body.getReader(); const chunks = []; let size = 0;
      while (true) {
        const {done, value} = await reader.read(); if (done) break;
        size += value.byteLength;
        if (size > 512000) {await reader.cancel(); throw Error('Oversize feed');}
        chunks.push(value);
      }
      const bytes = new Uint8Array(size); let offset = 0;
      for (const chunk of chunks) {bytes.set(chunk, offset); offset += chunk.length;}
      const feed = validateAdoption(JSON.parse(new TextDecoder().decode(bytes)));
      return new Response(request.method === 'HEAD' ? null : JSON.stringify(feed), {headers: {...headers, 'Cache-Control': 'public, max-age=300, s-maxage=900'}});
    } catch {
      return new Response(request.method === 'HEAD' ? null : JSON.stringify({error: 'adoption_metrics_unavailable'}), {status: 503, headers: {...headers, 'Cache-Control': 'no-store', 'Retry-After': '300'}});
    }
  },
};
