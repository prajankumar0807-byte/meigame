const API=import.meta.env.VITE_API_URL||'http://localhost:5000/api';
export async function api<T>(path:string,options:RequestInit={}){const r=await fetch(API+path,{...options,credentials:'include',headers:{'Content-Type':'application/json',...(options.headers||{})}});const data=await r.json().catch(()=>({}));if(!r.ok)throw new Error(data.message||'Request failed');return data as T;}
