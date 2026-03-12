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

const ALLOWED_PREFIXES = ['/v1', '/api'];
const BLOCKED_PATHS = new Set(['/api/setup']);

export function isAllowedApiPath(pathname) {
  if (BLOCKED_PATHS.has(pathname)) {
    return false;
  }
  return ALLOWED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

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
  return headers;
}

async function proxyToSpace(request, env) {
  const incoming = new URL(request.url);
  if (!isAllowedApiPath(incoming.pathname)) {
    return Response.json({
      success: false,
      message: 'This endpoint only serves API traffic.',
      allowed_prefixes: ALLOWED_PREFIXES
    }, { status: 404 });
  }

  const targetUrl = buildTargetUrl(request.url, env);
  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers: copyRequestHeaders(request, env),
    body: request.method === 'GET' || request.method === 'HEAD' ? undefined : request.body,
    redirect: 'manual'
  });

  const responseHeaders = new Headers(upstream.headers);
  for (const header of HOP_BY_HOP_HEADERS) {
    responseHeaders.delete(header);
  }
  responseHeaders.set('x-swifttoken-upstream', targetUrl.origin);
  responseHeaders.set('x-swifttoken-surface', 'api');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: responseHeaders
  });
}

export default {
  async fetch(request, env) {
    return proxyToSpace(request, env);
  }
};
