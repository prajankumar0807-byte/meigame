import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api, type Question } from "../api";

export default function ParticipantQuiz() {
  const { id } = useParams(); const navigate=useNavigate(); const [data,setData]=useState<any>(); const [index,setIndex]=useState(0); const [started,setStarted]=useState(Date.now()); const [error,setError]=useState("");
  useEffect(()=>{if(!id)return;api.participant(id).then(setData).catch(e=>setError(e.message))},[id]);
  const q:Question|undefined=useMemo(()=>data?.quiz.questions[index],[data,index]);
  if(error)return <div className="center-screen"><div className="error-box">{error}</div></div>;
  if(!data||!q)return <div className="center-screen"><div className="loader-ring"/></div>;
  const answered=data.answers.some((a:any)=>a.questionId===q.id);
  const choose=async(optionId:string)=>{if(answered)return;try{await api.answer(id!,{questionId:q.id,selectedOptionId:optionId,responseTime:Math.floor((Date.now()-started)/1000)});const next= index+1; if(next<data.quiz.questions.length){setData(await api.participant(id!));setIndex(next);setStarted(Date.now())}else{const r=await api.complete(id!);navigate(`/participant/${id}/result`,{state:r.result})}}catch(e){setError(e instanceof Error?e.message:"Answer failed.")}};
  return <div className="participant-page"><header className="participant-top"><img src="/logo/meigame-logo.png" alt="MEIGAME"/><span>{index+1} / {data.quiz.questions.length}</span></header><main className="question-stage"><div className="question-meta"><span>QUESTION {String(index+1).padStart(2,"0")}</span><span>{q.points} POINTS</span></div><h1>{q.questionText}</h1><div className="answer-grid">{q.options.map((o,j)=><button key={o.id} className="answer-btn" disabled={answered} onClick={()=>choose(o.id)}><b>{String.fromCharCode(65+j)}</b>{o.optionText}</button>)}</div><div className="participant-footer"><span>{data.participant.name}</span><span>{q.timeLimit ? `Time limit ${q.timeLimit}s` : "Answer when ready"}</span></div></main></div>;
}
