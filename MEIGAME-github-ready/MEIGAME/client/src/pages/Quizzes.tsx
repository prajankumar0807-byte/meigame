import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Play, Plus, Radio, Square, UploadCloud } from "lucide-react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { GlassCard } from "../components/GlassCard";
import { useAuth } from "../context/AuthContext";

export default function Quizzes() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({ queryKey: ["quizzes"], queryFn: api.quizzes });
  const mutate = useMutation({ mutationFn: async ({ action, id }: { action: "publish"|"start"|"end"; id: string }) => action === "publish" ? api.publishQuiz(id) : action === "start" ? api.startQuiz(id) : api.endQuiz(id), onSuccess: () => qc.invalidateQueries({ queryKey: ["quizzes"] }) });
  if (isLoading) return <div>Loading quizzes…</div>;
  if (error) return <div className="error-box">{error instanceof Error ? error.message : "Unable to load quizzes."}</div>;
  const canManage = user?.role === "SUPER_ADMIN" || user?.permissions?.includes("CREATE_QUIZ");
  return <div>
    <div className="hero-row"><div><span className="eyebrow">QUIZ MANAGEMENT</span><h1>Quizzes</h1><p>Create, publish and run real database-backed quizzes.</p></div>{canManage && <Link to="/admin/quizzes/new" className="primary-btn"><Plus size={17}/> Create quiz</Link>}</div>
    <div className="quiz-grid">{data?.quizzes.map(q => <GlassCard key={q.id} className="quiz-card"><div className="quiz-top"><span className={`status ${q.status.toLowerCase()}`}>{q.status}</span><span className="difficulty">{q.difficulty}</span></div><h3>{q.title}</h3><p>{q.subject} · {q._count?.questions ?? q.questions?.length ?? 0} questions</p><div className="quiz-code">{q.joinCode}</div><div className="quiz-actions">{q.status === "DRAFT" && canManage && <button className="secondary-btn" onClick={() => mutate.mutate({action:"publish",id:q.id})}><UploadCloud size={16}/> Publish</button>}{q.status === "PUBLISHED" && (user?.role === "SUPER_ADMIN" || user?.permissions?.includes("START_QUIZ")) && <button className="primary-btn" onClick={() => mutate.mutate({action:"start",id:q.id})}><Play size={16}/> Start</button>}{q.status === "LIVE" && (user?.role === "SUPER_ADMIN" || user?.permissions?.includes("END_QUIZ")) && <button className="danger-btn" onClick={() => mutate.mutate({action:"end",id:q.id})}><Square size={15}/> End</button>}{q.status === "LIVE" && <span className="live-dot"><Radio size={15}/> LIVE</span>}</div></GlassCard>)}</div>
  </div>;
}
