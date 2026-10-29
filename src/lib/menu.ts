import { menuData } from './menu-data';

export type MenuItem = {
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

export type MenuCategory = {
  name: string;
  groups: {
    titleHu: string;
    titleEn: string;
    items: MenuItem[];
  }[];
};

/** A táblázatból érkező nyers adatok */
const raw: MenuItem[] = (menuData as any) || [];

/** Kategóriákba és csoportokba rendezi az itallapot */
export function getMenu(): MenuCategory[] {
  const categories = new Map<string, Map<string, MenuItem[]>>();

  for (const item of raw) {
    if (!item.name) continue;

    if (!categories.has(item.category)) {
      categories.set(item.category, new Map());
    }
    const groups = categories.get(item.category)!;

    const groupKey = item.groupHu || '__nogroup__';
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(item);
  }

  const result: MenuCategory[] = [];

  for (const [catName, groups] of categories) {
    const groupList = [];
    for (const [groupKey, items] of groups) {
      groupList.push({
        titleHu: groupKey === '__nogroup__' ? '' : groupKey,
        titleEn: items[0]?.groupEn || '',
        items,
      });
    }
    result.push({
      name: catName,
      groups: groupList,
    });
  }

  return result;
}

/** Egyszerű lista az összes tételről (pl. kereséshez) */
export function getAllItems(): MenuItem[] {
  return raw.filter(i => i.name);
}
