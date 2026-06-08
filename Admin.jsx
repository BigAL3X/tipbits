import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function BitcoinLogo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none">
      <circle cx="32" cy="32" r="32" fill="#F7931A"/>
      <path d="M46.6 28.3c.6-4.2-2.6-6.5-7-8l1.4-5.7-3.5-.9-1.4 5.5-2.8-.7 1.4-5.5-3.5-.9-1.4 5.7-2.2-.6-4.8-1.2-.9 3.7s2.6.6 2.5.6c1.4.4 1.6 1.3 1.6 2l-1.6 6.4c.1 0 .2.1.4.1l-.4-.1-2.3 9c-.2.5-.7 1.2-1.8.9.0.1-2.5-.6-2.5-.6L15 42.6l4.5 1.1 2.5.6-1.5 5.8 3.5.9 1.5-5.8 2.8.7-1.4 5.7 3.5.9 1.4-5.7c5.9 1.1 10.3.7 12.2-4.7 1.5-4.3-.1-6.8-3.2-8.4 2.3-.5 4-2 4.4-5.4zm-7.9 11.1c-1.1 4.3-8.4 2-10.8 1.4l1.9-7.7c2.4.6 10.1 1.8 8.9 6.3zm1.1-11.2c-1 4-7.1 1.9-9.1 1.4l1.7-7c2 .5 8.5 1.5 7.4 5.6z" fill="white"/>
    </svg>
  );
}

const EVENT_COLORS = {
  page_view:         { bg: "#e0f2fe", color: "#0369a1", label: "Page Views" },
  invoice_generated: { bg: "#fff7ed", color: "#c2410c", label: "Invoices" },
  registration:      { bg: "#f0fdf4", color: "#15803d", label: "Registrations" },
  edit:              { bg: "#f5f3ff", color: "#6d28d9", label: "Edits" },
  delete:            { bg: "#fef2f2", color: "#b91c1c", label: "Deletes" },
};

