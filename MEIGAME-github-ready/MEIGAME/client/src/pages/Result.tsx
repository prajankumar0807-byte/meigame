import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { Trophy, Target, Clock3, CheckCircle2 } from "lucide-react";
import { api } from "../api";
import { Logo } from "../components/Logo";

export default function Result() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading, error } = useQuery({
    queryKey: ["participant-result", id],
    queryFn: async () => {
      const base = await api.participant(id!);
      const response = await fetch(`${import.meta.env.VITE_API_URL ?? "http://localhost:4000/api"}/participant/session/${id}/result`, { credentials: "include" });
      const json = await response.json();
      if (!response.ok) throw new Error(json.error ?? "Unable to load result.");
      return { ...json, participant: base.participant };
    },
    enabled: Boolean(id)
  });

  if (isLoading) return <div className="center-screen"><div className="loader-ring" /></div>;
  if (error || !data) return <div className="center-screen"><div className="error-box">{error instanceof Error ? error.message : "Result unavailable."}</div></div>;

  const result = data.result;
  return <div className="result-page">
    <Logo />
    <span className="eyebrow">QUIZ COMPLETE</span>
    <h1>Strong finish.</h1>
    <p>{data.participant.name}, your server-calculated result is ready.</p>
    <div className="result-hero">
      <div className="score-ring"><strong>{result.score}</strong><small>POINTS</small></div>
      <div><span className="eyebrow">RANK</span><h2>#{result.rank ?? "—"}</h2></div>
    </div>
    <div className="result-grid">
      <div><CheckCircle2/><b>{result.correctAnswers}</b><span>Correct</span></div>
      <div><Target/><b>{result.accuracy}%</b><span>Accuracy</span></div>
      <div><Clock3/><b>{result.timeTaken}s</b><span>Time</span></div>
      <div><Trophy/><b>{result.totalPoints}</b><span>Total points</span></div>
    </div>
    <button className="primary-btn" onClick={() => navigate("/join")}>Join another quiz</button>
  </div>;
}
