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

const permissions = z.array(z.enum(["CREATE_QUIZ","EDIT_QUIZ","DELETE_QUIZ","START_QUIZ","END_QUIZ","VIEW_RESULTS","VIEW_ANALYTICS"])).max(20);

router.get("/", async (_req, res, next) => {
  try {
    const staff = await prisma.user.findMany({
      where: { role: "STAFF" },
      orderBy: { createdAt: "desc" },
      select: { id: true, fullName: true, username: true, email: true, department: true, isActive: true, createdAt: true, permissions: { select: { permission: true } } }
    });
    res.json({ staff: staff.map(s => ({ ...s, permissions: s.permissions.map(p => p.permission) })) });
  } catch (e) { next(e); }
});

router.post("/", validate(z.object({
  fullName: z.string().min(2).max(120),
  username: z.string().min(3).max(80),
  password: z.string().min(8).max(200),
  email: z.string().email().optional(),
  department: z.string().max(120).optional(),
  permissions
})), async (req: AuthRequest, res, next) => {
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 12);
    const staff = await prisma.user.create({
      data: {
        fullName: req.body.fullName,
        username: req.body.username,
        passwordHash,
        email: req.body.email,
        department: req.body.department,
        role: "STAFF",
        permissions: { create: req.body.permissions.map((permission: string) => ({ permission: permission as never })) }
      },
      include: { permissions: true }
    });
    await logActivity(req, "CREATE_STAFF", "User", staff.id, { permissions: req.body.permissions });
    res.status(201).json({ staff: { id: staff.id, fullName: staff.fullName, username: staff.username, permissions: staff.permissions.map(p => p.permission) } });
  } catch (e) { next(e); }
});

router.get("/:id", async (req, res, next) => {
  try {
    const staff = await prisma.user.findFirst({ where: { id: req.params.id, role: "STAFF" }, select: { id: true, fullName: true, username: true, email: true, department: true, isActive: true, permissions: { select: { permission: true } } } });
    if (!staff) throw new AppError(404, "Staff member not found.");
    res.json({ staff: { ...staff, permissions: staff.permissions.map(p => p.permission) } });
  } catch (e) { next(e); }
});

router.patch("/:id/permissions", async (req: AuthRequest, res, next) => {
  try {
    if (req.params.id === req.auth!.id) throw new AppError(400, "Super Admins cannot edit their own staff permissions.");
    const target = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!target || target.role !== "STAFF") throw new AppError(404, "Staff member not found.");
    const parsed = permissions.parse(req.body.permissions);
    await prisma.$transaction([
      prisma.userPermission.deleteMany({ where: { userId: target.id } }),
      prisma.userPermission.createMany({ data: parsed.map(permission => ({ userId: target.id, permission: permission as never })) })
    ]);
    await logActivity(req, "CHANGE_PERMISSION", "User", target.id, { permissions: parsed });
    res.json({ ok: true, permissions: parsed });
  } catch (e) { next(e); }
});

router.patch("/:id", async (req: AuthRequest, res, next) => {
  try {
    const data = z.object({ fullName: z.string().min(2).max(120).optional(), email: z.string().email().optional().nullable(), department: z.string().max(120).optional().nullable(), isActive: z.boolean().optional() }).parse(req.body);
    const target = await prisma.user.findFirst({ where: { id: req.params.id, role: "STAFF" } });
    if (!target) throw new AppError(404, "Staff member not found.");
    const staff = await prisma.user.update({ where: { id: target.id }, data, select: { id: true, fullName: true, username: true, email: true, department: true, isActive: true } });
    await logActivity(req, "EDIT_STAFF", "User", staff.id);
    res.json({ staff });
  } catch (e) { next(e); }
});

router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const target = await prisma.user.findFirst({ where: { id: req.params.id, role: "STAFF" } });
    if (!target) throw new AppError(404, "Staff member not found.");
    await prisma.user.update({ where: { id: target.id }, data: { isActive: false } });
    await logActivity(req, "DELETE_STAFF", "User", target.id);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
