import jwt from "jsonwebtoken";
import type { Response } from "express";
import { config } from "../config.js";
import type { AuthUser } from "../types.js";

const COOKIE = "meigame_session";

export function signToken(user: AuthUser) {
  return jwt.sign(user, config.jwtSecret, { expiresIn: "8h" });
}

export function setAuthCookie(res: Response, user: AuthUser) {
  res.cookie(COOKIE, signToken(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: config.cookieSecure,
    maxAge: 8 * 60 * 60 * 1000
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(COOKIE, { httpOnly: true, sameSite: "lax", secure: config.cookieSecure });
}

export function verifyToken(token: string): AuthUser {
  return jwt.verify(token, config.jwtSecret) as AuthUser;
}

export { COOKIE };
