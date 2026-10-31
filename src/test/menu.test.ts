import { describe, expect, it } from "vitest";
import { buildMenu, categoryById, formatPrice } from "@/lib/menu";
import { parseCSV, parseMenuCsv } from "@/lib/menu-csv";

const HEADER =
  "Kategória,Csoport (HU),Csoport (EN),Név,Név (EN),Leírás (HU),Leírás (EN),Ár (Ft),Elérhető,Legtöbbet rendelt";

const CSV = [
  HEADER,
  // szándékosan a kategóriák "rossz" sorrendjében, hogy a rendezést is lássuk
  "Koktélok,,,Mojito,,\"Menta, lime\",\"Mint, lime\",2 590,igen,",
  "Vízipipa,,,Blue ice,,,,6000,igen,igen",
  "Vízipipa,,,Melon,,,,\"7.000 Ft\",,",
  "Vízipipa,,,Régi íz,,,,6000,nem,",
  "Üdítők,,,Coca Cola,Coca-Cola,,,790,igen,",
  "Akciók és bottle service,Palackok,Bottles,Vodka palack,Vodka bottle,,,,igen,",
  "Ismeretlen kategória,,,Valami,,,,100,igen,",
].join("\r\n");

describe("CSV parser", () => {
  it("handles quoted commas, escaped quotes and mixed line endings", () => {
    const rows = parseCSV('a,"b,c","d ""x"""\r\n1,2,3\n');
    expect(rows).toEqual([
      ["a", "b,c", 'd "x"'],
      ["1", "2", "3"],
    ]);
  });

  it("skips rows marked unavailable and parses prices in any format", () => {
    const items = parseMenuCsv(CSV);
    expect(items.map((i) => i.name)).not.toContain("Régi íz");
    expect(items.find((i) => i.name === "Mojito")?.price).toBe(2590);
    expect(items.find((i) => i.name === "Melon")?.price).toBe(7000);
    expect(items.find((i) => i.name === "Vodka palack")?.price).toBe(0);
    expect(items.find((i) => i.name === "Blue ice")?.popular).toBe(true);
  });

  it("rejects an empty sheet", () => {
    expect(() => parseMenuCsv(HEADER)).toThrow();
  });
});

describe("Menu builder", () => {
  const menu = buildMenu(parseMenuCsv(CSV));

  it("lists sections in the bar's order and drops unknown categories", () => {
    expect(menu.map((c) => c.id)).toEqual(["shisha", "cocktails", "deals", "soft"]);
  });

  it("keeps Hungarian and English names, falling back to Hungarian", () => {
    const soft = menu.find((c) => c.id === "soft")!;
    expect(soft.items[0]!.name).toEqual({ hu: "Coca Cola", en: "Coca-Cola" });
    const shisha = menu.find((c) => c.id === "shisha")!;
    expect(shisha.items[0]!.name).toEqual({ hu: "Blue ice", en: "Blue ice" });
  });

  it("keeps descriptions, groups and missing prices", () => {
    const cocktail = menu.find((c) => c.id === "cocktails")!.items[0]!;
    expect(cocktail.desc).toEqual({ hu: "Menta, lime", en: "Mint, lime" });
    const bottle = menu.find((c) => c.id === "deals")!.items[0]!;
    expect(bottle.group).toEqual({ hu: "Palackok", en: "Bottles" });
    expect(bottle.price).toBeUndefined();
  });

  it("returns an empty menu for an empty sheet", () => {
    expect(buildMenu([])).toEqual([]);
  });
});

describe("Helpers", () => {
  it("resolves known category ids without menu data", () => {
    expect(categoryById("shisha")?.title.en).toBe("Shisha");
    expect(categoryById("nincs-ilyen")).toBeUndefined();
  });

  it("formats prices with a non-breaking thousands separator", () => {
    expect(formatPrice(6000)).toBe("6 000 Ft");
    expect(formatPrice(790)).toBe("790 Ft");
  });
});
