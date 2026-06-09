import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./global.css";
import "./Admin.css";

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
    <div className="adm-stat-card" style={{ '--stat-bg': bg, '--stat-color': color, '--stat-border': color + '30' }}>
      <div className="adm-stat-label">{label}</div>
      <div className="adm-stat-value">{value.toLocaleString()}</div>
    </div>
  );
}

function MiniBar({ date, counts, maxTotal }) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  const barH = maxTotal > 0 ? Math.max(2, Math.round((total / maxTotal) * 80)) : 2;
  const label = date.slice(5); // MM-DD

  return (
    <div className="adm-minibar">
      <div className="adm-minibar-count">{total || ""}</div>
      <div className="adm-minibar-track">
        <div className="adm-minibar-bar" style={{ '--bar-h': barH + 'px', '--bar-bg': total > 0 ? "#F7931A" : "#f3f4f6" }} />
      </div>
      <div className="adm-minibar-label">{label}</div>
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
      const res = await fetch(`/api/events/data?days=${d}`, { cache: "no-store", headers: { "Authorization": `Bearer ${pw}` } });
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
    <div className="page-root">
      <div className="adm-wrap">
        {/* Header */}
        <div className="adm-header">
          <div className="adm-header-brand" onClick={() => navigate('/')}>
            <BitcoinLogo size={28} />
            <span className="adm-header-brand-text">TipBits</span>
            <span className="adm-header-brand-sub">/ admin</span>
          </div>
          <button onClick={() => navigate('/')} className="adm-back-btn">
            ← Back to site
          </button>
        </div>

        {!authed ? (
          /* Login gate */
          <div className="adm-login-wrap">
            <div className="adm-login-hero">
              <div className="adm-login-icon">🔒</div>
              <h1 className="adm-login-h1">Admin Dashboard</h1>
              <p className="adm-login-sub">Private analytics for TipBits</p>
            </div>
            <form onSubmit={handleLogin} className="adm-login-form">
              {authError && (
                <div className="adm-login-error">{authError}</div>
              )}
              <label className="adm-login-label">Admin Password</label>
              <input
                className="adm-input"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoFocus
              />
              <div className="adm-login-btn-wrap">
                <button type="submit" className="adm-btn adm-btn--full" disabled={loading || !password.trim()}>
                  {loading ? <span className="spin">⚡</span> : "⚡ View Analytics"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Dashboard */
          <>
            <div className="adm-dash-header">
              <h1 className="adm-dash-h1">Analytics Dashboard</h1>
              <div className="adm-day-btns">
                {[7, 14, 30].map(d => (
                  <button key={d} className={`day-btn ${days === d ? "active" : ""}`} onClick={() => setDays(d)}>
                    {d}d
                  </button>
                ))}
              </div>
            </div>

            {loading && (
              <div className="adm-loading">
                <span className="spin adm-loading-icon">⚡</span>
              </div>
            )}

            {error && (
              <div className="adm-error">{error}</div>
            )}

            {aggregated && !loading && (
              <>
                {/* Stat cards */}
                <div className="adm-stat-cards">
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
                <div className="adm-chart-card">
                  <div className="adm-chart-title">Daily activity — last {days} days</div>
                  <div className="adm-chart-bars">
                    {aggregated.byDay.map(({ date, counts }) => (
                      <MiniBar key={date} date={date} counts={counts} maxTotal={aggregated.maxTotal} />
                    ))}
                  </div>
                  <div className="adm-chart-footer">
                    ⚡ each bar = total events that day
                  </div>
                </div>

                {/* Top pages */}
                {aggregated.topPages.length > 0 && (
                  <div className="adm-top-pages-card">
                    <div className="adm-top-pages-title">Top pages by views</div>
                    <div className="adm-top-pages-list">
                      {aggregated.topPages.map(([username, count], i) => {
                        const pct = Math.round((count / aggregated.topPages[0][1]) * 100);
                        return (
                          <div key={username} className={`adm-top-pages-row${i < aggregated.topPages.length - 1 ? " adm-row--bordered" : ""}`}>
                            <span className="adm-top-pages-num">{i + 1}</span>
                            <a href={`/u/${username}`} target="_blank" rel="noopener noreferrer" className="adm-top-pages-link">
                              /u/{username}
                            </a>
                            <div className="adm-top-pages-bar-track">
                              <div className="adm-top-pages-bar-fill" style={{ '--bar-pct': pct + '%' }} />
                            </div>
                            <span className="adm-top-pages-count">{count}</span>
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
                    <div className="adm-regs-card">
                      <div className="adm-regs-title">Recent registrations</div>
                      <div className="adm-regs-list">
                        {regs.map((ev, i) => (
                          <div key={i} className={`adm-regs-row${i < regs.length - 1 ? " adm-row--bordered" : ""}`}>
                            <a href={`/u/${ev.username}`} target="_blank" rel="noopener noreferrer" className="adm-regs-link">
                              /u/{ev.username}
                            </a>
                            <span className="adm-regs-ts">
                              {new Date(ev.ts).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                <div className="adm-footer-note">
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
