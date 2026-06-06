import { getStore } from "@netlify/blobs";

export default async (request) => {
  const url = new URL(request.url);
  const username = url.searchParams.get('u')?.toLowerCase().trim();

  if (!username) {
    return Response.json({ error: 'Username required' }, { status: 400 });
  }

  try {
    const store = getStore('creators');
    const creator = await store.get(username, { type: 'json' });

    if (!creator) {
      return Response.json({ error: 'Creator not found' }, { status: 404 });
    }

    // Strip the key hash — only return public data
    const { editKeyHash, ...publicData } = creator;
    return Response.json(publicData);
  } catch (err) {
    console.error('Get creator error:', err);
    return Response.json({ error: 'Failed to load creator' }, { status: 500 });
  }
};

export const config = { path: '/api/creator/get' };
