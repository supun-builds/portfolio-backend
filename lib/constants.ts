export const ADMIN_PRIVILEGES = [
  "projects:add", "projects:edit", "projects:delete", "projects:read",
  "technologies:add", "technologies:edit", "technologies:delete",
  "profile:edit",
  "files:upload",
  "messages:read", "messages:edit", "messages:delete",
] as const;

export type Privilege = (typeof ADMIN_PRIVILEGES)[number];

export const COOKIE_NAME = "login-token";
export const TOKEN_TTL_SECONDS = 60 * 60 * 24 * 7; // 1 week
