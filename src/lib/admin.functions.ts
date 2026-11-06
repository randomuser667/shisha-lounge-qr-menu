import { createServerFn } from "@tanstack/react-start";

import { isAdmin, isAdminConfigured, login, logout, type LoginResult } from "./admin-auth.server";
import {
  deleteItem,
  loadCatalog,
  loadPublicCatalog,
  moveItem,
  patchItem,
  upsertItem,
  type EditResult,
  type ItemInput,
  type ItemPatch,
} from "./menu-store.server";
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

async function guarded(run: () => Promise<EditResult>): Promise<EditResult> {
  if (!(await isAdmin())) return UNAUTHORIZED;
  try {
    return await run();
  } catch (error) {
    console.error(error);
    return { ok: false, error: "A mentés nem sikerült, próbáld újra." };
  }
}

export const adminSaveItem = createServerFn({ method: "POST" })
  .validator((data: { categoryId: string; item: ItemInput }) => data)
  .handler(async ({ data }): Promise<EditResult> =>
    guarded(() => upsertItem(String(data?.categoryId ?? ""), data?.item ?? {})),
  );

export const adminPatchItem = createServerFn({ method: "POST" })
  .validator((data: { categoryId: string; itemId: string; patch: ItemPatch }) => data)
  .handler(async ({ data }): Promise<EditResult> =>
    guarded(() =>
      patchItem(String(data?.categoryId ?? ""), String(data?.itemId ?? ""), data?.patch ?? {}),
    ),
  );

export const adminDeleteItem = createServerFn({ method: "POST" })
  .validator((data: { categoryId: string; itemId: string }) => data)
  .handler(async ({ data }): Promise<EditResult> =>
    guarded(() => deleteItem(String(data?.categoryId ?? ""), String(data?.itemId ?? ""))),
  );

export const adminMoveItem = createServerFn({ method: "POST" })
  .validator((data: { categoryId: string; itemId: string; dir: 1 | -1 }) => data)
  .handler(async ({ data }): Promise<EditResult> =>
    guarded(() =>
      moveItem(String(data?.categoryId ?? ""), String(data?.itemId ?? ""), data?.dir === -1 ? -1 : 1),
    ),
  );
