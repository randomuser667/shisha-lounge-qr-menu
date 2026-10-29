import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const outPath = join(root, 'src/lib/menu-data.ts');

const url = process.env.MENU_CSV_URL;

if (!url) {
  console.error('[menu] MENU_CSV_URL nincs beállítva. A régi itallapot használjuk.');
  process.exit(0);
}

console.log('[menu] CSV letöltése:', url);

try {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const csv = await res.text();

  // Egyszerű CSV parser (idézőjelekkel is bír)
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let cell = '';
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];

      if (inQuotes) {
        if (c === '"' && next === '"') {
          cell += '"';
          i++;
        } else if (c === '"') {
          inQuotes = false;
        } else {
          cell += c;
        }
      } else {
        if (c === '"') {
          inQuotes = true;
        } else if (c === ',') {
          row.push(cell);
          cell = '';
        } else if (c === '\n' || (c === '\r' && next === '\n')) {
          row.push(cell);
          if (row.some(x => x.trim() !== '')) rows.push(row);
          row = [];
          cell = '';
          if (c === '\r') i++;
        } else {
          cell += c;
        }
      }
    }
    if (cell || row.length) {
      row.push(cell);
      if (row.some(x => x.trim() !== '')) rows.push(row);
    }
    return rows;
  }

  const rows = parseCSV(csv);
  if (rows.length < 2) throw new Error('Üres vagy hibás CSV');

  const headers = rows[0].map(h => h.trim());
  const data = rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = (r[i] ?? '').trim();
    });
    return obj;
  });

  // Csak a látható tételeket tartjuk meg
  const items = data
    .filter(d => (d['Elérhető'] || '').toLowerCase() !== 'nem')
    .map(d => ({
      category: d['Kategória'] || '',
      groupHu: d['Csoport (HU)'] || '',
      groupEn: d['Csoport (EN)'] || '',
      name: d['Név'] || '',
      nameEn: d['Név (EN)'] || '',
      desc: d['Leírás (HU)'] || '',
      descEn: d['Leírás (EN)'] || '',
      price: Number(d['Ár (Ft)']) || 0,
    }));

  const content = `// Automatikusan generált – ne szerkeszd kézzel!
// Forrás: Google Táblázat
export const menuData = ${JSON.stringify(items, null, 2)} as const;
`;

  // Mappa létrehozása ha kell
  const dir = dirname(outPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  writeFileSync(outPath, content, 'utf8');
  console.log(`[menu] ${items.length} tétel kiírva → src/lib/menu-data.ts`);
} catch (err) {
  console.error('[menu] Hiba a CSV letöltésekor:', err.message);
  console.error('[menu] A legutóbbi sikeres itallapot használjuk.');
  process.exit(0); // ne törjük el a buildet
}
