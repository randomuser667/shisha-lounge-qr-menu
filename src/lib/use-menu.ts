import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { buildMenu, type Category } from "./menu";
import { parseMenuCsv } from "./menu-csv";

/**
 * A Google Táblázat "Közzététel az interneten" CSV-linkje.
 * Netlify-on a VITE_MENU_CSV_URL környezeti változóban kell megadni.
 */
export const MENU_CSV_URL: string = import.meta.env.VITE_MENU_CSV_URL ?? "";

const CACHE_KEY = "hashtag-menu-cache-v1";

function readCache(): Category[] | null {
  try {
    const saved = window.localStorage.getItem(CACHE_KEY);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0 ? (parsed as Category[]) : null;
  } catch {
    return null;
  }
}

function writeCache(menu: Category[]) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(menu));
  } catch {
    // privát módban vagy tele tárhelynél nem baj, ha nem menthető
  }
}

export async function fetchMenu(url: string = MENU_CSV_URL): Promise<Category[]> {
  if (!url) throw new Error("Hiányzik a VITE_MENU_CSV_URL beállítás");

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const menu = buildMenu(parseMenuCsv(await res.text()));
  if (menu.length === 0) throw new Error("A táblázatban nincs megjeleníthető tétel");

  writeCache(menu);
  return menu;
}

export type MenuStatus = "loading" | "ready" | "error";

/**
 * Az étlap a böngészőben, a megnyitáskor töltődik be a táblázatból, ezért
 * a táblázat módosításához nincs szükség új deploy-ra.
 * A legutóbb sikeresen letöltött étlap a böngészőben marad, így ismételt
 * megnyitáskor azonnal megjelenik, hálózati hiba esetén pedig ez a tartalék.
 */
export function useMenu(): { menu: Category[]; status: MenuStatus; retry: () => void } {
  const query = useQuery({
    queryKey: ["menu"],
    queryFn: () => fetchMenu(),
    staleTime: 60_000,
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // A mentett étlapot csak hidratálás után olvassuk (SSR-kor nincs localStorage).
  const [cached, setCached] = useState<Category[] | null>(null);
  useEffect(() => {
    setCached(readCache());
  }, []);

  const menu = query.data ?? cached ?? [];
  const status: MenuStatus =
    query.data || cached ? "ready" : query.isError ? "error" : "loading";

  return { menu, status, retry: () => void query.refetch() };
}
