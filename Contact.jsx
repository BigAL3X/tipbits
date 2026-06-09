import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./global.css";
import "./Contact.css";

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
    <div className="page-root">
      <div className="bg-dots" />

      <div className={`contact-wrap ${mounted ? "in" : ""}`}>

        {/* Nav */}
        <div className="contact-nav">
          <div className="contact-nav-brand">
            <BitcoinLogo size={28} />
            <span className="contact-nav-brand-text">TipBits</span>
          </div>
          <button className="nav-link" onClick={() => navigate('/')}>← Back</button>
        </div>

        {!submitted ? (
          <>
            <div className="contact-hero">
              <div className="contact-hero-eyebrow">Get in touch</div>
              <h1 className="contact-hero-h1">Contact TipBits</h1>
              <p className="contact-hero-p">
                Questions, feedback, or issues with your page? Drop a message below.
              </p>
            </div>

            <div className="contact-card">
              {error && <div className="error-box">{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className="field">
                  <label className="tj-label">Your name</label>
                  <input className="tj-input" type="text" placeholder="Satoshi" value={name} onChange={e => setName(e.target.value)} maxLength={60} />
                </div>
                <div className="field">
                  <label className="tj-label">Email (optional)</label>
                  <input className="tj-input" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} maxLength={200} />
                  <div className="contact-email-hint">Only if you'd like a reply. We don't store or share it.</div>
                </div>
                <div className="field">
                  <label className="tj-label">Subject</label>
                  <input className="tj-input" type="text" placeholder="e.g. Issue with my page" value={subject} onChange={e => setSubject(e.target.value)} maxLength={100} />
                </div>
                <div className="field" style={{ marginBottom: 28 }}>
                  <label className="tj-label">Message</label>
                  <textarea className="tj-input tj-input--resize-vertical" placeholder="Tell us what's on your mind..." value={message} onChange={e => setMessage(e.target.value)} maxLength={1000} rows={5} />
                </div>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Sending..." : "⚡ Send message"}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="contact-success">
            <div className="contact-success-icon">⚡</div>
            <h1 className="contact-success-h1">Message received</h1>
            <p className="contact-success-p">
              Thanks for reaching out. We'll get back to you if you left an email.
            </p>
            <button className="btn-primary" onClick={() => navigate('/')}>← Back to TipBits</button>
          </div>
        )}
      </div>
    </div>
  );
}
