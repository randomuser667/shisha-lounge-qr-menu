import { createServerFn } from "@tanstack/react-start";

import { isAdmin, isAdminConfigured, login, logout, type LoginResult } from "./admin-auth.server";
import { loadCatalog, loadPublicCatalog, saveCatalog, type SaveResult } from "./menu-store.server";
import type { Category } from "./menu";

// Expected failures (wrong password, expired session, ...) are returned as
// values instead of thrown, so they never reach the global 500 error page.
const UNAUTHORIZED = { ok: false, error: "unauthorized" } as const;

export type AdminMenuResult =
  | { ok: true; menu: Category[]; stored: boolean }
  | { ok: false; error: string };

export const getPublicMenu = createServerFn({ method: "GET" }).handler(
  async (): Promise<Category[]> => loadPublicCatalog(),
);

export const adminSession = createServerFn({ method: "GET" }).handler(
  async (): Promise<{ configured: boolean; authed: boolean }> => ({
    configured: isAdminConfigured(),
    authed: await isAdmin(),
  }),
);

export const adminLogin = createServerFn({ method: "POST" })
  .validator((data: { username: string; password: string }) => data)
  .handler(async ({ data }): Promise<LoginResult> => login(data?.username, data?.password));

export const adminLogout = createServerFn({ method: "POST" }).handler(
  async (): Promise<{ ok: true }> => {
    logout();
    return { ok: true };
  },
);

export const adminGetMenu = createServerFn({ method: "GET" }).handler(
  async (): Promise<AdminMenuResult> => {
    if (!(await isAdmin())) return UNAUTHORIZED;
    try {
      const { menu, stored } = await loadCatalog();
      return { ok: true, menu, stored };
    } catch (error) {
      console.error(error);
      return { ok: false, error: "Az étlap betöltése nem sikerült." };
    }
  },
);

export const adminSaveMenu = createServerFn({ method: "POST" })
  .validator((data: { menu: Category[]; baseRev: string }) => data)
  .handler(async ({ data }): Promise<SaveResult> => {
    if (!(await isAdmin())) return UNAUTHORIZED;
    try {
      return await saveCatalog(data?.menu, data?.baseRev);
    } catch (error) {
      console.error(error);
      return { ok: false, error: "A mentés nem sikerült, próbáld újra." };
    }
  });
