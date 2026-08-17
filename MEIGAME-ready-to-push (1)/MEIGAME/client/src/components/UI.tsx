import {ReactNode} from 'react'; import {motion} from 'framer-motion'; import {LoaderCircle} from 'lucide-react';
export function Button({children,onClick,type='button',variant='primary',disabled=false}:{children:ReactNode;onClick?:()=>void;type?:'button'|'submit';variant?:'primary'|'ghost'|'danger';disabled?:boolean}){return <button type={type} disabled={disabled} onClick={onClick} className={`btn ${variant}`} >{children}</button>}
export function Card({children,className=''}:{children:ReactNode;className?:string}){return <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className={`card ${className}`}>{children}</motion.div>}
export function Spinner(){return <LoaderCircle className="spin"/>}
