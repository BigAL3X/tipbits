import { getStore } from "@netlify/blobs";

export default async (request) => {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Password check
  const url = new URL(request.url);
  const password = url.searchParams.get("p");
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword || password !== adminPassword) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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
