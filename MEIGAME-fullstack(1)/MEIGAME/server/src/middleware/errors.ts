import {Request,Response,NextFunction} from 'express';
export function notFound(_req:Request,res:Response){res.status(404).json({success:false,message:'Resource not found.'})}
export function errorHandler(err:any,_req:Request,res:Response,_next:NextFunction){console.error(err); if(res.headersSent)return; res.status(err?.statusCode||500).json({success:false,message:err?.message||'Internal server error.'})}
