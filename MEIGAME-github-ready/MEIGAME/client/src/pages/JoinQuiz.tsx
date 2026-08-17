import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Logo } from "../components/Logo";
import { api } from "../api";

export default function JoinQuiz() {
  const [code,setCode]=useState(""); const [name,setName]=useState(""); const [collegeId,setCollegeId]=useState(""); const [error,setError]=useState(""); const navigate=useNavigate();
  return <div className="join-page"><div className="join-glow"/><section className="join-card"><Logo/><span className="eyebrow">PARTICIPANT MODE</span><h1>Join a live quiz.</h1><p>Enter the six-digit room code shared by your quiz host.</p><label>Room code<input className="code-input" inputMode="numeric" maxLength={6} value={code} onChange={e=>setCode(e.target.value.replace(/\D/g,""))} placeholder="000000"/></label><label>Your name<input value={name} onChange={e=>setName(e.target.value)} placeholder="Enter your display name"/></label><label>College ID <span className="muted">(optional)</span><input value={collegeId} onChange={e=>setCollegeId(e.target.value)} placeholder="e.g. MECIT2026"/></label>{error&&<div className="error-box">{error}</div>}<button className="primary-btn full" onClick={async()=>{setError("");try{const r=await api.join(code,{name,collegeId:collegeId||undefined});sessionStorage.setItem("participantId",r.participant.id);navigate(`/participant/${r.participant.id}`)}catch(e){setError(e instanceof Error?e.message:"Unable to join.")}}}>Enter quiz</button></section></div>;
}
