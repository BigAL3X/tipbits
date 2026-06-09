import { getStore } from "@netlify/blobs";
import { timingSafeEqual } from 'node:crypto';

function safeCompareHex(a, b) {
  try { return timingSafeEqual(Buffer.from(a, 'hex'), Buffer.from(b, 'hex')); } catch { return false; }
}

export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { username, editKeyHash } = body;

  if (!username || !editKeyHash) {
    return Response.json({ error: "Username and Sovereign Key are required" }, { status: 400 });
  }
  if (editKeyHash.length !== 64 || !/^[0-9a-f]+$/.test(editKeyHash)) {
    return Response.json({ error: "Invalid Sovereign Key format" }, { status: 400 });
  }

  try {
    const store = getStore("creators");
    const creator = await store.get(username, { type: "json" });

    if (!creator) {
      return Response.json({ error: "Username not found" }, { status: 404 });
    }
    if (!safeCompareHex(creator.editKeyHash, editKeyHash)) {
      return Response.json({ error: "Incorrect Sovereign Key" }, { status: 403 });
    }

    await store.delete(username);
    return Response.json({ success: true }, { headers: { "Cache-Control": "no-store" } });
  } catch (err) {
    console.error("Delete error:", err);
    return Response.json({ error: "Delete failed. Please try again." }, { status: 500 });
  }
};

export const config = { path: "/api/creator/delete" };
