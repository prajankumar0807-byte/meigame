import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../db.js";
import { validate } from "../middleware/validation.js";
import { clearAuthCookie, setAuthCookie } from "../utils/auth.js";
import { requireAuth } from "../middleware/auth.js";
import { logActivity } from "../services/activity.js";
import type { AuthRequest } from "../types.js";

const router = Router();
const loginSchema = z.object({
  username: z.string().trim().min(3).max(80),
  password: z.string().min(1).max(200)
});

router.post("/login", validate(loginSchema), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { username: req.body.username }, include: { permissions: true } });
    if (!user || !user.isActive || !(await bcrypt.compare(req.body.password, user.passwordHash))) {
      return res.status(401).json({ error: "Invalid username or password." });
    }
    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    const auth = { id: user.id, username: user.username, role: user.role, permissions: user.permissions.map(p => p.permission) };
    setAuthCookie(res, auth);
    const fakeReq = req as AuthRequest;
    fakeReq.auth = auth;
    await logActivity(fakeReq, "LOGIN", "User", user.id);
    res.json({ user: { id: user.id, fullName: user.fullName, username: user.username, role: user.role, permissions: auth.permissions } });
  } catch (e) { next(e); }
});

router.post("/logout", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await logActivity(req, "LOGOUT", "User", req.auth!.id);
    clearAuthCookie(res);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.get("/me", requireAuth, async (req: AuthRequest, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.auth!.id },
      select: { id: true, fullName: true, username: true, role: true, collegeId: true, department: true, year: true, section: true, email: true, phone: true, profilePhoto: true, permissions: { select: { permission: true } } }
    });
    res.json({ user: user ? { ...user, permissions: user.permissions.map(p => p.permission) } : null });
  } catch (e) { next(e); }
});

export default router;
