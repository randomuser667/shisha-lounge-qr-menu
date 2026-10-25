import { describe, expect, it } from "vitest";
import { menu } from "@/lib/menu";

describe("Guest menu options", () => {
  it("offers two beers with nachos and with popcorn as deals", () => {
    const deals = menu.find((category) => category.id === "deals");
    expect(deals?.items.some((item) => item.desc?.en === "2 × 500 ml draught beers + cheesy nachos")).toBe(true);
    expect(deals?.items.some((item) => item.desc?.en === "2 × 500 ml draught beers + a bowl of popcorn")).toBe(true);
  });

  it("includes vodka with Red Bull, bottle mixers, and snack sides", () => {
    const bottles = menu.find((category) => category.id === "bottles");
    const names = bottles?.items.map((item) => item.name.en);
    expect(names).toEqual(expect.arrayContaining(["Vodka Party Set", "Vodka Red Bull", "Extra Red Bull", "Extra tonic", "Cheesy nachos", "Popcorn", "French fries"]));
  });

  it("marks at least one most-ordered product in each section", () => {
    expect(menu).toHaveLength(6);
    for (const category of menu) {
      expect(category.items.some((item) => item.mostOrdered), category.id).toBe(true);
    }
  });

  it("keeps all 26 cocktails with ingredients", () => {
    const cocktails = menu.find((category) => category.id === "cocktails");
    expect(cocktails?.items).toHaveLength(26);
    expect(cocktails?.items.every((item) => item.desc?.hu && item.desc?.en)).toBe(true);
  });
});