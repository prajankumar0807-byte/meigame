import type { Role, Permission } from "@prisma/client";
import type { Request } from "express";

export type AuthUser = {
  id: string;
  username: string;
  role: Role;
  permissions: Permission[];
};

export type AuthRequest = Request & { auth?: AuthUser };
