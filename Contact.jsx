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

export default function Contact() {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => { setTimeout(() => setMounted(true), 60); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !message.trim()) {
      setError("Name and message are required.");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new URLSearchParams();
      formData.append("form-name", "contact");
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("subject", subject.trim());
      formData.append("message", message.trim());

      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      });

      if (!res.ok) throw new Error("Submit failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#fff7ed 0%,#ffffff 50%,#fff7ed 100%)", fontFamily:"'IBM Plex Sans',system-ui,sans-serif", padding:"24px 16px 64px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@300;400;500;600;700&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        .contact-wrap{opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .5s ease;max-width:480px;margin:0 auto;}
        .contact-wrap.in{opacity:1;transform:translateY(0);}
        .tj-input{width:100%;background:white;border:1.5px solid #e5e7eb;color:#111827;padding:12px 14px;border-radius:10px;font-family:'IBM Plex Sans',sans-serif;font-size:14px;outline:none;transition:border-color .15s ease,box-shadow .15s ease;}
        .tj-input:focus{border-color:#F7931A;box-shadow:0 0 0 3px rgba(247,147,26,.12);}
        .tj-input::placeholder{color:#d1d5db;}
        .tj-label{font-size:11px;color:#9ca3af;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;display:block;font-weight:500;}
        .field{margin-bottom:20px;}
        .btn-primary{width:100%;padding:15px;background:#F7931A;color:white;border:none;border-radius:12px;font-family:'IBM Plex Sans',sans-serif;font-size:15px;font-weight:600;cursor:pointer;transition:all .15s ease;display:flex;align-items:center;justify-content:center;gap:8px;box-shadow:0 4px 16px rgba(247,147,26,.35);}
        .btn-primary:hover:not(:disabled){background:#e8840f;transform:translateY(-1px);}
        .btn-primary:disabled{opacity:.55;cursor:not-allowed;box-shadow:none;}
        .nav-link{font-size:13px;color:#9ca3af;font-weight:500;padding:6px 12px;border-radius:8px;transition:all .13s ease;cursor:pointer;background:none;border:none;font-family:'IBM Plex Sans',sans-serif;}
        .nav-link:hover{color:#F7931A;background:#fff7ed;}
        .error-box{padding:12px 14px;background:#fef2f2;border:1.5px solid #fecaca;border-radius:10px;font-size:13px;color:#b91c1c;line-height:1.5;margin-bottom:20px;}
        .bg-dots{position:fixed;inset:0;pointer-events:none;background-image:radial-gradient(circle,#f0901820 1px,transparent 1px);background-size:28px 28px;opacity:.5;}
      `}</style>

      <div className="bg-dots" />

      <div className={`contact-wrap ${mounted ? "in" : ""}`} style={{ position:"relative", zIndex:1 }}>

        {/* Nav */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 0 32px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <BitcoinLogo size={28} />
            <span style={{ fontSize:16, fontWeight:700, color:"#111827", letterSpacing:"-0.02em" }}>TipBits</span>
          </div>
          <button className="nav-link" onClick={() => navigate('/')}>← Back</button>
        </div>

        {!submitted ? (
          <>
            <div style={{ marginBottom:32 }}>
              <div style={{ fontSize:11, fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:"#F7931A", marginBottom:8 }}>Get in touch</div>
              <h1 style={{ fontSize:28, fontWeight:700, color:"#111827", letterSpacing:"-0.02em", lineHeight:1.2, marginBottom:12 }}>Contact TipBits</h1>
              <p style={{ fontSize:14, color:"#6b7280", lineHeight:1.7 }}>
                Questions, feedback, or issues with your page? Drop a message below.
              </p>
            </div>

            <div style={{ background:"white", border:"1.5px solid #e5e7eb", borderRadius:16, padding:"28px 24px", boxShadow:"0 4px 32px rgba(0,0,0,.06)" }}>
              {error && <div className="error-box">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="tj-label">Your name</label>
                  <input className="tj-input" type="text" placeholder="Satoshi" value={name} onChange={e => setName(e.target.value)} maxLength={60} />
                </div>
                <div className="field">
                  <label className="tj-label">Email (optional)</label>
                  <input className="tj-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} maxLength={200} />
                  <div style={{ marginTop:6, fontSize:12, color:"#9ca3af" }}>Only if you'd like a reply. We don't store or share it.</div>
                </div>
                <div className="field">
                  <label className="tj-label">Subject</label>
                  <input className="tj-input" type="text" placeholder="e.g. Issue with my page" value={subject} onChange={e => setSubject(e.target.value)} maxLength={100} />
                </div>
                <div className="field" style={{ marginBottom:28 }}>
                  <label className="tj-label">Message</label>
                  <textarea className="tj-input" placeholder="Tell us what's on your mind..." value={message} onChange={e => setMessage(e.target.value)} maxLength={1000} rows={5} style={{ resize:"vertical", lineHeight:1.6 }} />
                </div>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Sending..." : "⚡ Send message"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div style={{ textAlign:"center", paddingTop:40 }}>
            <div style={{ fontSize:56, marginBottom:20 }}>⚡</div>
            <h1 style={{ fontSize:26, fontWeight:700, color:"#111827", marginBottom:8 }}>Message received</h1>
            <p style={{ fontSize:14, color:"#6b7280", marginBottom:32, lineHeight:1.6 }}>
              Thanks for reaching out. We'll get back to you if you left an email.
            </p>
            <button className="btn-primary" onClick={() => navigate('/')}>← Back to TipBits</button>
          </div>
        )}
      </div>
    </div>
  );
}
