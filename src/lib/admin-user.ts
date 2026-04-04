import { Role } from "@prisma/client";

export const ADMIN_EMAIL = "ribermudezt@gmail.com";

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function isAdminEmail(email: string): boolean {
  return normalizeEmail(email) === ADMIN_EMAIL;
}

export function resolveRoleForEmail(
  email: string,
  role: Role,
): Role {
  return isAdminEmail(email) ? Role.ADMIN : role;
}
