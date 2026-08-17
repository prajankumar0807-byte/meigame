import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";

type Q = { questionText: string; questionType: "MULTIPLE_CHOICE"|"TRUE_FALSE"; points: number; timeLimit: number; order: number; options: { optionText: string; isCorrect: boolean; order: number }[] };

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [title,setTitle]=useState(""); const [subject,setSubject]=useState(""); const [difficulty,setDifficulty]=useState("MEDIUM"); const [error,setError]=useState("");
  const [questions,setQuestions]=useState<Q[]>([{questionText:"",questionType:"MULTIPLE_CHOICE",points:10,timeLimit:20,order:0,options:[{optionText:"",isCorrect:true,order:0},{optionText:"",isCorrect:false,order:1},{optionText:"",isCorrect:false,order:2},{optionText:"",isCorrect:false,order:3}]}]);
  const updateQ=(i:number,patch:Partial<Q>)=>setQuestions(q=>q.map((x,n)=>n===i?{...x,...patch}:x));
  const updateO=(qi:number,oi:number,text:string)=>setQuestions(q=>q.map((x,n)=>n===qi?{...x,options:x.options.map((o,k)=>k===oi?{...o,optionText:text}:o)}:x));
  const submit=async()=>{setError(""); try{await api.createQuiz({title,subject,difficulty,leaderboardEnabled:true,resultVisibility:"AFTER_COMPLETION",questions});navigate("/admin/quizzes")}catch(e){setError(e instanceof Error?e.message:"Unable to create quiz.")}};
  return <div><div className="hero-row"><div><span className="eyebrow">QUIZ BUILDER</span><h1>Create quiz</h1><p>Build the quiz once. The server remains authoritative over answers and scores.</p></div></div>
    <div className="builder-grid"><section className="glass-card"><h3>Quiz details</h3><div className="form-grid"><label>Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="e.g. Python Fundamentals"/></label><label>Subject<input value={subject} onChange={e=>setSubject(e.target.value)} placeholder="Programming"/></label><label>Difficulty<select value={difficulty} onChange={e=>setDifficulty(e.target.value)}><option>EASY</option><option>MEDIUM</option><option>HARD</option></select></label></div></section>
    {questions.map((q,i)=><section className="glass-card question-builder" key={i}><div className="question-head"><span>QUESTION {String(i+1).padStart(2,"0")}</span><button className="ghost-btn" onClick={()=>setQuestions(x=>x.filter((_,n)=>n!==i).map((v,n)=>({...v,order:n})))}>Remove</button></div><label>Question<input value={q.questionText} onChange={e=>updateQ(i,{questionText:e.target.value})} placeholder="Enter question"/></label><div className="option-grid">{q.options.map((o,j)=><label key={j} className={o.isCorrect?"correct-option":""}><span>{String.fromCharCode(65+j)}</span><input value={o.optionText} onChange={e=>updateO(i,j,e.target.value)} placeholder={`Option ${j+1}`}/><input type="radio" name={`correct-${i}`} checked={o.isCorrect} onChange={()=>updateQ(i,{options:q.options.map((x,k)=>({...x,isCorrect:k===j}))})}/></label>)}</div></section>)}
    <button className="secondary-btn" onClick={()=>setQuestions(x=>[...x,{questionText:"",questionType:"MULTIPLE_CHOICE",points:10,timeLimit:20,order:x.length,options:[{optionText:"",isCorrect:true,order:0},{optionText:"",isCorrect:false,order:1},{optionText:"",isCorrect:false,order:2},{optionText:"",isCorrect:false,order:3}]}])}>+ Add question</button>
    {error&&<div className="error-box">{error}</div>}<button className="primary-btn full" onClick={submit}>Create and save quiz</button></div>
  </div>;
}
