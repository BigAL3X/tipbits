import { getStore } from "@netlify/blobs";

const RESERVED = [
  'admin','api','register','edit','u','www','help','support',
  'about','home','login','dashboard','tipbits','how','me','you',
  'null','undefined','test','demo','creator','user','account',
];

export default async (request) => {
  const url = new URL(request.url);
  const username = url.searchParams.get('u')?.toLowerCase().trim();

  if (!username) return Response.json({ available: false, error: 'Username required' });

  if (!/^[a-z0-9-]{3,30}$/.test(username)) {
    return Response.json({ available: false, error: 'Username must be 3–30 lowercase letters, numbers, or hyphens' });
  }
  if (RESERVED.includes(username)) {
    return Response.json({ available: false, error: 'That username is reserved' });
  }

  try {
    const store = getStore('creators');
    const existing = await store.get(username);
    return Response.json({ available: !existing });
  } catch {
    return Response.json({ available: false, error: 'Could not check availability' });
  }
};

export const config = { path: '/api/creator/check' };
