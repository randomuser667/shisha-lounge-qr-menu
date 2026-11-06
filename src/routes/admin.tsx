import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import {
  adminDeleteItem,
  adminGetMenu,
  adminLogin,
  adminLogout,
  adminMoveItem,
  adminPatchItem,
  adminSaveItem,
  adminSession,
} from "@/lib/admin.functions";
import { formatPrice, isUnavailable, type Category, type MenuItem } from "@/lib/menu";

// Not linked from anywhere on the public site and kept out of search engines.
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "#Hashtag — Admin" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

type Phase = "loading" | "unconfigured" | "login" | "app";
type Result = { ok: true; menu: Category[] } | { ok: false; error: string };

const inputCls =
  "w-full rounded-lg border bg-background/60 px-3 py-2 text-sm outline-none focus:border-gold/60";
const btnCls =
  "rounded-full border px-4 py-2 text-sm font-medium transition hover:border-gold/60 hover:text-gold disabled:opacity-50";
const goldBtnCls =
  "rounded-full bg-gold-gradient px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50";

function AdminPage() {
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    adminSession()
      .then((s) => setPhase(!s.configured ? "unconfigured" : s.authed ? "app" : "login"))
      .catch(() => setPhase("login"));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gold-gradient">#Hashtag admin</h1>
        {phase === "app" && (
          <button
            className={btnCls}
            onClick={async () => {
              await adminLogout().catch(() => undefined);
              setPhase("login");
            }}
          >
            Kilépés
          </button>
        )}
      </header>

      {phase === "loading" && <p className="mt-10 text-center text-muted-foreground">Betöltés…</p>}
      {phase === "unconfigured" && (
        <p className="mt-10 rounded-xl border bg-card/70 p-5 text-sm text-muted-foreground">
          A belépés még nincs beállítva. A Netlify-ban add meg az <b>ADMIN_USER</b>,{" "}
          <b>ADMIN_PASSWORD</b> és <b>ADMIN_SESSION_SECRET</b> (legalább 32 karakter)
          környezeti változókat, majd indíts új deployt.
        </p>
      )}
      {phase === "login" && <LoginForm onDone={() => setPhase("app")} />}
      {phase === "app" && <Dashboard onLoggedOut={() => setPhase("login")} />}
    </div>
  );
}

