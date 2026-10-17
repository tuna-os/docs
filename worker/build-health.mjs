import {parseBuildHealth} from '../src/data/build-health.mjs';
const upstream = 'https://raw.githubusercontent.com/tuna-os/tunaOS/main/docs/build-health.json';
const headers = {'Content-Type': 'application/json; charset=utf-8', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': 'no-store'};
export async function buildHealthResponse(request) {
  if (!['GET', 'HEAD'].includes(request.method)) return new Response(null, {status: 405, headers: {...headers, Allow: 'GET, HEAD'}});
  const controller = new AbortController();
  let timer;
  const deadline = new Promise((_, reject) => {timer = setTimeout(() => {controller.abort(); reject(Error('Delayed build health'));}, 8000);});
  let reader;
  try {
    // A fixed public origin receives no visitor request fields.
    const response = await Promise.race([fetch(upstream, {method: 'GET', headers: {Accept: 'application/json'}, redirect: 'manual', signal: controller.signal}), deadline]);
    // GitHub raw content uses text/plain; JSON is still validated independently.
    const contentType = response.headers.get('content-type')?.split(';')[0].trim();
    if (response.status !== 200 || !['application/json', 'text/plain'].includes(contentType) || !response.body) throw Error('Unavailable build health');
    const declaredSize = response.headers.get('content-length');
    if (declaredSize !== null && (!/^\d+$/.test(declaredSize) || Number(declaredSize) > 2 * 1024 * 1024)) throw Error('Oversize build health');
    reader = response.body.getReader();
    const chunks = []; let size = 0;
    while (true) {
      const {done, value} = await Promise.race([reader.read(), deadline]);
      if (done) break;
      size += value.byteLength;
      if (size > 2 * 1024 * 1024 || controller.signal.aborted) throw Error('Oversize or delayed build health');
      chunks.push(value);
    }
    if (controller.signal.aborted) throw Error('Delayed build health');
    const bytes = new Uint8Array(size); let offset = 0;
    for (const chunk of chunks) {bytes.set(chunk, offset); offset += chunk.length;}
    const feed = parseBuildHealth(new TextDecoder('utf-8', {fatal: true}).decode(bytes));
    return new Response(request.method === 'HEAD' ? null : JSON.stringify(feed), {headers});
  } catch {
    controller.abort();
    if (reader) {try {await Promise.race([reader.cancel(), deadline]);} catch { /* transport already closed */ }}
    return new Response(request.method === 'HEAD' ? null : JSON.stringify({error: 'build_health_unavailable'}), {status: 503, headers: {...headers, 'Retry-After': '300'}});
  } finally {
    clearTimeout(timer);
  }
}