function StatCard({ label, value, color, bg }) {
  return (
    <div style={{ background: bg, border: `1.5px solid ${color}30`, borderRadius: 12, padding: "16px 20px", flex: 1, minWidth: 120 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color, textTransform: "uppercase", letterSpacing: ".07em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: "#111827", fontFamily: "'IBM Plex Mono', monospace" }}>{value.toLocaleString()}</div>
    </div>
  );
}

function MiniBar({ date, counts, maxTotal }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const barH = maxTotal > 0 ? Math.max(2, Math.round((total / maxTotal) * 80)) : 2;
  const label = date.slice(5); // MM-DD

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, flex: 1, minWidth: 0 }}>
      <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'IBM Plex Mono',monospace" }}>{total || ""}</div>
      <div style={{ width: "100%", height: 80, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
        <div style={{ width: "70%", height: barH, background: total > 0 ? "#F7931A" : "#f3f4f6", borderRadius: 3, transition: "height .3s ease" }} />
      </div>
      <div style={{ fontSize: 9, color: "#9ca3af", fontFamily: "'IBM Plex Mono',monospace", transform: "rotate(-45deg)", whiteSpace: "nowrap", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

export default function Admin() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [authed, setAuthed] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);

  const fetchData = async (pw, d) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/analytics/data?p=${encodeURIComponent(pw)}&days=${d}`, { cache: "no-store" });
      const json = await res.json();
      if (res.status === 401) {
        setAuthError("Incorrect password.");
        setAuthed(false);
        return;
      }
      if (!res.ok || json.error) {
        setError(json.error || "Failed to load analytics.");
        return;
      }
      setData(json);
      setAuthed(true);
    } catch {
      setError("Could not reach the analytics endpoint.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setAuthError(null);
    fetchData(password, days);
  };

  useEffect(() => {
    if (authed && password) fetchData(password, days);
  }, [days]);

  // Aggregate totals and per-day breakdown
  const aggregated = data ? (() => {
    const totals = {};
    const byDay = [];

    for (const day of data.days) {
      const counts = {};
      for (const ev of day.events) {
        totals[ev.type] = (totals[ev.type] ?? 0) + 1;
        counts[ev.type] = (counts[ev.type] ?? 0) + 1;
      }
      byDay.push({ date: day.date, counts });
    }

    const recentPages = {};
    for (const day of data.days) {
      for (const ev of day.events) {
        if (ev.type === "page_view" && ev.username) {
          recentPages[ev.username] = (recentPages[ev.username] ?? 0) + 1;
        }
      }
    }

    const topPages = Object.entries(recentPages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const maxTotal = Math.max(...byDay.map(d => Object.values(d.counts).reduce((a, b) => a + b, 0)), 1);

    return { totals, byDay, topPages, maxTotal };
  })() : null;

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(135deg,#fff7ed 0%,#ffffff 50%,#fff7ed 100%)", fontFamily: "'IBM Plex Sans',system-ui,sans-serif", padding: "24px 16px 64px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .adm-wrap{max-width:720px;margin:0 auto;}
        .adm-input{width:100%;background:white;border:1.5px solid #e5e7eb;color:#111827;padding:12px 14px;border-radius:10px;font-family:'IBM Plex Sans',sans-serif;font-size:14px;outline:none;transition:border-color .15s ease;}
        .adm-input:focus{border-color:#F7931A;box-shadow:0 0 0 3px rgba(247,147,26,.12);}
        .adm-btn{padding:13px 24px;background:#F7931A;color:white;border:none;border-radius:10px;font-family:'IBM Plex Sans',sans-serif;font-size:14px;font-weight:600;cursor:pointer;transition:all .15s ease;}
        .adm-btn:hover:not(:disabled){background:#e8840f;}
        .adm-btn:disabled{opacity:.5;cursor:not-allowed;}
        .day-btn{padding:6px 14px;border:1.5px solid #e5e7eb;border-radius:8px;background:white;color:#6b7280;font-family:'IBM Plex Sans',sans-serif;font-size:13px;cursor:pointer;transition:all .13s ease;}
        .day-btn.active{border-color:#F7931A;color:#F7931A;background:#fff7ed;font-weight:600;}
        .spin{animation:spin .8s linear infinite;display:inline-block;}
        @keyframes spin{to{transform:rotate(360deg);}}
      `}</style>

      <div className="adm-wrap">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 0 32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => navigate('/')}>
            <BitcoinLogo size={28} />
            <span style={{ fontSize: 16, fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>TipBits</span>
            <span style={{ fontSize: 12, color: "#9ca3af", marginLeft: 4 }}>/ admin</span>
          </div>
          <button onClick={() => navigate('/')} style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 13, cursor: "pointer", fontFamily: "'IBM Plex Sans',sans-serif", padding: "6px 12px" }}>
            ← Back to site
          </button>
        </div>

        {!authed ? (
          /* Login gate */
          <div style={{ maxWidth: 400, margin: "0 auto", marginTop: 40 }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
              <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 8 }}>Admin Dashboard</h1>
              <p style={{ fontSize: 14, color: "#6b7280" }}>Private analytics for TipBits</p>
            </div>
            <form onSubmit={handleLogin} style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "28px 24px", boxShadow: "0 4px 24px rgba(0,0,0,.06)" }}>
              {authError && (
                <div style={{ padding: "10px 14px", background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 8, fontSize: 13, color: "#b91c1c", marginBottom: 16 }}>
                  {authError}
                </div>
              )}
              <label style={{ fontSize: 11, color: "#9ca3af", letterSpacing: ".08em", textTransform: "uppercase", fontWeight: 600, display: "block", marginBottom: 8 }}>
                Admin Password
              </label>
              <input
                className="adm-input"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              <button type="submit" className="adm-btn" disabled={loading || !password.trim()} style={{ width: "100%", marginTop: 16 }}>
                {loading ? <span className="spin">⚡</span> : "⚡ View Analytics"}
              </button>
            </form>
          </div>
        ) : (
          /* Dashboard */
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Analytics Dashboard</h1>
              <div style={{ display: "flex", gap: 8 }}>
                {[7, 14, 30].map(d => (
                  <button key={d} className={`day-btn ${days === d ? "active" : ""}`} onClick={() => setDays(d)}>
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}>
                <span className="spin" style={{ fontSize: 28 }}>⚡</span>
              </div>
            )}

            {error && (
              <div style={{ padding: "12px 16px", background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, fontSize: 13, color: "#b91c1c", marginBottom: 20 }}>
                {error}
              </div>
            )}

            {aggregated && !loading && (
              <>
                {/* Stat cards */}
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
                  {Object.entries(EVENT_COLORS).map(([type, meta]) => (
                    <StatCard
                      key={type}
                      label={meta.label}
                      value={aggregated.totals[type] ?? 0}
                      color={meta.color}
                      bg={meta.bg}
                    />
                  ))}
                </div>

                {/* Bar chart */}
                <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "24px", marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 20 }}>Daily activity — last {days} days</div>
                  <div style={{ display: "flex", gap: 4, alignItems: "flex-end", overflowX: "auto", paddingBottom: 24 }}>
                    {aggregated.byDay.map(({ date, counts }) => (
                      <MiniBar key={date} date={date} counts={counts} maxTotal={aggregated.maxTotal} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af", textAlign: "center", marginTop: 8 }}>
                    ⚡ each bar = total events that day
                  </div>
                </div>

                {/* Top pages */}
                {aggregated.topPages.length > 0 && (
                  <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "24px", marginBottom: 24, boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 16 }}>Top pages by views</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                      {aggregated.topPages.map(([username, count], i) => {
                        const pct = Math.round((count / aggregated.topPages[0][1]) * 100);
                        return (
                          <div key={username} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: i < aggregated.topPages.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                            <span style={{ fontSize: 11, color: "#9ca3af", width: 16, textAlign: "right", fontFamily: "'IBM Plex Mono',monospace" }}>{i + 1}</span>
                            <a href={`/u/${username}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 500, color: "#F7931A", textDecoration: "none", fontFamily: "'IBM Plex Mono',monospace", flex: 1 }}>
                              /u/{username}
                            </a>
                            <div style={{ flex: 2, background: "#f3f4f6", borderRadius: 4, height: 6, overflow: "hidden" }}>
                              <div style={{ width: `${pct}%`, height: "100%", background: "#F7931A", borderRadius: 4 }} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#374151", fontFamily: "'IBM Plex Mono',monospace", minWidth: 32, textAlign: "right" }}>{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Recent registrations */}
                {(() => {
                  const regs = data.days.flatMap(d => d.events.filter(e => e.type === "registration")).slice(-10).reverse();
                  if (!regs.length) return null;
                  return (
                    <div style={{ background: "white", border: "1.5px solid #e5e7eb", borderRadius: 16, padding: "24px", boxShadow: "0 2px 12px rgba(0,0,0,.04)" }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 16 }}>Recent registrations</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {regs.map((ev, i) => (
                          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < regs.length - 1 ? "1px solid #f3f4f6" : "none" }}>
                            <a href={`/u/${ev.username}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 14, fontWeight: 500, color: "#F7931A", textDecoration: "none", fontFamily: "'IBM Plex Mono',monospace" }}>
                              /u/{ev.username}
                            </a>
                            <span style={{ fontSize: 11, color: "#9ca3af", fontFamily: "'IBM Plex Mono',monospace" }}>
                              {new Date(ev.ts).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div style={{ marginTop: 24, textAlign: "center", fontSize: 11, color: "#d1d5db" }}>
                  No IP addresses stored · No tipper data · No payment amounts
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
