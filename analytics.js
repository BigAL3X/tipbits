// Lightweight fire-and-forget analytics client.
// Never throws, never blocks the UI.

export function trackEvent(type, meta = {}) {
  try {
    fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, meta }),
    }).catch(() => {}); // swallow network errors silently
  } catch {
    // Never break the app for analytics
  }
}