function LoginForm({ onDone }: { onDone: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  return (
    <form
      className="mx-auto mt-12 max-w-sm space-y-4 rounded-xl border bg-card/70 p-6"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        try {
          const r = await adminLogin({ data: { username, password } });
          if (r.ok) onDone();
          else setError(r.error);
        } catch {
          setError("Nem sikerült csatlakozni, próbáld újra.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2 className="font-display text-xl">Belépés</h2>
      <label className="block text-sm">
        Felhasználónév
        <input
          className={`${inputCls} mt-1`}
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </label>
      <label className="block text-sm">
        Jelszó
        <input
          className={`${inputCls} mt-1`}
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <button className={`${goldBtnCls} w-full`} disabled={busy || !username || !password}>
        {busy ? "Belépés…" : "Belépés"}
      </button>
    </form>
  );
}

function Dashboard({ onLoggedOut }: { onLoggedOut: () => void }) {
  const [menu, setMenu] = useState<Category[] | null>(null);
  const [catId, setCatId] = useState<string>("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState<string | "new" | null>(null);

  // Runs a server call; applies the new menu or shows the error.
  const run = useCallback(
    async (call: () => Promise<Result>): Promise<boolean> => {
      setBusy(true);
      setError("");
      try {
        const r = await call();
        if (r.ok) {
          setMenu(r.menu);
          return true;
        }
        if (r.error === "unauthorized") onLoggedOut();
        else setError(r.error);
        return false;
      } catch {
        setError("Nem sikerült csatlakozni, próbáld újra.");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [onLoggedOut],
  );

  useEffect(() => {
    run(async () => {
      const r = await adminGetMenu();
      return r.ok ? { ok: true, menu: r.menu } : r;
    });
  }, [run]);

  useEffect(() => {
    if (menu && !menu.some((c) => c.id === catId)) setCatId(menu[0]?.id ?? "");
  }, [menu, catId]);

  if (!menu) {
    return (
      <div className="mt-10 text-center text-muted-foreground">
        {error ? <p className="text-destructive">{error}</p> : "Étlap betöltése…"}
      </div>
    );
  }

  const cat = menu.find((c) => c.id === catId) ?? menu[0];

  return (
    <div className="mt-6">
      <nav className="flex flex-wrap gap-2">
        {menu.map((c) => (
          <button
            key={c.id}
            onClick={() => {
              setCatId(c.id);
              setEditing(null);
            }}
            className={`rounded-full border px-4 py-1.5 text-sm transition ${
              c.id === cat.id ? "border-gold bg-gold/10 text-gold" : "hover:border-gold/50"
            }`}
          >
            {c.title.hu}
          </button>
        ))}
      </nav>

      {error && (
        <p className="mt-4 rounded-lg border border-destructive/50 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-5 flex items-center justify-between">
        <h2 className="font-display text-xl">
          {cat.title.hu} <span className="text-sm text-muted-foreground">({cat.items.length})</span>
        </h2>
        <button className={goldBtnCls} disabled={busy} onClick={() => setEditing("new")}>
          + Új termék
        </button>
      </div>

      {editing === "new" && (
        <ItemForm
          key="new"
          busy={busy}
          onCancel={() => setEditing(null)}
          onSave={async (item) => {
            const ok = await run(() => adminSaveItem({ data: { categoryId: cat.id, item } }));
            if (ok) setEditing(null);
          }}
        />
      )}

      <ul className="mt-4 space-y-2">
        {cat.items.map((item, i) => (
          <li key={item.id ?? i}>
            {item.group && (
              <p className="pb-1 pt-3 font-display text-sm text-gold">{item.group.hu}</p>
            )}
            {editing === item.id ? (
              <ItemForm
                key={item.id}
                item={item}
                busy={busy}
                onCancel={() => setEditing(null)}
                onSave={async (input) => {
                  const ok = await run(() =>
                    adminSaveItem({ data: { categoryId: cat.id, item: { ...input, id: item.id } } }),
                  );
                  if (ok) setEditing(null);
                }}
                onDelete={async () => {
                  if (!window.confirm(`Biztosan törlöd: ${item.name.hu}?`)) return;
                  const ok = await run(() =>
                    adminDeleteItem({ data: { categoryId: cat.id, itemId: item.id! } }),
                  );
                  if (ok) setEditing(null);
                }}
              />
            ) : (
              <ItemRow
                item={item}
                busy={busy}
                first={i === 0}
                last={i === cat.items.length - 1}
                onEdit={() => setEditing(item.id ?? null)}
                onPatch={(patch) =>
                  run(() => adminPatchItem({ data: { categoryId: cat.id, itemId: item.id!, patch } }))
                }
                onMove={(dir) =>
                  run(() => adminMoveItem({ data: { categoryId: cat.id, itemId: item.id!, dir } }))
                }
              />
            )}
          </li>
        ))}
      </ul>

      <p className="mt-8 text-xs text-muted-foreground">
        A módosítások mentés után azonnal megjelennek a vendégeknek (legfeljebb ~30 mp múlva a már
        megnyitott oldalakon). Az „Elfogyott” gomb és a készlet 0 is elfogyottként jelenik meg.
        A készlet mező üresen hagyható – ilyenkor nem követjük a darabszámot.
      </p>
    </div>
  );
}

function ItemRow({
  item,
  busy,
  first,
  last,
  onEdit,
  onPatch,
  onMove,
}: {
  item: MenuItem;
  busy: boolean;
  first: boolean;
  last: boolean;
  onEdit: () => void;
  onPatch: (patch: { soldOut?: boolean; price?: number | null; stock?: number | null }) => Promise<boolean>;
  onMove: (dir: 1 | -1) => Promise<boolean>;
}) {
  const [price, setPrice] = useState(item.price != null ? String(item.price) : "");
  const [stock, setStock] = useState(item.stock != null ? String(item.stock) : "");

  // Re-sync when the saved item changes (after a save or reload).
  useEffect(() => setPrice(item.price != null ? String(item.price) : ""), [item.price]);
  useEffect(() => setStock(item.stock != null ? String(item.stock) : ""), [item.stock]);

  const out = isUnavailable(item);
  const toNum = (v: string) => (v.trim() === "" ? null : Number(v.replace(/\s/g, "")));

  return (
    <div className={`rounded-xl border bg-card/70 p-3 ${out ? "border-destructive/40" : ""}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-words font-display text-base">{item.name.hu}</p>
          <p className="break-words text-xs text-muted-foreground">
            {item.name.en !== item.name.hu ? `${item.name.en} · ` : ""}
            {item.price != null ? formatPrice(item.price) : "nincs ár"}
          </p>
        </div>
        <button
          disabled={busy}
          onClick={() => onPatch({ soldOut: !item.soldOut })}
          className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50 ${
            out
              ? "border-destructive bg-destructive/15 text-destructive"
              : "hover:border-gold/60 hover:text-gold"
          }`}
          title="Kattintásra elfogyott / újra kapható"
        >
          {item.soldOut ? "Elfogyott ✓" : out ? "Elfogyott (készlet 0)" : "Elfogyott?"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="text-xs text-muted-foreground">
          Ár (Ft)
          <input
            className={`${inputCls} mt-1 w-28`}
            inputMode="numeric"
            value={price}
            disabled={busy}
            onChange={(e) => setPrice(e.target.value)}
            onBlur={() => {
              const n = toNum(price);
              if (n !== (item.price ?? null)) onPatch({ price: n });
            }}
          />
        </label>
        <label className="text-xs text-muted-foreground">
          Készlet (db, opcionális)
          <input
            className={`${inputCls} mt-1 w-28`}
            inputMode="numeric"
            placeholder="—"
            value={stock}
            disabled={busy}
            onChange={(e) => setStock(e.target.value)}
            onBlur={() => {
              const n = toNum(stock);
              if (n !== (item.stock ?? null)) onPatch({ stock: n });
            }}
          />
        </label>
        <div className="ml-auto flex gap-2">
          <button className={btnCls} disabled={busy || first} onClick={() => onMove(-1)} aria-label="Feljebb">
            ↑
          </button>
          <button className={btnCls} disabled={busy || last} onClick={() => onMove(1)} aria-label="Lejjebb">
            ↓
          </button>
          <button className={btnCls} disabled={busy} onClick={onEdit}>
            Szerkeszt
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemForm({
  item,
  busy,
  onSave,
  onCancel,
  onDelete,
}: {
  item?: MenuItem;
  busy: boolean;
  onSave: (input: {
    nameHu: string;
    nameEn: string;
    descHu: string;
    descEn: string;
    groupHu: string;
    groupEn: string;
    price: number | null;
    stock: number | null;
    soldOut: boolean;
  }) => void;
  onCancel: () => void;
  onDelete?: () => void;
}) {
  const [f, setF] = useState({
    nameHu: item?.name.hu ?? "",
    nameEn: item?.name.en ?? "",
    descHu: item?.desc?.hu ?? "",
    descEn: item?.desc?.en ?? "",
    groupHu: item?.group?.hu ?? "",
    groupEn: item?.group?.en ?? "",
    price: item?.price != null ? String(item.price) : "",
    stock: item?.stock != null ? String(item.stock) : "",
    soldOut: item?.soldOut === true,
  });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) =>
    setF((p) => ({ ...p, [k]: e.target.value }));
  const toNum = (v: string) => (v.trim() === "" ? null : Number(v.replace(/\s/g, "")));

  return (
    <form
      className="mt-2 space-y-3 rounded-xl border border-gold/40 bg-card/80 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave({ ...f, price: toNum(f.price), stock: toNum(f.stock) });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-muted-foreground">
          Név (magyar)
          <input className={`${inputCls} mt-1`} value={f.nameHu} onChange={set("nameHu")} required={!f.nameEn} />
        </label>
        <label className="text-xs text-muted-foreground">
          Név (angol)
          <input className={`${inputCls} mt-1`} value={f.nameEn} onChange={set("nameEn")} />
        </label>
        <label className="text-xs text-muted-foreground">
          Leírás (magyar)
          <input className={`${inputCls} mt-1`} value={f.descHu} onChange={set("descHu")} />
        </label>
        <label className="text-xs text-muted-foreground">
          Leírás (angol)
          <input className={`${inputCls} mt-1`} value={f.descEn} onChange={set("descEn")} />
        </label>
        <label className="text-xs text-muted-foreground">
          Ár (Ft)
          <input className={`${inputCls} mt-1`} inputMode="numeric" value={f.price} onChange={set("price")} />
        </label>
        <label className="text-xs text-muted-foreground">
          Készlet (db) – üresen hagyható
          <input className={`${inputCls} mt-1`} inputMode="numeric" value={f.stock} onChange={set("stock")} />
        </label>
        <label className="text-xs text-muted-foreground">
          Szekciócím fölötte (magyar, opcionális)
          <input className={`${inputCls} mt-1`} value={f.groupHu} onChange={set("groupHu")} />
        </label>
        <label className="text-xs text-muted-foreground">
          Szekciócím fölötte (angol)
          <input className={`${inputCls} mt-1`} value={f.groupEn} onChange={set("groupEn")} />
        </label>
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={f.soldOut}
          onChange={(e) => setF((p) => ({ ...p, soldOut: e.target.checked }))}
        />
        Elfogyott
      </label>
      <div className="flex flex-wrap items-center gap-2">
        <button className={goldBtnCls} disabled={busy}>
          {busy ? "Mentés…" : "Mentés"}
        </button>
        <button type="button" className={btnCls} onClick={onCancel}>
          Mégse
        </button>
        {onDelete && (
          <button
            type="button"
            disabled={busy}
            onClick={onDelete}
            className="ml-auto rounded-full border border-destructive/60 px-4 py-2 text-sm text-destructive transition hover:bg-destructive/10 disabled:opacity-50"
          >
            Törlés
          </button>
        )}
      </div>
    </form>
  );
}
