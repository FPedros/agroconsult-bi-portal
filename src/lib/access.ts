import type { AppUser } from "@/contexts/UserContext";

const SHARED_CLIENT_PATHS = new Set(["/app/relatorios"]);

const normalizePath = (pathname: string) => {
  if (!pathname) return "/";
  return pathname.length > 1 && pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
};

const isAllowedSectorPath = (pathname: string, sector: string) => {
  const basePath = `/app/setor/${sector}`;
  return pathname === basePath || pathname.startsWith(`${basePath}/`);
};

export const getUserDefaultSectorPath = (user: AppUser | null) => {
  if (!user) return "/app";
  return "/app";
};

export const canUserChooseSector = (user: AppUser | null) => {
  if (!user) return false;
  if (user.role === "admin") return true;
  return user.allowedSectors.length > 1;
};

export const canUserAccessPath = (user: AppUser | null, pathname: string) => {
  if (!user) return false;
  if (user.role === "admin") return true;

  const normalizedPath = normalizePath(pathname);
  if (normalizedPath === "/app") return true;
  if (SHARED_CLIENT_PATHS.has(normalizedPath)) return true;

  return user.allowedSectors.some((sector) => isAllowedSectorPath(normalizedPath, sector));
};

export const canUserManageSettings = (user: AppUser | null) => user?.role === "admin";
