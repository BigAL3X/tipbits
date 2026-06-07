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

  // Only allow lnurlp and callback paths
  const allowed = parsed.pathname.includes('/.well-known/lnurlp/') ||
                  parsed.pathname.includes('/lnurlp/') ||
                  parsed.searchParams.has('amount'); // callback URLs have amount param

  if (!allowed) {
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
  } catch (err) {
    return Response.json({ error: `Fetch failed: ${err?.message || err}` }, { status: 502 });
  }
};

export const config = { path: '/api/lnurl-fetch' };
