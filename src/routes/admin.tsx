import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";

import {
  adminGetMenu,
  adminLogin,
  adminLogout,
  adminSaveMenu,
  adminSession,
} from "@/lib/admin.functions";
import { formatPrice, isUnavailable, type Category, type MenuItem } from "@/lib/menu";
import {
  deleteItem,
  moveItem,
  patchItem,
  revOf,
  upsertItem,
  type EditResult,
  type ItemInput,
  type ItemPatch,
} from "@/lib/menu-edit";

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
// Numeric fields accept digits only, so a stray letter can never wipe a price.
const digits = (v: string) => v.replace(/\D/g, "");
const inputCls =
  "w-full rounded-lg border bg-background/60 px-3 py-2 text-sm outline-none focus:border-gold/60";
const btnCls =
  "rounded-full border px-4 py-2 text-sm font-medium transition hover:border-gold/60 hover:text-gold disabled:opacity-50";
const goldBtnCls =
  "rounded-full bg-gold-gradient px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50";

function AdminPage() {
  const [phase, setPhase] = useState<Phase>("loading");

  useEffect(() => {
    // The password must never travel over plain http: switch to https first.
    const { protocol, hostname, href } = window.location;
    const local = hostname === "localhost" || hostname === "127.0.0.1";
    if (protocol === "http:" && !local) {
      window.location.replace(href.replace(/^http:/, "https:"));
      return;
    }
    adminSession()
      .then((s) => setPhase(!s.configured ? "unconfigured" : s.authed ? "app" : "login"))
      .catch(() => setPhase("login"));
  }, []);

  return (
    <div className="mx-auto max-w-2xl px-4 pb-20 pt-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold text-gold-gradient">#Hashtag admin</h1>
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
  // saved = what the guests see now; draft = the working copy. Nothing reaches
  // the live menu until "Mentés" is pressed.
  const [saved, setSaved] = useState<Category[] | null>(null);
  const [draft, setDraft] = useState<Category[] | null>(null);
  const [catId, setCatId] = useState<string>("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [expired, setExpired] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [editing, setEditing] = useState<string | "new" | null>(null);

  // Compared by content (not key order), so toggling something back counts as "no change".
  const dirty = useMemo(
    () => saved !== null && draft !== null && revOf(saved) !== revOf(draft),
    [saved, draft],
  );

  useEffect(() => {
    let alive = true;
    adminGetMenu()
      .then((r) => {
        if (!alive) return;
        if (r.ok) {
          setSaved(r.menu);
          setDraft(r.menu);
        } else if (r.error === "unauthorized") onLoggedOut();
        else setError(r.error);
      })
      .catch(() => alive && setError("Nem sikerült csatlakozni, próbáld újra."));
    return () => {
      alive = false;
    };
  }, [onLoggedOut]);

  useEffect(() => {
    if (draft && !draft.some((c) => c.id === catId)) setCatId(draft[0]?.id ?? "");
  }, [draft, catId]);

  // Warn before the browser tab is closed with unsaved changes.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  // Applies an edit to the draft only (nothing is sent to the server).
  const edit = (apply: (m: Category[]) => EditResult): boolean => {
    if (!draft) return false;
    const r = apply(draft);
    setNote("");
    if (r.ok) {
      setError("");
      setDraft(r.menu);
      return true;
    }
    setError(r.error);
    return false;
  };

  const save = async () => {
    if (!draft || !saved || saving) return;
    setSaving(true);
    setError("");
    setNote("");
    try {
      const r = await adminSaveMenu({ data: { menu: draft, baseRev: revOf(saved) } });
      if (r.ok) {
        setSaved(r.menu);
        setDraft(r.menu);
        setEditing(null);
        setNote("Mentve – a vendégek már az új étlapot látják.");
      } else if (r.error === "unauthorized") {
        setExpired(true);
      } else {
        setError(r.error);
        if ("conflict" in r && r.conflict) setConflict(true);
      }
    } catch {
      setError("Nem sikerült csatlakozni, a módosítások nincsenek elmentve. Próbáld újra.");
    } finally {
      setSaving(false);
    }
  };

  const discard = () => {
    if (!saved) return;
    if (!window.confirm("Biztosan elveted az összes nem mentett módosítást?")) return;
    setDraft(saved);
    setEditing(null);
    setError("");
    setNote("");
  };

  const logout = async () => {
    if (dirty && !window.confirm("Nem mentett módosításaid vannak. Biztosan kilépsz mentés nélkül?")) return;
    await adminLogout().catch(() => undefined);
    onLoggedOut();
  };

  if (!draft || !saved) {
    return (
      <div className="mt-10 text-center text-muted-foreground">
        {error ? <p className="text-destructive">{error}</p> : "Étlap betöltése…"}
      </div>
    );
  }

  const cat = draft.find((c) => c.id === catId) ?? draft[0];

  return (
    <div className="mt-4">
      {expired && (
        <div className="mb-4 rounded-xl border border-gold/40 p-4">
          <p className="text-sm">
            A munkameneted lejárt. A módosításaid itt megmaradtak – lépj be újra, majd nyomd meg újra a
            Mentés gombot.
          </p>
          <LoginForm
            onDone={() => {
              setExpired(false);
              setError("");
            }}
          />
        </div>
      )}

      <div className="sticky top-0 z-20 -mx-4 flex flex-wrap items-center gap-3 border-b bg-background/90 px-4 py-3 backdrop-blur">
        <p className={`mr-auto text-sm ${dirty ? "font-semibold text-gold" : "text-muted-foreground"}`}>
          {dirty ? "Nem mentett módosítások" : "Minden mentve"}
        </p>
        <button className={btnCls} disabled={!dirty || saving} onClick={discard}>
          Elvetés
        </button>
        <button className={goldBtnCls} disabled={!dirty || saving || expired || conflict} onClick={save}>
          {saving ? "Mentés…" : "Mentés"}
        </button>
        <button className={btnCls} onClick={logout}>
          Kilépés
        </button>
      </div>

      {note && <p className="mt-3 rounded-lg border border-gold/40 p-3 text-sm text-gold">{note}</p>}
      {error && (
        <div className="mt-3 rounded-lg border border-destructive/50 p-3 text-sm text-destructive">
          <p>{error}</p>
          {conflict && (
            <button className={`${btnCls} mt-2`} onClick={() => window.location.reload()}>
              Újratöltés
            </button>
          )}
        </div>
      )}

      <nav className="mt-4 flex flex-wrap gap-2">
        {draft.map((c) => (
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

      <div className="mt-5 flex items-center justify-between">
        <h2 className="font-display text-xl">
          {cat.title.hu} <span className="text-sm text-muted-foreground">({cat.items.length})</span>
        </h2>
        <button className={goldBtnCls} onClick={() => setEditing("new")}>
          + Új termék
        </button>
      </div>

      {editing === "new" && (
        <ItemForm
          key="new"
          onCancel={() => setEditing(null)}
          onSave={(input) => {
            if (edit((m) => upsertItem(m, cat.id, input))) setEditing(null);
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
                onCancel={() => setEditing(null)}
                onSave={(input) => {
                  if (edit((m) => upsertItem(m, cat.id, { ...input, id: item.id }))) setEditing(null);
                }}
                onDelete={() => {
                  if (!window.confirm(`Biztosan törlöd: ${item.name.hu}?`)) return;
                  if (edit((m) => deleteItem(m, cat.id, item.id!))) setEditing(null);
                }}
              />
            ) : (
              <ItemRow
                item={item}
                first={i === 0}
                last={i === cat.items.length - 1}
                onEdit={() => setEditing(item.id ?? null)}
                onPatch={(patch) => edit((m) => patchItem(m, cat.id, item.id!, patch))}
                onMove={(dir) => edit((m) => moveItem(m, cat.id, item.id!, dir))}
              />
            )}
          </li>
        ))}
      </ul>

      <p className="mt-8 text-xs text-muted-foreground">
        A módosítások addig csak ezen az oldalon látszanak, amíg meg nem nyomod a <b>Mentés</b>{" "}
        gombot – a vendégek csak mentés után látják őket (a már megnyitott oldalakon legfeljebb ~30
        mp múlva). Az „Elfogyott” gomb és a készlet 0 is elfogyottként jelenik meg. A készlet mező
        üresen hagyható – ilyenkor nem követjük a darabszámot.
      </p>
    </div>
  );
}

function ItemRow({
  item,
  first,
  last,
  onEdit,
  onPatch,
  onMove,
}: {
  item: MenuItem;
  first: boolean;
  last: boolean;
  onEdit: () => void;
  onPatch: (patch: ItemPatch) => boolean;
  onMove: (dir: 1 | -1) => boolean;
}) {
  const [price, setPrice] = useState(item.price != null ? String(item.price) : "");
  const [stock, setStock] = useState(item.stock != null ? String(item.stock) : "");

  // Re-sync when the saved item changes (after a save or reload).
  useEffect(() => setPrice(item.price != null ? String(item.price) : ""), [item.price]);
  useEffect(() => setStock(item.stock != null ? String(item.stock) : ""), [item.stock]);

  const out = isUnavailable(item);
  const toNum = (v: string) => (v === "" ? null : Number(v));

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
            onChange={(e) => {
              const v = digits(e.target.value);
              setPrice(v);
              onPatch({ price: toNum(v) });
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
            onChange={(e) => {
              const v = digits(e.target.value);
              setStock(v);
              onPatch({ stock: toNum(v) });
            }}
          />
        </label>
        <div className="ml-auto flex gap-2">
          <button className={btnCls} disabled={first} onClick={() => onMove(-1)} aria-label="Feljebb">
            ↑
          </button>
          <button className={btnCls} disabled={last} onClick={() => onMove(1)} aria-label="Lejjebb">
            ↓
          </button>
          <button className={btnCls} onClick={onEdit}>
            Szerkeszt
          </button>
        </div>
      </div>
    </div>
  );
}

function ItemForm({
  item,
  onSave,
  onCancel,
  onDelete,
}: {
  item?: MenuItem;
  onSave: (input: ItemInput) => void;
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
  const toNum = (v: string) => (v === "" ? null : Number(v));

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
          <input className={`${inputCls} mt-1`} inputMode="numeric" value={f.price} onChange={(e) => setF((p) => ({ ...p, price: digits(e.target.value) }))} />
        </label>
        <label className="text-xs text-muted-foreground">
          Készlet (db) – üresen hagyható
          <input className={`${inputCls} mt-1`} inputMode="numeric" value={f.stock} onChange={(e) => setF((p) => ({ ...p, stock: digits(e.target.value) }))} />
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
        <button className={goldBtnCls}>Alkalmaz</button>
        <button type="button" className={btnCls} onClick={onCancel}>
          Mégse
        </button>
        {onDelete && (
          <button
            type="button"
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
