import {buildHealthResponse} from './build-health.mjs';
import {validateAdoption} from '../src/data/adoption.mjs';

const headers = {'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff'};

// Reasons the proxy can fail upstream of a 503. Logged server-side only (via
// console.error, captured by Cloudflare Workers Logs when observability is
// enabled) so a dark dashboard can be diagnosed from the failure category
// without reproducing the request. The message never includes request
// headers, cookies, query strings, or any visitor-supplied value — only the
// fixed reason string and, where useful, non-visitor operational values
// (upstream HTTP status, response byte size, fixed parse/schema failure category).
class ProxyError extends Error {}

function proxyFailure(reason, detail) {
  console.error(`adoption-proxy: ${reason}`, detail ?? '');
  return new ProxyError(reason);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/api/build-health') return buildHealthResponse(request);
    if (url.pathname !== '/api/adoption') return env.ASSETS.fetch(request);
    const started = performance.now();
    const event = {event: 'adoption_proxy', method: ['GET', 'HEAD'].includes(request.method) ? request.method : 'OTHER', status: 503, cache_policy: 'no-store'};
    try {
      if (!['GET', 'HEAD'].includes(request.method)) {
        event.status = 405;
        event.cache_policy = 'none';
        return new Response(null, {status: 405, headers: {'Allow': 'GET, HEAD'}});
      }
      return await adoptionResponse(request, env, event);
    } finally {
      console.log(JSON.stringify({...event, duration_ms: Math.round(performance.now() - started)}));
    }
  },
};

async function adoptionResponse(request, env, event) {
  try {
    const upstream = new URL(env.ADOPTION_METRICS_URL || 'https://countme.tunaos.org/v1/metrics');
    if (upstream.protocol !== 'https:' || upstream.username || upstream.password || upstream.search || upstream.hash) {
      throw proxyFailure('invalid_upstream_url');
    }
    // Application code copies no visitor headers, cookies, or query strings.
    // Cloudflare can add transport headers; the collector does not read/store them.
    const transport = env.COUNTME || globalThis;
    let response;
    const fetchStarted = performance.now();
    try {
      response = await transport.fetch(upstream.href, {headers: {'Accept': 'application/json'}, redirect: 'manual', signal: AbortSignal.timeout(8000)});
    } catch (error) {
      throw proxyFailure(error.name === 'TimeoutError' || error.name === 'AbortError' ? 'upstream_timeout' : 'upstream_fetch_failed');
    } finally {event.upstream_duration_ms = Math.round(performance.now() - fetchStarted);}
    event.upstream_status = response.status;
    if (!response.ok) throw proxyFailure('upstream_http_error', response.status);
    if (!response.headers.get('content-type')?.includes('application/json')) {
      throw proxyFailure('upstream_wrong_content_type');
    }
    const reader = response.body.getReader(); const chunks = []; let size = 0;
    while (true) {
      const {done, value} = await reader.read(); if (done) break;
      size += value.byteLength;
      event.upstream_bytes = size;
      if (size > 512000) {await reader.cancel(); throw proxyFailure('upstream_oversize_feed', size);}
      chunks.push(value);
    }
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) {bytes.set(chunk, offset); offset += chunk.length;}
    let parsed;
    try {
      parsed = JSON.parse(new TextDecoder().decode(bytes));
    } catch (error) {
      throw proxyFailure('upstream_invalid_json');
    }
    let feed;
    try {
      feed = validateAdoption(parsed);
    } catch (error) {
      throw proxyFailure('upstream_schema_mismatch');
    }
    event.status = 200;
    event.cache_policy = 'public-300-900';
    return new Response(request.method === 'HEAD' ? null : JSON.stringify(feed), {headers: {...headers, 'Cache-Control': 'public, max-age=300, s-maxage=900'}});
  } catch (error) {
    event.reason = error instanceof ProxyError ? error.message : 'unexpected_error';
    if (!(error instanceof ProxyError)) console.error('adoption-proxy: unexpected_error');
    return new Response(request.method === 'HEAD' ? null : JSON.stringify({error: 'adoption_metrics_unavailable'}), {status: 503, headers: {...headers, 'Cache-Control': 'no-store', 'Retry-After': '300'}});
  }
}
