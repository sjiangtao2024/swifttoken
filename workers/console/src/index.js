const HOP_BY_HOP_HEADERS = [
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'host'
];

function buildTargetUrl(requestUrl, env) {
  const incoming = new URL(requestUrl);
  const base = new URL(env.HF_SPACE_BASE_URL);
  base.pathname = incoming.pathname;
  base.search = incoming.search;
  return base;
}

function copyRequestHeaders(request, env) {
  const headers = new Headers(request.headers);
  for (const header of HOP_BY_HOP_HEADERS) {
    headers.delete(header);
  }
  if (env.HF_SPACE_BEARER_TOKEN) {
    headers.set('authorization', `Bearer ${env.HF_SPACE_BEARER_TOKEN}`);
  }
  headers.set('x-forwarded-host', new URL(request.url).host);
  headers.set('x-forwarded-proto', 'https');
  headers.set('user-agent', headers.get('user-agent') || env.KEEPALIVE_USER_AGENT || 'swifttoken-worker/1.0');
  return headers;
}

async function proxyToSpace(request, env) {
  const targetUrl = buildTargetUrl(request.url, env);
  const headers = copyRequestHeaders(request, env);
  const init = {
    method: request.method,
    headers,
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual'
  };

  const upstream = await fetch(targetUrl, init);
  const responseHeaders = new Headers(upstream.headers);
  for (const header of HOP_BY_HOP_HEADERS) {
    responseHeaders.delete(header);
  }
  responseHeaders.set('x-swifttoken-upstream', targetUrl.origin);
  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders
  });
}

async function keepAlive(env) {
  const healthUrl = new URL(env.HF_SPACE_HEALTH_PATH || '/api/status', env.HF_SPACE_BASE_URL);
  const headers = new Headers({
    'user-agent': env.KEEPALIVE_USER_AGENT || 'swifttoken-hfspace-keepalive/1.0'
  });
  if (env.HF_SPACE_BEARER_TOKEN) {
    headers.set('authorization', `Bearer ${env.HF_SPACE_BEARER_TOKEN}`);
  }
  const response = await fetch(healthUrl, {
    method: 'GET',
    headers
  });
  const text = await response.text();
  console.log(JSON.stringify({
    ok: response.ok,
    status: response.status,
    url: healthUrl.toString(),
    bodyPreview: text.slice(0, 200)
  }));
}

export default {
  async fetch(request, env) {
    return proxyToSpace(request, env);
  },

  async scheduled(_controller, env, ctx) {
    ctx.waitUntil(keepAlive(env));
  }
};
