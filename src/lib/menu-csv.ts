/** Egy sor a Google Táblázatból, a menühöz szükséges mezőkre leképezve. */
export type RawItem = {
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

/** Egyszerű CSV parser (idézőjeleket és sortöréseket is kezel). */
export function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;

  // BOM eltávolítása, ha van
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  for (let i = 0; i < text.length; i++) {
    const c = text.charAt(i);
    const next = text.charAt(i + 1);

    if (inQuotes) {
      if (c === '"' && next === '"') {
        cell += '"';
        i++;
      } else if (c === '"') {
        inQuotes = false;
      } else {
        cell += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || (c === "\r" && next === "\n")) {
      row.push(cell);
      if (row.some((x) => x.trim() !== "")) rows.push(row);
      row = [];
      cell = "";
      if (c === "\r") i++;
    } else {
      cell += c;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    if (row.some((x) => x.trim() !== "")) rows.push(row);
  }
  return rows;
}

/** "6 000 Ft", "6.000", "6000" → 6000 (a forint egész szám). */
function parsePrice(value: string): number {
  const digits = value.replace(/\D/g, "");
  return digits ? parseInt(digits, 10) : 0;
}

/** A táblázat CSV-jéből menütételek. Az "Elérhető = nem" sorok kimaradnak. */
export function parseMenuCsv(csv: string): RawItem[] {
  const rows = parseCSV(csv);
  const headerRow = rows[0];
  if (!headerRow || rows.length < 2) throw new Error("Üres vagy hibás CSV");

  const headers = headerRow.map((h) => h.trim());

  return rows
    .slice(1)
    .map((r) => {
      const obj: Record<string, string> = {};
      headers.forEach((h, i) => {
        obj[h] = (r[i] ?? "").trim();
      });
      return obj;
    })
    .filter((d) => (d["Elérhető"] || "").toLowerCase() !== "nem")
    .map((d) => ({
      category: d["Kategória"] || "",
      groupHu: d["Csoport (HU)"] || "",
      groupEn: d["Csoport (EN)"] || "",
      name: d["Név"] || "",
      nameEn: d["Név (EN)"] || "",
      desc: d["Leírás (HU)"] || "",
      descEn: d["Leírás (EN)"] || "",
      price: parsePrice(d["Ár (Ft)"] || ""),
      popular: (d["Legtöbbet rendelt"] || "").toLowerCase() === "igen",
    }));
}
