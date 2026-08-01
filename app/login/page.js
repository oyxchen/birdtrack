"use client";

import { useState } from "react";

export default function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(e) {
    e.preventDefault(); setLoading(true); setError("");
    const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    const data = await response.json();
    if (response.ok) window.location.href = "/";
    else { setError(data.error || "Unable to sign in."); setLoading(false); }
  }
  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-mark">◖</div>
        <p className="eyebrow">WELCOME TO</p>
        <h1>BirdTrack</h1>
        <p>Your private place for sightings, stories, and bird discoveries.</p>
        <form onSubmit={submit}>
          <label>BirdTrack password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus required placeholder="Enter password" /></label>
          {error && <p className="login-error" role="alert">{error}</p>}
          <button disabled={loading}>{loading ? "Opening…" : "Enter BirdTrack →"}</button>
        </form>
      </section>
    </main>
  );
}
