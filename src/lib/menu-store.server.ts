// Server-only: the editable menu lives in Netlify Blobs as one JSON document.
// Until the first admin save nothing is stored and the hard-coded menu in
// menu.ts is served, so the site works exactly as before.
import { getStore } from "@netlify/blobs";

import { menu as staticMenu, withIds, type Category } from "./menu";
import { revOf, sanitizeCatalog } from "./menu-edit";

const KEY = "catalog-v1";

// Deploy previews get their own store so testing never touches the live menu.
function store() {
  const ctx = process.env.CONTEXT;
  const name = !ctx || ctx === "production" ? "menu" : "menu-preview";
  return getStore({ name, consistency: "strong" });
}

export async function loadCatalog(): Promise<{ menu: Category[]; stored: boolean }> {
  const raw = await store().get(KEY, { type: "json" });
  const stored = sanitizeCatalog(raw);
  if (stored) return { menu: stored, stored: true };
  return { menu: withIds(staticMenu), stored: false };
}

// Public pages: never fail, fall back to the hard-coded menu.
export async function loadPublicCatalog(): Promise<Category[]> {
  try {
    return (await loadCatalog()).menu;
  } catch (error) {
    console.error("menu store read failed, serving static menu", error);
    return withIds(staticMenu);
  }
}

export type SaveResult =
  | { ok: true; menu: Category[] }
  | { ok: false; error: string; conflict?: boolean };

// The only way the live menu changes: the admin presses "Mentés".
// baseRev is the revision of the menu the admin page started from; if the stored
// menu has changed since (another device saved), nothing is overwritten.
export async function saveCatalog(raw: unknown, baseRev: unknown): Promise<SaveResult> {
  const clean = sanitizeCatalog(raw);
  if (!clean) return { ok: false, error: "Érvénytelen étlap, a mentés nem történt meg." };

  const current = (await loadCatalog()).menu;
  if (typeof baseRev !== "string" || baseRev !== revOf(current)) {
    return {
      ok: false,
      conflict: true,
      error:
        "Közben máshol módosították az étlapot, ezért a mentés nem történt meg. Töltsd újra az oldalt (a nem mentett módosítások elvesznek).",
    };
  }
  await store().setJSON(KEY, clean);
  return { ok: true, menu: clean };
}
