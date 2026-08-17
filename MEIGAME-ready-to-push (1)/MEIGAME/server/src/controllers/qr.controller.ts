import {Request,Response} from 'express'; import QRCode from 'qrcode'; import {env} from '../config/env.js';
export async function qr(req:Request,res:Response){const url=`${env.CLIENT_URL}/join/${encodeURIComponent(req.params.joinCode)}`;const data=await QRCode.toDataURL(url,{width:512,margin:2});res.json({success:true,url,data})}
