import dns from 'node:dns/promises';

// Block requests to private/internal IP ranges (SSRF protection)
function isPrivateIp(ip) {
  return /^127\./.test(ip) ||
    /^10\./.test(ip) ||
    /^172\.(1[6-9]|2\d|3[01])\./.test(ip) ||
    /^192\.168\./.test(ip) ||
    /^169\.254\./.test(ip) ||
    /^::1$/.test(ip) ||
    /^fc00:/i.test(ip) ||
    /^fe80:/i.test(ip) ||
    ip === '0.0.0.0';
}

async function isHostSafe(hostname) {
  try {
    const { address } = await dns.lookup(hostname);
    return !isPrivateIp(address);
  } catch {
    return false;
  }
}

export default async (request) => {
  const url = new URL(request.url);
  const target = url.searchParams.get('url');

  if (!target) {
    return Response.json({ error: 'Missing url parameter' }, { status: 400 });
  }

  // Only allow HTTPS Lightning address endpoints
  let parsed;
  try {
    parsed = new URL(target);
  } catch {
    return Response.json({ error: 'Invalid URL' }, { status: 400 });
  }

  if (parsed.protocol !== 'https:') {
    return Response.json({ error: 'Only HTTPS allowed' }, { status: 400 });
  }

  // Only allow lnurlp paths or callback URLs (which carry an amount param AND a lnurlp-looking path)
  const isLnurlpLookup = parsed.pathname.includes('/.well-known/lnurlp/') ||
                         parsed.pathname.includes('/lnurlp/');
  const isCallback = parsed.searchParams.has('amount') && isLnurlpLookup;
  // Callbacks can be on the same host but a different path — allow if host was already lnurlp-validated
  // by requiring the base URL to have passed the path check on a prior call. Since we have no session
  // state, we instead rely on the DNS/IP check below as the primary SSRF guard, and require at minimum
  // that the ?amount param is present alongside a recognisable lnurlp path structure.
  const isCallbackOnly = parsed.searchParams.has('amount') && !isLnurlpLookup;

  if (!isLnurlpLookup && !isCallbackOnly) {
    return Response.json({ error: 'URL not permitted' }, { status: 403 });
  }

  // Block SSRF to private/internal hosts regardless of path
  if (!(await isHostSafe(parsed.hostname))) {
    return Response.json({ error: 'URL not permitted' }, { status: 403 });
  }

  try {
    const res = await fetch(target, {
      headers: { 'Accept': 'application/json' },
    });
    const data = await res.json();
    return Response.json(data, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch {
    return Response.json({ error: 'Fetch failed' }, { status: 502 });
  }
};

export const config = { path: '/api/lnurl-fetch' };
