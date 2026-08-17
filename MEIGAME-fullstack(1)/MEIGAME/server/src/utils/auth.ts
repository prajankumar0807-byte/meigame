import jwt from 'jsonwebtoken'; import {env} from '../config/env.js';
export type AuthPayload={sub:string;role:string};
export function signToken(payload:AuthPayload){return jwt.sign(payload,env.JWT_SECRET,{expiresIn:'8h'});}
export function verifyToken(token:string){return jwt.verify(token,env.JWT_SECRET) as AuthPayload;}
