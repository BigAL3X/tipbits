import { getStore } from "@netlify/blobs";

export default async (request) => {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { username, editKeyHash, name, handle, bio, lightningAddress } = body;

  if (!username || !editKeyHash) {
    return Response.json({ error: 'Username and Sovereign Key are required' }, { status: 400 });
  }
  if (editKeyHash.length !== 64 || !/^[0-9a-f]+$/.test(editKeyHash)) {
    return Response.json({ error: 'Invalid Sovereign Key format' }, { status: 400 });
  }

  try {
    const store = getStore('creators');
    const creator = await store.get(username, { type: 'json' });

    if (!creator) {
      return Response.json({ error: 'Username not found' }, { status: 404 });
    }
    if (creator.editKeyHash !== editKeyHash) {
      return Response.json({ error: 'Incorrect Sovereign Key' }, { status: 403 });
    }

    // Validate any updated fields
    if (lightningAddress && (!lightningAddress.includes('@') || lightningAddress.length > 200)) {
      return Response.json({ error: 'Invalid Lightning address' }, { status: 400 });
    }

    const updated = {
      ...creator,
      name: (name?.trim() || creator.name).slice(0, 50),
      handle: (handle?.trim() || creator.handle).slice(0, 30),
      bio: (bio?.trim() ?? creator.bio).slice(0, 200),
      lightningAddress: lightningAddress
        ? lightningAddress.toLowerCase().trim()
        : creator.lightningAddress,
      updatedAt: new Date().toISOString(),
    };

    await store.setJSON(username, updated);
    return Response.json({ success: true }, {
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (err) {
    console.error('Update error:', err);
    return Response.json({ error: 'Update failed. Please try again.' }, { status: 500 });
  }
};

export const config = { path: '/api/creator/update' };
