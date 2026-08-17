import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { LockKeyhole, UserRound } from "lucide-react";
import { Logo } from "../components/Logo";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  if (user) return <Navigate to="/dashboard" replace />;
  return <div className="login-page">
    <div className="login-orb orb-one"/><div className="login-orb orb-two"/>
    <section className="login-card">
      <Logo />
      <span className="eyebrow">PRIVATE COLLEGE QUIZ PLATFORM</span>
      <h1>Play. Learn. Win.</h1>
      <p>Secure live quizzes for Mahendra Engineering College.</p>
      <form onSubmit={async e => { e.preventDefault(); setError(""); try { await login(username, password); navigate("/dashboard"); } catch (e) { setError(e instanceof Error ? e.message : "Login failed."); } }}>
        <label>Username<div className="input-wrap"><UserRound size={18}/><input value={username} onChange={e => setUsername(e.target.value)} autoComplete="username" placeholder="Enter username"/></div></label>
        <label>Password<div className="input-wrap"><LockKeyhole size={18}/><input value={password} onChange={e => setPassword(e.target.value)} type="password" autoComplete="current-password" placeholder="Enter password"/></div></label>
        {error && <div className="error-box">{error}</div>}
        <button className="primary-btn full" type="submit">Sign in to MEIGAME</button>
      </form>
      <small className="muted">Administrator access is restricted to authorized college staff.</small>
    </section>
  </div>;
}
