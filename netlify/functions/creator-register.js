import { getStore } from "@netlify/blobs";

function isSafeWebsiteUrl(url) {
  if (!url) return true;
  try {
    const p = new URL(url);
    return p.protocol === 'https:' || p.protocol === 'http:';
  } catch { return false; }
}

const RESERVED = [
  'admin','api','register','edit','u','www','help','support',
  'about','home','login','dashboard','tipbits','how','me','you',
  'null','undefined','test','demo','creator','user','account',
];

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

  const { username, name, handle, bio, lightningAddress, website, editKeyHash } = body;

  // Validate username
  if (!username || !/^[a-z0-9-]{3,30}$/.test(username)) {
    return Response.json({ error: 'Username must be 3–30 lowercase letters, numbers, or hyphens' }, { status: 400 });
  }
  if (RESERVED.includes(username)) {
    return Response.json({ error: 'That username is reserved. Choose another.' }, { status: 400 });
  }

  // Validate required fields
  if (!name || name.trim().length < 1 || name.length > 50) {
    return Response.json({ error: 'Display name is required (max 50 characters)' }, { status: 400 });
  }
  if (!lightningAddress || !lightningAddress.includes('@') || lightningAddress.length > 200) {
    return Response.json({ error: 'A valid Lightning address is required (e.g. you@getalby.com)' }, { status: 400 });
  }
  if (website?.trim() && !isSafeWebsiteUrl(website.trim())) {
    return Response.json({ error: 'Website must be a valid http:// or https:// URL' }, { status: 400 });
  }
  // Sovereign Key hash: SHA-256 hex = 64 characters
  if (!editKeyHash || editKeyHash.length !== 64 || !/^[0-9a-f]+$/.test(editKeyHash)) {
    return Response.json({ error: 'Invalid sovereign key — please try again' }, { status: 400 });
  }

  try {
    const store = getStore('creators');

    // Check username availability
    const existing = await store.get(username);
    if (existing) {
      return Response.json({ error: 'Username already taken. Choose another.' }, { status: 409 });
    }

    const creator = {
      username,
      name: name.trim().slice(0, 50),
      handle: (handle?.trim() || `@${username}`).slice(0, 30),
      bio: (bio?.trim() || '').slice(0, 200),
      website: (website?.trim() || '').slice(0, 200),
      lightningAddress: lightningAddress.toLowerCase().trim(),
      editKeyHash,  // SHA-256 hash only — raw key never stored
      createdAt: new Date().toISOString(),
    };

    await store.setJSON(username, creator);

    return Response.json({ success: true, username });
  } catch (err) {
    console.error('Registration error:', err);
    return Response.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
};

export const config = { path: '/api/creator/register' };
