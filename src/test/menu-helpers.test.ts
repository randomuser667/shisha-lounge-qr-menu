import { describe, expect, it } from "vitest";
import { isUnavailable, menu, withIds, type MenuItem } from "@/lib/menu";

const item = (extra: Partial<MenuItem> = {}): MenuItem => ({
  name: { hu: "Teszt", en: "Test" },
  price: 1000,
  ...extra,
});

describe("isUnavailable", () => {
  it("is available by default and when stock is not tracked", () => {
    expect(isUnavailable(item())).toBe(false);
    expect(isUnavailable(item({ stock: undefined }))).toBe(false);
  });
  it("is unavailable when switched to sold out by hand", () => {
    expect(isUnavailable(item({ soldOut: true }))).toBe(true);
  });
  it("is unavailable when a tracked stock hits zero, available while some is left", () => {
    expect(isUnavailable(item({ stock: 0 }))).toBe(true);
    expect(isUnavailable(item({ stock: 3 }))).toBe(false);
  });
});

describe("withIds", () => {
  const withId = withIds(menu);
  it("gives every item a unique id and keeps the content", () => {
    const ids = withId.flatMap((c) => c.items.map((i) => i.id));
    expect(ids.every(Boolean)).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
    expect(withId.map((c) => c.items.length)).toEqual(menu.map((c) => c.items.length));
    expect(withId[0].items[0].name).toEqual(menu[0].items[0].name);
  });
  it("does not change the static menu and keeps existing ids", () => {
    expect(menu[0].items[0].id).toBeUndefined();
    const again = withIds(withId);
    expect(again[0].items[0].id).toBe(withId[0].items[0].id);
  });
});
