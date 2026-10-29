import { describe, expect, it } from "vitest";
import { menu } from "@/lib/menu";

const cat = (id: string) => {
  const category = menu.find((c) => c.id === id);
  if (!category) throw new Error(`Missing category: ${id}`);
  return category;
};
const names = (id: string) => cat(id).items.map((i) => i.name.hu);

describe("Guest menu", () => {
  it("lists sections in the bar's order", () => {
    expect(menu.map((c) => c.id)).toEqual(["shisha", "cocktails", "deals", "spirits", "soft", "hot"]);
  });
  it("prices premium shisha at 6000 Ft and hardcore at 7000 Ft", () => {
    const s = cat("shisha").items;
    expect(s.find((i) => i.name.hu === "Blue ice")?.price).toBe(6000);
    expect(s.find((i) => i.name.hu === "Melon")?.price).toBe(7000);
  });
  it("uses the bar's soft drink and spirit prices", () => {
    expect(cat("soft").items.find((i) => i.name.hu === "Coca Cola")?.price).toBe(790);
    expect(cat("spirits").items.find((i) => i.name.hu === "Zacapa XO")?.price).toBe(8290);
  });
  it("keeps only popcorn, nachos and small snacks as food", () => {
    expect(names("hot")).toEqual(expect.arrayContaining(["Sós popcorn", "Sajtos popcorn", "BBQ popcorn", "Nachos"]));
    expect(names("hot")).not.toContain("Csirkeszárnyak");
  });
  it("has no by-the-glass drinks in bottle service and Hungarian title says bottle service", () => {
    expect(names("deals")).not.toContain("Vodka Red Bull");
    expect(cat("deals").title.hu).toContain("bottle service");
  });
  it("never lists fries", () => {
    expect(menu.flatMap((c) => c.items).some((i) => /fries|hasáb/i.test(i.name.en + (i.desc?.en ?? "")))).toBe(false);
  });
  it("lists the bar's 21 cocktails plus the three shots at the bottom", () => {
    const items = cat("cocktails").items;
    expect(items).toHaveLength(24);
    expect(items.find((i) => i.name.hu === "Aperol Spritz")?.price).toBe(2290);
    expect(items.find((i) => i.name.hu === "Long Island")?.price).toBe(3590);
    expect(items.slice(-3).map((i) => i.name.hu)).toEqual(["Speed shot", "Hashtag shot", "Happy shot"]);
    expect(items.slice(-3).map((i) => i.price)).toEqual([4400, 3000, 3450]);
    expect(cat("cocktails").title.hu).toContain("shot");
    expect(names("cocktails")).not.toContain("Golden Hashtag");
    expect(names("cocktails")).not.toContain("Gin Tonic");
  });
  it("has no Zero Proof deal", () => {
    expect(names("deals")).not.toContain("Zero Proof, Full Vibe");
  });
  it("has no bestseller metadata anywhere", () => {
    expect(menu.flatMap((c) => c.items).filter((item) => "mostOrdered" in item)).toEqual([]);
  });
  it("removes unusual dessert and floral shisha blends while retaining lounge classics", () => {
    const flavors = names("shisha");
    for (const removed of ["English mix", "Jungle", "Eterna", "Prada", "Levander lemonade"]) {
      expect(flavors).not.toContain(removed);
    }
    expect(flavors).toEqual(expect.arrayContaining(["Blue ice", "Grape mint", "Love66", "Ladykiller", "Melon"]));
    expect(flavors).toHaveLength(37);
  });
  it("keeps all 21 cocktails in a continuous order with Mojito seventh", () => {
    const cocktails = cat("cocktails").items.slice(0, -3);
    expect(cocktails).toHaveLength(21);
    expect(cocktails.slice(5, 8).map((item) => item.name.hu)).toEqual(["Fiero Tonic", "Mojito", "Mojito eper"]);
    expect(cocktails.every((item) => item.name.hu.trim().length > 0)).toBe(true);
  });
});
