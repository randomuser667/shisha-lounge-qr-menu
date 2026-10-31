import { useLang } from "@/lib/lang";

/** Az étlap betöltése közben látható helyőrző kártyák. */
export function MenuLoading() {
  const { lang } = useLang();
  return (
    <div role="status" aria-live="polite" className="mt-6 space-y-3">
      <span className="sr-only">{lang === "hu" ? "Étlap betöltése…" : "Loading menu…"}</span>
      {Array.from({ length: 5 }, (_, i) => (
        <div key={i} className="h-[76px] animate-pulse rounded-xl border bg-card/50" />
      ))}
    </div>
  );
}

/** Akkor jelenik meg, ha az étlap nem tölthető le és nincs mentett példány sem. */
export function MenuError({ onRetry }: { onRetry: () => void }) {
  const { lang } = useLang();
  return (
    <div className="mt-10 rounded-xl border bg-card/70 p-6 text-center">
      <p className="font-display text-lg">
        {lang === "hu" ? "Az étlap most nem tölthető be." : "The menu could not be loaded."}
      </p>
      <p className="mt-2 text-sm text-muted-foreground">
        {lang === "hu"
          ? "Ellenőrizd az internetkapcsolatot, majd próbáld újra."
          : "Check your connection and try again."}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-full border border-gold/50 px-5 py-2 text-sm font-semibold text-gold transition hover:shadow-glow"
      >
        {lang === "hu" ? "Újra" : "Retry"}
      </button>
    </div>
  );
}
