import { menuData } from "./menu-data";

export type Lang = "hu" | "en";
type T = { hu: string; en: string };

export type MenuItem = {
  name: T;
  desc?: T;
  price?: number;
  mostOrdered?: boolean;
  group?: T;
};

export type Category = {
  id: string;
  title: T;
  items: MenuItem[];
};

/** Magyar kategória név → id + cím */
const CATEGORY_MAP: Record<string, { id: string; title: T }> = {
  "Vízipipa": { id: "shisha", title: { hu: "Vízipipa", en: "Shisha" } },
  "Koktélok": { id: "cocktails", title: { hu: "Koktélok", en: "Cocktails" } },
  "Akciók és bottle service": {
    id: "deals",
    title: { hu: "Akciók és bottle service", en: "Deals & bottle service" },
  },
  "Röviditalok": { id: "spirits", title: { hu: "Röviditalok", en: "Spirits" } },
  "Üdítők": { id: "soft", title: { hu: "Üdítők", en: "Soft drinks" } },
  "Snackek és forró italok": {
    id: "hot",
    title: { hu: "Snackek és forró italok", en: "Snacks & hot drinks" },
  },
};

type Raw = {
  category: string;
  groupHu: string;
  groupEn: string;
  name: string;
  nameEn: string;
  desc: string;
  descEn: string;
  price: number;
  popular: boolean;
};

const raw: Raw[] = (menuData as any) || [];

/** A táblázat adataiból építi fel a régi formátumot */
function buildMenu(): Category[] {
  const order = [
    "Vízipipa",
    "Koktélok",
    "Akciók és bottle service",
    "Röviditalok",
    "Üdítők",
    "Snackek és forró italok",
  ];

  const byCat = new Map<string, Raw[]>();

  for (const item of raw) {
    if (!item.name) continue;
    if (!byCat.has(item.category)) byCat.set(item.category, []);
    byCat.get(item.category)!.push(item);
  }

  const result: Category[] = [];

  for (const catName of order) {
    const items = byCat.get(catName);
    if (!items || items.length === 0) continue;

    const meta = CATEGORY_MAP[catName];
    if (!meta) continue;

    const menuItems: MenuItem[] = items.map((r) => {
      const item: MenuItem = {
        name: {
          hu: r.name,
          en: r.nameEn || r.name,
        },
        price: r.price || undefined,
      };

      if (r.desc || r.descEn) {
        item.desc = {
          hu: r.desc || "",
          en: r.descEn || r.desc || "",
        };
      }

      if (r.groupHu) {
        item.group = {
          hu: r.groupHu,
          en: r.groupEn || r.groupHu,
        };
      }

      if (r.popular) {
        item.mostOrdered = true;
      }

      return item;
    });

    result.push({
      id: meta.id,
      title: meta.title,
      items: menuItems,
    });
  }

  return result;
}

export const menu: Category[] = buildMenu();

export function formatPrice(n: number): string {
  return `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0")} Ft`;
}
