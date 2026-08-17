import { useQuery } from "@tanstack/react-query";
import { ArrowRight, BrainCircuit, Clock3, Trophy, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { GlassCard } from "../components/GlassCard";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const admin = user?.role === "SUPER_ADMIN";
  const analytics = useQuery({ queryKey: ["analytics"], queryFn: api.analytics, enabled: admin });
  const quizzes = useQuery({ queryKey: ["quizzes"], queryFn: api.quizzes });
  const stats = admin ? [
    ["Active Users", analytics.data?.overview.users ?? 0, Users], ["Quizzes", analytics.data?.overview.quizzes ?? 0, BrainCircuit], ["Results", analytics.data?.overview.results ?? 0, Trophy], ["Staff", analytics.data?.overview.staff ?? 0, Users]
  ] : [
    ["Available Quizzes", quizzes.data?.quizzes.filter(q => q.status !== "ARCHIVED").length ?? 0, BrainCircuit], ["Live", quizzes.data?.quizzes.filter(q => q.status === "LIVE").length ?? 0, Clock3]
  ];
  return <div>
    <div className="hero-row"><div><span className="eyebrow">WELCOME BACK</span><h1>{user?.fullName}</h1><p>Control the room, launch a quiz, and turn knowledge into competition.</p></div><Link className="primary-btn" to={admin ? "/admin/quizzes" : "/quizzes"}>Explore quizzes <ArrowRight size={17}/></Link></div>
    <div className="stats-grid">{stats.map(([label, value, Icon]) => <GlassCard key={label as string}><div className="stat-icon"><Icon size={21}/></div><small>{label as string}</small><strong>{value as number}</strong></GlassCard>)}</div>
    <div className="section-heading"><div><span className="eyebrow">RECENT ACTIVITY</span><h2>Quiz control center</h2></div></div>
    <div className="feature-grid">
      <GlassCard><div className="feature-number">01</div><h3>Build a quiz</h3><p>Create questions, points, timing, and publishing rules. The server owns the scoring logic.</p></GlassCard>
      <GlassCard><div className="feature-number">02</div><h3>Launch live</h3><p>Publish a quiz, generate a six-digit join code, and let participants enter from mobile.</p></GlassCard>
      <GlassCard><div className="feature-number">03</div><h3>Measure results</h3><p>Review score, accuracy, response time, rank, and participant activity.</p></GlassCard>
    </div>
  </div>;
}
