import { describe, expect, it } from "vitest";
import { menu as staticMenu, withIds, type Category } from "@/lib/menu";
import {
  deleteItem,
  moveItem,
  patchItem,
  revOf,
  sanitizeCatalog,
  upsertItem,
} from "@/lib/menu-edit";

const base = (): Category[] => withIds(staticMenu);
const ok = <T extends { ok: boolean }>(r: T) => {
  if (!r.ok) throw new Error(`expected ok, got ${JSON.stringify(r)}`);
  return r as Extract<T, { ok: true }>;
};
const cat = (m: Category[], id: string) => m.find((c) => c.id === id)!;

describe("draft editing is immutable (nothing changes until saved)", () => {
  it("does not touch the menu it was given", () => {
    const m = base();
    const before = JSON.stringify(m);
    ok(patchItem(m, "shisha", m[0].items[0].id!, { soldOut: true, price: 6500, stock: 3 }));
    ok(deleteItem(m, "hot", cat(m, "hot").items[0].id!));
    ok(moveItem(m, "hot", cat(m, "hot").items[1].id!, -1));
    expect(JSON.stringify(m)).toBe(before);
  });
});

describe("patchItem", () => {
  it("toggles sold out, sets and clears stock and price", () => {
    const m = base();
    const id = m[0].items[0].id!;
    let r = ok(patchItem(m, "shisha", id, { soldOut: true }));
    expect(r.menu[0].items[0].soldOut).toBe(true);
    r = ok(patchItem(r.menu, "shisha", id, { soldOut: false, stock: 5, price: 6500 }));
    expect(r.menu[0].items[0]).toMatchObject({ stock: 5, price: 6500 });
    expect(r.menu[0].items[0].soldOut).toBeUndefined();
    r = ok(patchItem(r.menu, "shisha", id, { stock: null }));
    expect("stock" in r.menu[0].items[0]).toBe(false);
    r = ok(patchItem(r.menu, "shisha", id, { stock: 0 }));
    expect(r.menu[0].items[0].stock).toBe(0);
  });
  it("rejects unknown items", () => {
    expect(patchItem(base(), "nope", "x", {}).ok).toBe(false);
  });
});

describe("upsertItem", () => {
  it("creates an item with trimmed names and an english fallback", () => {
    const r = ok(upsertItem(base(), "cocktails", { nameHu: "  Új   koktél ", price: 3200, descHu: "x" }));
    const added = cat(r.menu, "cocktails").items.at(-1)!;
    expect(added.name).toEqual({ hu: "Új koktél", en: "Új koktél" });
    expect(added.desc).toEqual({ hu: "x", en: "x" });
    expect(added.id).toBeTruthy();
  });
  it("requires a name and an existing item for edits", () => {
    expect(upsertItem(base(), "cocktails", { nameHu: "", nameEn: "" }).ok).toBe(false);
    expect(upsertItem(base(), "cocktails", { id: "ghost", nameHu: "x" }).ok).toBe(false);
  });
  it("edits an existing item in place", () => {
    const m = base();
    const id = cat(m, "cocktails").items[0].id!;
    const r = ok(upsertItem(m, "cocktails", { id, nameHu: "Átnevezve", nameEn: "Renamed", price: 3300, stock: 4 }));
    expect(cat(r.menu, "cocktails").items[0]).toMatchObject({ id, stock: 4, price: 3300 });
    expect(cat(r.menu, "cocktails").items.length).toBe(cat(m, "cocktails").items.length);
  });
});

describe("moveItem and deleteItem keep section headings", () => {
  it("move swaps neighbours but headings stay in their slots", () => {
    const m = base();
    const hot = cat(m, "hot");
    const groups = hot.items.map((i) => i.group?.hu ?? null);
    const second = hot.items[1].id!;
    const r = ok(moveItem(m, "hot", second, -1));
    const moved = cat(r.menu, "hot");
    expect(moved.items[0].id).toBe(second);
    expect(moved.items.map((i) => i.group?.hu ?? null)).toEqual(groups);
    expect(ok(moveItem(r.menu, "hot", second, -1)).menu).toBe(r.menu);
  });
  it("delete passes the heading on to the next item", () => {
    const m = base();
    const hot = cat(m, "hot");
    const idx = hot.items.findIndex((i) => i.group);
    const heading = hot.items[idx].group!.hu;
    const r = ok(deleteItem(m, "hot", hot.items[idx].id!));
    expect(cat(r.menu, "hot").items[idx].group?.hu).toBe(heading);
    expect(deleteItem(m, "hot", "ghost").ok).toBe(false);
  });
});

describe("sanitizeCatalog (server side, before storing)", () => {
  it("accepts the built-in menu unchanged", () => {
    expect(sanitizeCatalog(base())).toEqual(base());
  });
  it("drops nameless items, bad prices and duplicate ids", () => {
    const dirty = [
      {
        id: "x",
        title: { hu: "X", en: "X" },
        items: [
          { id: "a", name: { hu: "  A  ", en: "" }, price: -5, stock: "7" },
          { id: "a", name: { hu: "B", en: "B" }, price: 100 },
          { id: "c", name: { hu: "", en: "" } },
          "junk",
        ],
      },
    ];
    const clean = sanitizeCatalog(dirty)!;
    expect(clean[0].items).toHaveLength(2);
    expect(clean[0].items[0]).toMatchObject({ id: "a", name: { hu: "A", en: "A" }, stock: 7 });
    expect(clean[0].items[0].price).toBeUndefined();
    expect(clean[0].items[1].id).not.toBe("a");
  });
  it("refuses things that are not a menu", () => {
    expect(sanitizeCatalog(null)).toBeNull();
    expect(sanitizeCatalog([])).toBeNull();
    expect(sanitizeCatalog([{ id: "x" }])).toBeNull();
  });
});

describe("revOf", () => {
  it("is stable for the same menu and changes with any edit", () => {
    const m = base();
    expect(revOf(m)).toBe(revOf(base()));
    const r = ok(patchItem(m, "shisha", m[0].items[0].id!, { price: 6001 }));
    expect(revOf(r.menu)).not.toBe(revOf(m));
  });
  it("survives a sanitize round trip (what the server stores is what the page holds)", () => {
    const m = base();
    expect(revOf(sanitizeCatalog(JSON.parse(JSON.stringify(m)))!)).toBe(revOf(m));
  });
  it("ignores key order, so undoing an edit leaves the menu equal to the saved one", () => {
    const m = base();
    const id = m[0].items[0].id!;
    const on = ok(patchItem(m, "shisha", id, { soldOut: true }));
    const off = ok(patchItem(on.menu, "shisha", id, { soldOut: false }));
    expect(revOf(on.menu)).not.toBe(revOf(m));
    expect(revOf(off.menu)).toBe(revOf(m));
    const same = ok(upsertItem(m, "cocktails", { ...{ id: cat(m, "cocktails").items[0].id! }, nameHu: cat(m, "cocktails").items[0].name.hu, nameEn: cat(m, "cocktails").items[0].name.en, descHu: cat(m, "cocktails").items[0].desc?.hu, descEn: cat(m, "cocktails").items[0].desc?.en, price: cat(m, "cocktails").items[0].price }));
    expect(revOf(same.menu)).toBe(revOf(m));
  });
});
