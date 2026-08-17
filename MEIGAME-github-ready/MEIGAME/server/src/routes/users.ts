import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { prisma } from "../db.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { validate } from "../middleware/validation.js";
import { AppError } from "../utils/errors.js";
import { logActivity } from "../services/activity.js";
import type { AuthRequest } from "../types.js";

const router = Router();
router.use(requireAuth, requireRole("SUPER_ADMIN"));

const createSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  username: z.string().trim().min(3).max(80),
  password: z.string().min(8).max(200),
  collegeId: z.string().trim().max(80).optional(),
  department: z.string().trim().max(120).optional(),
  year: z.string().trim().max(20).optional(),
  section: z.string().trim().max(20).optional(),
  email: z.string().email().optional(),
  phone: z.string().trim().max(30).optional()
});

router.get("/", async (_req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, username: true, collegeId: true, department: true, year: true, section: true, email: true, phone: true, role: true, isActive: true, createdAt: true, lastLoginAt: true }
    });
    res.json({ users });
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, fullName: true, username: true, collegeId: true, department: true, year: true, section: true, email: true, phone: true, role: true, isActive: true, createdAt: true, updatedAt: true, lastLoginAt: true }
    });
    if (!user) throw new AppError(404, "User not found.");
    res.json({ user });
  } catch (e) { next(e); }
});

router.post("/", validate(createSchema), async (req: AuthRequest, res, next) => {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const { password: _password, ...profile } = req.body;
    const user = await prisma.user.create({ data: { ...profile, passwordHash, role: "USER" } });
    await logActivity(req, "CREATE_USER", "User", user.id);
    res.status(201).json({ user: { id: user.id, fullName: user.fullName, username: user.username, role: user.role } });
  } catch (e) { next(e); }
});

router.patch("/:id/status", async (req: AuthRequest, res, next) => {
  try {
    if (req.params.id === req.auth!.id) throw new AppError(400, "You cannot disable your own account.");
    const active = z.boolean().parse(req.body.isActive);
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: active }, select: { id: true, isActive: true } });
    await logActivity(req, active ? "ENABLE_USER" : "DISABLE_USER", "User", user.id);
    res.json({ user });
  } catch (e) { next(e); }
});

router.patch("/:id", async (req: AuthRequest, res, next) => {
  try {
    if ("role" in req.body) throw new AppError(403, "Role changes are not allowed through the user profile endpoint.");
    const data = z.object({ fullName: z.string().min(2).max(120).optional(), email: z.string().email().optional().nullable(), phone: z.string().max(30).optional().nullable(), department: z.string().max(120).optional().nullable(), year: z.string().max(20).optional().nullable(), section: z.string().max(20).optional().nullable(), collegeId: z.string().max(80).optional().nullable() }).parse(req.body);
    const user = await prisma.user.update({ where: { id: req.params.id }, data, select: { id: true, fullName: true, username: true, role: true, email: true, phone: true, department: true, year: true, section: true, collegeId: true } });
    await logActivity(req, "EDIT_USER", "User", user.id);
    res.json({ user });
  } catch (e) { next(e); }
});

router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    if (req.params.id === req.auth!.id) throw new AppError(400, "You cannot delete your own account.");
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target) throw new AppError(404, "User not found.");
    if (target.role === "SUPER_ADMIN") throw new AppError(403, "Super Admin accounts cannot be deleted here.");
    await prisma.user.update({ where: { id: req.params.id }, data: { isActive: false } });
    await logActivity(req, "DELETE_USER", "User", req.params.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
