import { getStore } from "@netlify/blobs";
import { timingSafeEqual } from 'node:crypto';

function safeCompareHex(a, b) {
  try { return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex')); } catch { return false; }
}

function isSafeWebsiteUrl(url) {
  if (!url) return true;
  try {
    const p = new URL(url);
    return p.protocol === 'https:' || p.protocol === 'http:';
  } catch { return false; }
}

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

  const { username, editKeyHash, name, handle, bio, website, lightningAddress } = body;

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
    if (!safeCompareHex(creator.editKeyHash, editKeyHash)) {
      return Response.json({ error: 'Incorrect Sovereign Key' }, { status: 403 });
    }

    // Validate any updated fields
    if (lightningAddress && (!lightningAddress.includes('@') || lightningAddress.length > 200)) {
      return Response.json({ error: 'Invalid Lightning address' }, { status: 400 });
    }
    const websiteValue = website?.trim() ?? creator.website ?? '';
    if (websiteValue && !isSafeWebsiteUrl(websiteValue)) {
      return Response.json({ error: 'Website must be a valid http:// or https:// URL' }, { status: 400 });
    }

    const updated = {
      ...creator,
      name: (name?.trim() || creator.name).slice(0, 50),
      handle: (handle?.trim() || creator.handle).slice(0, 30),
      bio: (bio?.trim() ?? creator.bio).slice(0, 200),
      website: websiteValue.slice(0, 200),
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
