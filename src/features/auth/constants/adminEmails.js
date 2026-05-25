import { env } from "@/shared/config/env";

export const ADMIN_EMAILS = env.adminEmails;

export function isAdminEmail(email) {
  if (!email) return false;
  return ADMIN_EMAILS.includes(String(email).trim().toLowerCase());
}
