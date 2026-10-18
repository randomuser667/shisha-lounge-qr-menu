export type Lang = "hu" | "en";
type T = { hu: string; en: string };

export type MenuItem = { name: T; desc?: T; price: number };
export type Category = { id: string; title: T; items: MenuItem[] };

// Sample menu — replace with the real items and prices.
export const menu: Category[] = [
  {
    id: "shisha",
    title: { hu: "Vízipipa", en: "Shisha" },
    items: [
      { name: { hu: "Dupla alma", en: "Double Apple" }, desc: { hu: "Klasszikus ánizsos alma", en: "Classic aniseed apple" }, price: 5500 },
      { name: { hu: "Görögdinnye menta", en: "Watermelon Mint" }, desc: { hu: "Friss és hűsítő", en: "Fresh and cooling" }, price: 5500 },
      { name: { hu: "Kék áfonya", en: "Blueberry" }, desc: { hu: "Édes erdei gyümölcs", en: "Sweet forest berry" }, price: 5500 },
      { name: { hu: "Hashtag Signature", en: "Hashtag Signature" }, desc: { hu: "A ház titkos keveréke", en: "Our secret house blend" }, price: 7000 },
      { name: { hu: "Gyümölcsfej", en: "Fruit Head" }, desc: { hu: "Ananász vagy grapefruit fejjel", en: "Served in a pineapple or grapefruit" }, price: 9000 },
    ],
  },
  {
    id: "cocktails",
    title: { hu: "Koktélok", en: "Cocktails" },
    items: [
      { name: { hu: "Mojito", en: "Mojito" }, price: 2900 },
      { name: { hu: "Pornstar Martini", en: "Pornstar Martini" }, price: 3400 },
      { name: { hu: "Aperol Spritz", en: "Aperol Spritz" }, price: 2900 },
      { name: { hu: "Purple Rain", en: "Purple Rain" }, desc: { hu: "Vodka, kék curaçao, áfonya", en: "Vodka, blue curaçao, cranberry" }, price: 3200 },
    ],
  },
  {
    id: "soft",
    title: { hu: "Üdítők", en: "Soft drinks" },
    items: [
      { name: { hu: "Házi limonádé", en: "Homemade lemonade" }, price: 1500 },
      { name: { hu: "Coca-Cola", en: "Coca-Cola" }, price: 900 },
      { name: { hu: "Red Bull", en: "Red Bull" }, price: 1300 },
      { name: { hu: "Ásványvíz", en: "Mineral water" }, price: 700 },
    ],
  },
  {
    id: "hot",
    title: { hu: "Forró italok", en: "Hot drinks" },
    items: [
      { name: { hu: "Marokkói mentatea", en: "Moroccan mint tea" }, price: 1600 },
      { name: { hu: "Espresso", en: "Espresso" }, price: 800 },
      { name: { hu: "Cappuccino", en: "Cappuccino" }, price: 1100 },
    ],
  },
];

// Group thousands with a non-breaking space by hand: some browsers have no
// hu-HU locale data and would otherwise render "5500 Ft".
export const formatPrice = (n: number) =>
  `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0")} Ft`;
