export type Lang = "hu" | "en";
type T = { hu: string; en: string };

export type MenuItem = { name: T; desc?: T; price: number; mostOrdered?: boolean; group?: T };
export type Category = { id: string; title: T; items: MenuItem[] };

// Sample menu — replace with the real items and prices.
export const menu: Category[] = [
  {
    id: "shisha",
    title: { hu: "Vízipipa", en: "Shisha" },
    items: [
      { name: { hu: "Dupla alma", en: "Double Apple" }, desc: { hu: "Klasszikus ánizsos alma", en: "Classic aniseed apple" }, price: 5500, mostOrdered: true },
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
      { name: { hu: "Mojito", en: "Mojito" }, desc: { hu: "Fehér rum, lime, menta, nádcukor, szóda", en: "White rum, lime, mint, cane sugar, soda" }, price: 2900, mostOrdered: true },
      { name: { hu: "Pornstar Martini", en: "Pornstar Martini" }, desc: { hu: "Vanília vodka, maracuja, lime, prosecco", en: "Vanilla vodka, passion fruit, lime, prosecco" }, price: 3400 },
      { name: { hu: "Aperol Spritz", en: "Aperol Spritz" }, desc: { hu: "Aperol, prosecco, szóda, narancs", en: "Aperol, prosecco, soda, orange" }, price: 2900 },
      { name: { hu: "Purple Rain", en: "Purple Rain" }, desc: { hu: "Vodka, kék curaçao, áfonyalé, grenadin", en: "Vodka, blue curaçao, cranberry, grenadine" }, price: 3200 },
      { name: { hu: "Piña Colada", en: "Piña Colada" }, desc: { hu: "Fehér rum, kókuszkrém, ananászlé", en: "White rum, coconut cream, pineapple juice" }, price: 3200 },
      { name: { hu: "Margarita", en: "Margarita" }, desc: { hu: "Tequila, triple sec, lime, sós perem", en: "Tequila, triple sec, lime, salted rim" }, price: 3100 },
      { name: { hu: "Cosmopolitan", en: "Cosmopolitan" }, desc: { hu: "Citrom vodka, triple sec, áfonyalé, lime", en: "Citrus vodka, triple sec, cranberry, lime" }, price: 3100 },
      { name: { hu: "Long Island Iced Tea", en: "Long Island Iced Tea" }, desc: { hu: "Vodka, gin, rum, tequila, triple sec, citrom, kóla", en: "Vodka, gin, rum, tequila, triple sec, lemon, cola" }, price: 3600 },
      { name: { hu: "Sex on the Beach", en: "Sex on the Beach" }, desc: { hu: "Vodka, barackpálinka-likőr, narancslé, áfonyalé", en: "Vodka, peach schnapps, orange juice, cranberry" }, price: 3000 },
      { name: { hu: "Tequila Sunrise", en: "Tequila Sunrise" }, desc: { hu: "Tequila, narancslé, grenadin", en: "Tequila, orange juice, grenadine" }, price: 2900 },
      { name: { hu: "Caipirinha", en: "Caipirinha" }, desc: { hu: "Cachaça, lime, nádcukor", en: "Cachaça, lime, cane sugar" }, price: 2900 },
      { name: { hu: "Daiquiri", en: "Daiquiri" }, desc: { hu: "Fehér rum, lime, cukorszirup", en: "White rum, lime, sugar syrup" }, price: 2900 },
      { name: { hu: "Strawberry Daiquiri", en: "Strawberry Daiquiri" }, desc: { hu: "Fehér rum, eper, lime, cukorszirup", en: "White rum, strawberry, lime, sugar syrup" }, price: 3100 },
      { name: { hu: "Blue Lagoon", en: "Blue Lagoon" }, desc: { hu: "Vodka, kék curaçao, limonádé", en: "Vodka, blue curaçao, lemonade" }, price: 2900 },
      { name: { hu: "Cuba Libre", en: "Cuba Libre" }, desc: { hu: "Barna rum, kóla, lime", en: "Dark rum, cola, lime" }, price: 2600 },
      { name: { hu: "Moscow Mule", en: "Moscow Mule" }, desc: { hu: "Vodka, gyömbérsör, lime", en: "Vodka, ginger beer, lime" }, price: 3000 },
      { name: { hu: "Gin Tonic", en: "Gin Tonic" }, desc: { hu: "Gin, tonik, uborka vagy citrus", en: "Gin, tonic, cucumber or citrus" }, price: 2700 },
      { name: { hu: "Negroni", en: "Negroni" }, desc: { hu: "Gin, Campari, vörös vermut", en: "Gin, Campari, red vermouth" }, price: 3200 },
      { name: { hu: "Espresso Martini", en: "Espresso Martini" }, desc: { hu: "Vodka, kávélikőr, espresso", en: "Vodka, coffee liqueur, espresso" }, price: 3300 },
      { name: { hu: "Whiskey Sour", en: "Whiskey Sour" }, desc: { hu: "Bourbon, citrom, cukorszirup, tojásfehérje", en: "Bourbon, lemon, sugar syrup, egg white" }, price: 3300 },
      { name: { hu: "Old Fashioned", en: "Old Fashioned" }, desc: { hu: "Bourbon, cukor, Angostura, narancshéj", en: "Bourbon, sugar, Angostura, orange peel" }, price: 3400 },
      { name: { hu: "Mai Tai", en: "Mai Tai" }, desc: { hu: "Fehér és barna rum, narancslikőr, mandulaszirup, lime", en: "White & dark rum, orange liqueur, orgeat, lime" }, price: 3500 },
      { name: { hu: "Hugo", en: "Hugo" }, desc: { hu: "Prosecco, bodzaszirup, menta, lime, szóda", en: "Prosecco, elderflower syrup, mint, lime, soda" }, price: 2900 },
      { name: { hu: "Passion Fruit Mojito", en: "Passion Fruit Mojito" }, desc: { hu: "Fehér rum, maracuja, lime, menta, szóda", en: "White rum, passion fruit, lime, mint, soda" }, price: 3100 },
      { name: { hu: "Golden Hashtag", en: "Golden Hashtag" }, desc: { hu: "Barna rum, mézszirup, ananász, gyömbér, aranypor", en: "Dark rum, honey syrup, pineapple, ginger, gold dust" }, price: 3800 },
      { name: { hu: "Virgin Mojito (alkoholmentes)", en: "Virgin Mojito (alcohol-free)" }, desc: { hu: "Lime, menta, nádcukor, szóda", en: "Lime, mint, cane sugar, soda" }, price: 1900 },
    ],
  },
  {
    id: "soft",
    title: { hu: "Üdítők", en: "Soft drinks" },
    items: [
      { name: { hu: "Házi limonádé", en: "Homemade lemonade" }, price: 1500, mostOrdered: true },
      { name: { hu: "Coca-Cola", en: "Coca-Cola" }, price: 900 },
      { name: { hu: "Red Bull", en: "Red Bull" }, price: 1300 },
      { name: { hu: "Ásványvíz", en: "Mineral water" }, price: 700 },
    ],
  },
  {
    id: "hot",
    title: { hu: "Forró italok és snacks", en: "Hot drinks & snacks" },
    items: [
      { name: { hu: "Marokkói mentatea", en: "Moroccan mint tea" }, price: 1600 },
      { name: { hu: "Espresso", en: "Espresso" }, price: 800 },
      { name: { hu: "Cappuccino", en: "Cappuccino" }, price: 1100 },
      { name: { hu: "Csirkeszárnyak", en: "Chicken wings" }, desc: { hu: "6 db, BBQ vagy csípős", en: "6 pcs, BBQ or spicy" }, price: 3200 },
      { name: { hu: "Sajtos nachók", en: "Cheesy nachos" }, desc: { hu: "Guacamolével és joghurtos mártással", en: "With guacamole and yogurt dip" }, price: 2800, mostOrdered: true },
      { name: { hu: "Sült camembert", en: "Fried camembert" }, desc: { hu: "Mézzel, pirítóssal", en: "With honey and toast" }, price: 3400 },
      { name: { hu: "Sajttál", en: "Cheese plate" }, desc: { hu: "Válogatás szőlővel és dióval", en: "Selection with grapes and walnuts" }, price: 4900 },
      { name: { hu: "Popcorn", en: "Popcorn" }, desc: { hu: "Egy tál sós popcorn", en: "A bowl of salted popcorn" }, price: 1200 },
    ],
  },
  {
    id: "deals",
    title: { hu: "Akciók és palackszerviz", en: "Deals & bottle service" },
    items: [
      { name: { hu: "Match Day MVP", en: "Match Day MVP" }, desc: { hu: "2 × 0,5 l csapolt sör + sajtos nachók", en: "2 × 500 ml draught beers + cheesy nachos" }, price: 4900, mostOrdered: true, group: { hu: "Akciós csomagok", en: "Deals" } },
      { name: { hu: "Pop & Cheers", en: "Pop & Cheers" }, desc: { hu: "2 × 0,5 l csapolt sör + egy tál popcorn", en: "2 × 500 ml draught beers + a bowl of popcorn" }, price: 3500 },
      { name: { hu: "Wing Squad", en: "Wing Squad" }, desc: { hu: "4 × 0,5 l csapolt sör + 6 csirkeszárny", en: "4 × 500 ml draught beers + 6 chicken wings" }, price: 8900 },
      { name: { hu: "Golden Hour Duo", en: "Golden Hour Duo" }, desc: { hu: "2 Aperol Spritz + sajtos nachók", en: "2 Aperol Spritz + cheesy nachos" }, price: 7500 },
      { name: { hu: "Zero Proof, Full Vibe", en: "Zero Proof, Full Vibe" }, desc: { hu: "2 Virgin Mojito + egy tál popcorn · alkoholmentes", en: "2 Virgin Mojito + a bowl of popcorn · alcohol-free" }, price: 4300 },
      { name: { hu: "Vodka Party Set", en: "Vodka Party Set" }, desc: { hu: "0,7 l vodka + 4 × 250 ml Red Bull + jég és lime", en: "700 ml vodka + 4 × 250 ml Red Bull + ice and lime" }, price: 24900, mostOrdered: true, group: { hu: "Palackok és mixerek", en: "Bottles & mixers" } },
      { name: { hu: "Gin & Tonic Set", en: "Gin & Tonic Set" }, desc: { hu: "0,7 l gin + 4 × 200 ml tonik + jég és citrusok", en: "700 ml gin + 4 × 200 ml tonic + ice and citrus" }, price: 23900 },
      { name: { hu: "Rum & Cola Set", en: "Rum & Cola Set" }, desc: { hu: "0,7 l fehér rum + 4 × 250 ml Coca-Cola + jég és lime", en: "700 ml white rum + 4 × 250 ml Coca-Cola + ice and lime" }, price: 22900 },
      { name: { hu: "Whiskey & Cola Set", en: "Whiskey & Cola Set" }, desc: { hu: "0,7 l bourbon whiskey + 4 × 250 ml Coca-Cola + jég", en: "700 ml bourbon whiskey + 4 × 250 ml Coca-Cola + ice" }, price: 26900 },
      { name: { hu: "Tequila Crew Set", en: "Tequila Crew Set" }, desc: { hu: "0,7 l blanco tequila + lime, só + 1 l narancslé", en: "700 ml blanco tequila + lime, salt + 1 litre orange juice" }, price: 24900 },
      { name: { hu: "Vodka Red Bull", en: "Vodka Red Bull" }, desc: { hu: "4 cl vodka + 250 ml Red Bull", en: "40 ml vodka + 250 ml Red Bull" }, price: 2900, mostOrdered: true, group: { hu: "Club kedvencek · pohárral", en: "Club classics · by the glass" } },
      { name: { hu: "Rum & Cola", en: "Rum & Cola" }, desc: { hu: "4 cl fehér rum + 250 ml Coca-Cola + lime", en: "40 ml white rum + 250 ml Coca-Cola + lime" }, price: 2500 },
      { name: { hu: "Whiskey & Cola", en: "Whiskey & Cola" }, desc: { hu: "4 cl bourbon whiskey + 250 ml Coca-Cola", en: "40 ml bourbon whiskey + 250 ml Coca-Cola" }, price: 2700 },
      { name: { hu: "Extra Red Bull", en: "Extra Red Bull" }, desc: { hu: "250 ml", en: "250 ml" }, price: 1300, group: { hu: "Extra mixerek és snacks", en: "Extra mixers & snacks" } },
      { name: { hu: "Extra Coca-Cola", en: "Extra Coca-Cola" }, desc: { hu: "250 ml", en: "250 ml" }, price: 900 },
      { name: { hu: "Extra tonic", en: "Extra tonic" }, desc: { hu: "200 ml", en: "200 ml" }, price: 900 },
      { name: { hu: "Narancslé", en: "Orange juice" }, desc: { hu: "1 l kancsó", en: "1 litre jug" }, price: 2500 },
      { name: { hu: "Sajtos nachók", en: "Cheesy nachos" }, desc: { hu: "Guacamolével és joghurtos mártással", en: "With guacamole and yogurt dip" }, price: 2800 },
      { name: { hu: "Popcorn", en: "Popcorn" }, desc: { hu: "Egy tál sós popcorn", en: "A bowl of salted popcorn" }, price: 1200 },
    ],
  },
];

// Group thousands with a non-breaking space by hand: some browsers have no
// hu-HU locale data and would otherwise render "5500 Ft".
export const formatPrice = (n: number) =>
  `${String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\u00A0")} Ft`;
