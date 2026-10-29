import { menuData } from './menu-data';

export type Lang = 'hu' | 'en';
type T = { hu: string; en: string };

// price is optional: items without a known price show no price yet.
// group marks the first item of an optional subsection (e.g. bottle service groups).
export type MenuItem = { name: T; desc?: T; price?: number; group?: T };
export type Category = { id: string; title: T; items: MenuItem[] };

/** Egy sor a Google Táblázatból (scripts/fetch-menu.mjs generálja) */
type RawItem = {
  category: string;
  groupHu: string;
  groupEn: string;
  name: string;
  nameEn: string;
  desc: string;
  descEn: string;
  price: number;
};

/** A táblázat kategórianevei → az útvonalakban használt azonosító és kétnyelvű cím */
const CATEGORIES: { id: string; title: T; aliases: string[] }[] = [
  { id: 'shisha', title: { hu: 'Vízipipa', en: 'Shisha' }, aliases: ['vízipipa', 'shisha'] },
  { id: 'cocktails', title: { hu: 'Koktélok és shotok', en: 'Cocktails & shots' }, aliases: ['koktélok', 'koktélok és shotok', 'cocktails'] },
  { id: 'deals', title: { hu: 'Akciók és bottle service', en: 'Deals & bottle service' }, aliases: ['akciók és bottle service', 'akciók', 'deals'] },
  { id: 'spirits', title: { hu: 'Röviditalok', en: 'Spirits' }, aliases: ['röviditalok', 'spirits'] },
  { id: 'soft', title: { hu: 'Üdítők', en: 'Soft drinks' }, aliases: ['üdítők', 'soft drinks', 'soft'] },
  { id: 'hot', title: { hu: 'Snackek és forró italok', en: 'Snacks & hot drinks' }, aliases: ['snackek és forró italok', 'snacks & hot drinks', 'hot'] },
];

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const bi = (hu: string, en: string): T => ({ hu, en: en || hu });

function toItem(r: RawItem): MenuItem {
  const item: MenuItem = { name: bi(r.name, r.nameEn) };
  if (r.desc || r.descEn) item.desc = bi(r.desc || r.descEn, r.descEn);
  if (r.price > 0) item.price = r.price;
  if (r.groupHu || r.groupEn) item.group = bi(r.groupHu || r.groupEn, r.groupEn);
  return item;
}

/** Kategóriákba rendezi az itallapot, a táblázat sorrendjében */
function buildMenu(rows: readonly RawItem[]): Category[] {
  const byId = new Map<string, Category>();
  for (const r of rows) {
    if (!r.name || !r.category) continue;
    const key = r.category.trim().toLowerCase();
    const known = CATEGORIES.find((c) => c.aliases.includes(key) || c.id === key);
    const id = known?.id ?? slugify(r.category);
    let cat = byId.get(id);
    if (!cat) {
      cat = { id, title: known?.title ?? bi(r.category.trim(), ''), items: [] };
      byId.set(id, cat);
    }
    cat.items.push(toItem(r));
  }
  return [...byId.values()];
}

export const menu: Category[] = buildMenu(menuData as readonly RawItem[]);

// Group thousands with a non-breaking space by hand: some browsers have no
// hu-HU locale data and would otherwise render "5500 Ft".
export const formatPrice = (n: number) =>
  `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} Ft`;
