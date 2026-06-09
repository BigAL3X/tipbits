import { getStore } from "@netlify/blobs";

export default async (request) => {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Auth via Authorization: Bearer <token> header — never accept password in URL
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || token !== adminPassword) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  try {
    const store = getStore("analytics");
    const days = parseInt(url.searchParams.get("days") ?? "30", 10);
    const limit = Math.min(Math.max(days, 1), 90);

    // Build date range
    const results = [];
    const now = new Date();

    for (let i = 0; i < limit; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const key = `day:${dateStr}`;

      try {
        const data = await store.get(key, { type: "json" });
        results.push({ date: dateStr, events: data?.events ?? [] });
      } catch {
        results.push({ date: dateStr, events: [] });
      }
    }

    // Sort oldest first
    results.sort((a, b) => a.date.localeCompare(b.date));

    return Response.json({ days: results }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (err) {
    console.error("Analytics data error:", err);
    return Response.json({ error: "Failed to load analytics" }, { status: 500 });
  }
};

export const config = { path: "/api/events/data" };
