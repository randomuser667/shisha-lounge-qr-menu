// Server-only: the editable menu lives in Netlify Blobs as one JSON document.
// Until the first admin save nothing is stored and the hard-coded menu in
// menu.ts is served, so the site works exactly as before.
import { getStore } from "@netlify/blobs";

import { menu as staticMenu, withIds, type Category, type MenuItem } from "./menu";

const KEY = "catalog-v1";

// Deploy previews get their own store so testing never touches the live menu.
function store() {
  const ctx = process.env.CONTEXT;
  const name = !ctx || ctx === "production" ? "menu" : "menu-preview";
  return getStore({ name, consistency: "strong" });
}

// ---------- sanitizing (never trust what comes from the client) ----------

const text = (v: unknown, max = 160): string =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

const pair = (hu: unknown, en: unknown, max = 160) => {
  const h = text(hu, max);
  const e = text(en, max);
  if (!h && !e) return undefined;
  return { hu: h || e, en: e || h };
};

const intOrUndef = (v: unknown, max: number): number | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.min(Math.round(n), max);
};

export type ItemInput = {
  id?: string;
  nameHu?: string;
  nameEn?: string;
  descHu?: string;
  descEn?: string;
  groupHu?: string;
  groupEn?: string;
  price?: number | null;
  stock?: number | null;
  soldOut?: boolean;
};

export type ItemPatch = {
  soldOut?: boolean;
  stock?: number | null;
  price?: number | null;
};

function newId(categoryId: string): string {
  return `${categoryId}-${crypto.randomUUID().slice(0, 8)}`;
}

function sanitizeItem(raw: unknown, categoryId: string, index: number): MenuItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, any>;
  const name = pair(r.name?.hu, r.name?.en);
  if (!name) return null;
  const item: MenuItem = {
    id: text(r.id, 64) || `${categoryId}-${index + 1}`,
    name,
  };
  const desc = pair(r.desc?.hu, r.desc?.en, 400);
  if (desc) item.desc = desc;
  const group = pair(r.group?.hu, r.group?.en);
  if (group) item.group = group;
  const price = intOrUndef(r.price, 1_000_000);
  if (price !== undefined) item.price = price;
  const stock = intOrUndef(r.stock, 100_000);
  if (stock !== undefined) item.stock = stock;
  if (r.soldOut === true) item.soldOut = true;
  return item;
}

function sanitizeCatalog(raw: unknown): Category[] | null {
  if (!Array.isArray(raw)) return null;
  const out: Category[] = [];
  for (const c of raw) {
    if (!c || typeof c !== "object") return null;
    const id = text((c as any).id, 40);
    const title = pair((c as any).title?.hu, (c as any).title?.en, 80);
    if (!id || !title || !Array.isArray((c as any).items)) return null;
    const items = (c as any).items
      .map((it: unknown, i: number) => sanitizeItem(it, id, i))
      .filter((it: MenuItem | null): it is MenuItem => it !== null);
    out.push({ id, title, items });
  }
  return out.length ? out : null;
}

// ---------- reading ----------

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

async function write(cats: Category[]): Promise<Category[]> {
  await store().setJSON(KEY, cats);
  return cats;
}

// ---------- editing ----------

export type EditResult = { ok: true; menu: Category[] } | { ok: false; error: string };

export async function upsertItem(categoryId: string, input: ItemInput): Promise<EditResult> {
  const { menu } = await loadCatalog();
  const cat = menu.find((c) => c.id === categoryId);
  if (!cat) return { ok: false, error: "Ismeretlen kategória." };

  const name = pair(input.nameHu, input.nameEn);
  if (!name) return { ok: false, error: "A termék nevét meg kell adni." };

  const built: MenuItem = { name };
  const desc = pair(input.descHu, input.descEn, 400);
  if (desc) built.desc = desc;
  const price = intOrUndef(input.price, 1_000_000);
  if (price !== undefined) built.price = price;
  const stock = intOrUndef(input.stock, 100_000);
  if (stock !== undefined) built.stock = stock;
  if (input.soldOut === true) built.soldOut = true;

  // The section heading comes straight from the form (prefilled with the current one; empty removes it).
  const group = pair(input.groupHu, input.groupEn);

  const id = text(input.id, 64);
  if (id) {
    const idx = cat.items.findIndex((i) => i.id === id);
    if (idx === -1) return { ok: false, error: "A termék nem található (közben törölték?)." };
    const next: MenuItem = { ...built, id };
    if (group) next.group = group;
    cat.items[idx] = next;
  } else {
    const next: MenuItem = { ...built, id: newId(categoryId) };
    if (group) next.group = group;
    cat.items.push(next);
  }
  return { ok: true, menu: await write(menu) };
}

export async function patchItem(
  categoryId: string,
  itemId: string,
  patch: ItemPatch,
): Promise<EditResult> {
  const { menu } = await loadCatalog();
  const cat = menu.find((c) => c.id === categoryId);
  const idx = cat ? cat.items.findIndex((i) => i.id === itemId) : -1;
  if (!cat || idx === -1) return { ok: false, error: "A termék nem található." };

  const item = { ...cat.items[idx] };
  if (patch.soldOut !== undefined) {
    if (patch.soldOut) item.soldOut = true;
    else delete item.soldOut;
  }
  if ("stock" in patch) {
    const stock = intOrUndef(patch.stock, 100_000);
    if (stock === undefined) delete item.stock;
    else item.stock = stock;
  }
  if ("price" in patch) {
    const price = intOrUndef(patch.price, 1_000_000);
    if (price === undefined) delete item.price;
    else item.price = price;
  }
  cat.items[idx] = item;
  return { ok: true, menu: await write(menu) };
}

export async function deleteItem(categoryId: string, itemId: string): Promise<EditResult> {
  const { menu } = await loadCatalog();
  const cat = menu.find((c) => c.id === categoryId);
  const idx = cat ? cat.items.findIndex((i) => i.id === itemId) : -1;
  if (!cat || idx === -1) return { ok: false, error: "A termék nem található." };

  const [removed] = cat.items.splice(idx, 1);
  // Do not lose the section heading that sat on the removed item.
  const next = cat.items[idx];
  if (removed.group && next && !next.group) next.group = removed.group;
  return { ok: true, menu: await write(menu) };
}

// Swaps two neighbours but leaves section headings in their slots, so the layout stays intact.
export async function moveItem(
  categoryId: string,
  itemId: string,
  dir: -1 | 1,
): Promise<EditResult> {
  const { menu } = await loadCatalog();
  const cat = menu.find((c) => c.id === categoryId);
  const idx = cat ? cat.items.findIndex((i) => i.id === itemId) : -1;
  if (!cat || idx === -1) return { ok: false, error: "A termék nem található." };

  const to = idx + dir;
  if (to < 0 || to >= cat.items.length) return { ok: true, menu };

  const a = cat.items[idx];
  const b = cat.items[to];
  const aGroup = a.group;
  const bGroup = b.group;
  const na: MenuItem = { ...a };
  const nb: MenuItem = { ...b };
  delete na.group;
  delete nb.group;
  if (bGroup) na.group = bGroup;
  if (aGroup) nb.group = aGroup;
  cat.items[idx] = nb;
  cat.items[to] = na;
  return { ok: true, menu: await write(menu) };
}
