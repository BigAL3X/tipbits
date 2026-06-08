import { getStore } from "@netlify/blobs";

const ALLOWED_EVENTS = [
  "page_view",
  "invoice_generated",
  "registration",
  "edit",
  "delete",
];

export default async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, meta = {} } = body;

  if (!type || !ALLOWED_EVENTS.includes(type)) {
    return Response.json({ error: "Invalid event type" }, { status: 400 });
  }

  // Sanitise meta — only keep safe string/number fields, no PII
  const safeMeta = {};
  if (typeof meta.username === "string") safeMeta.username = meta.username.slice(0, 30);
  if (typeof meta.sats === "number") safeMeta.sats = meta.sats;

  const event = {
    type,
    ts: new Date().toISOString(),
    ...safeMeta,
  };

  try {
    const store = getStore("analytics");
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const key = `day:${today}`;

    const existing = await store.get(key, { type: "json" });
    const events = existing?.events ?? [];
    events.push(event);

    await store.setJSON(key, { events });

    return Response.json({ ok: true }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("Analytics event error:", err);
    // Silently succeed to never block the user flow
    return Response.json({ ok: true });
  }
};

export const config = { path: "/api/analytics/event" };
