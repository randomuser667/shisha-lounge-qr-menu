// Pure editing helpers shared by the admin page (draft editing in the browser)
// and the server (sanitizing before anything is stored). No server-only imports.
import type { Category, MenuItem } from "./menu";

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

export type EditResult = { ok: true; menu: Category[] } | { ok: false; error: string };

// ---------- sanitizing primitives ----------

export const text = (v: unknown, max = 160): string =>
  typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "";

export const pair = (hu: unknown, en: unknown, max = 160) => {
  const h = text(hu, max);
  const e = text(en, max);
  if (!h && !e) return undefined;
  return { hu: h || e, en: e || h };
};

export const intOrUndef = (v: unknown, max: number): number | undefined => {
  if (v === null || v === undefined || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return Math.min(Math.round(n), max);
};

export function newId(categoryId: string): string {
  const c = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;
  const rand = c?.randomUUID ? c.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${categoryId}-${rand}`;
}

// ---------- revision (detects that somebody else saved in the meantime) ----------

// Small deterministic 53-bit string hash (cyrb53): the admin page sends the revision
// of the menu it started from, the server refuses to overwrite a newer one.
// Keys are sorted first, so the same content always gives the same revision no matter
// in which order an object's keys were created.
const sortKeys = (_k: string, v: unknown) =>
  v && typeof v === "object" && !Array.isArray(v)
    ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)))
    : v;

export function revOf(menu: Category[]): string {
  const str = JSON.stringify(menu, sortKeys);
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36) + "-" + str.length.toString(36);
}

// ---------- immutable edits on a menu ----------

const NOT_FOUND = { ok: false, error: "A termék nem található." } as const;

function locate(menu: Category[], categoryId: string, itemId: string) {
  const ci = menu.findIndex((c) => c.id === categoryId);
  const ii = ci === -1 ? -1 : menu[ci].items.findIndex((i) => i.id === itemId);
  return { ci, ii };
}

function withItems(menu: Category[], ci: number, items: MenuItem[]): Category[] {
  return menu.map((c, i) => (i === ci ? { ...c, items } : c));
}

export function upsertItem(menu: Category[], categoryId: string, input: ItemInput): EditResult {
  const ci = menu.findIndex((c) => c.id === categoryId);
  if (ci === -1) return { ok: false, error: "Ismeretlen kategória." };

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
  if (group) built.group = group;

  const items = menu[ci].items;
  const id = text(input.id, 64);
  if (id) {
    const ii = items.findIndex((i) => i.id === id);
    if (ii === -1) return { ok: false, error: "A termék nem található (közben törölték?)." };
    return { ok: true, menu: withItems(menu, ci, items.map((it, i) => (i === ii ? { ...built, id } : it))) };
  }
  return { ok: true, menu: withItems(menu, ci, [...items, { ...built, id: newId(categoryId) }]) };
}

export function patchItem(
  menu: Category[],
  categoryId: string,
  itemId: string,
  patch: ItemPatch,
): EditResult {
  const { ci, ii } = locate(menu, categoryId, itemId);
  if (ii === -1) return NOT_FOUND;

  const item = { ...menu[ci].items[ii] };
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
  return { ok: true, menu: withItems(menu, ci, menu[ci].items.map((it, i) => (i === ii ? item : it))) };
}

export function deleteItem(menu: Category[], categoryId: string, itemId: string): EditResult {
  const { ci, ii } = locate(menu, categoryId, itemId);
  if (ii === -1) return NOT_FOUND;

  const items = menu[ci].items.map((it) => ({ ...it }));
  const [removed] = items.splice(ii, 1);
  // Do not lose the section heading that sat on the removed item.
  const next = items[ii];
  if (removed.group && next && !next.group) next.group = removed.group;
  return { ok: true, menu: withItems(menu, ci, items) };
}

// Swaps two neighbours but leaves section headings in their slots, so the layout stays intact.
export function moveItem(
  menu: Category[],
  categoryId: string,
  itemId: string,
  dir: -1 | 1,
): EditResult {
  const { ci, ii } = locate(menu, categoryId, itemId);
  if (ii === -1) return NOT_FOUND;
  const to = ii + dir;
  const src = menu[ci].items;
  if (to < 0 || to >= src.length) return { ok: true, menu };

  const items = src.map((it) => ({ ...it }));
  const a = items[ii];
  const b = items[to];
  const aGroup = a.group;
  const bGroup = b.group;
  delete a.group;
  delete b.group;
  if (bGroup) a.group = bGroup;
  if (aGroup) b.group = aGroup;
  items[ii] = b;
  items[to] = a;
  return { ok: true, menu: withItems(menu, ci, items) };
}

// ---------- whole-menu sanitizing (server side, before storing) ----------

const MAX_CATEGORIES = 20;
const MAX_ITEMS = 500;

function sanitizeItem(raw: unknown, categoryId: string, index: number, seen: Set<string>): MenuItem | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, any>;
  const name = pair(r.name?.hu, r.name?.en);
  if (!name) return null;

  let id = text(r.id, 64) || `${categoryId}-${index + 1}`;
  if (seen.has(id)) id = newId(categoryId);
  seen.add(id);

  const item: MenuItem = { id, name };
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

export function sanitizeCatalog(raw: unknown): Category[] | null {
  if (!Array.isArray(raw) || raw.length > MAX_CATEGORIES) return null;
  const out: Category[] = [];
  const catIds = new Set<string>();
  for (const c of raw) {
    if (!c || typeof c !== "object") return null;
    const id = text((c as any).id, 40);
    const title = pair((c as any).title?.hu, (c as any).title?.en, 80);
    const rawItems = (c as any).items;
    if (!id || !title || catIds.has(id) || !Array.isArray(rawItems) || rawItems.length > MAX_ITEMS) {
      return null;
    }
    catIds.add(id);
    const seen = new Set<string>();
    const items = rawItems
      .map((it: unknown, i: number) => sanitizeItem(it, id, i, seen))
      .filter((it: MenuItem | null): it is MenuItem => it !== null);
    out.push({ id, title, items });
  }
  return out.length ? out : null;
}
