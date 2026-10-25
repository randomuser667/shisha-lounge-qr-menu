import { createFileRoute, Link } from "@tanstack/react-router";
import { menu, formatPrice } from "@/lib/menu";
import { useLang, LangToggle } from "@/lib/lang";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "#Hashtag Shisha Lounge — Étlap / Menu" },
      { name: "description", content: "Shisha flavors, cocktails and drinks at #Hashtag lounge." },
      { property: "og:title", content: "#Hashtag Shisha Lounge — Étlap / Menu" },
      { property: "og:description", content: "Shisha flavors, cocktails and drinks at #Hashtag lounge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MenuOverview,
});

type Puff = { left: string; delay: string; duration: string; drift: string; gold?: boolean };

// Decorative smoke that rises up inside each category card — a different tint
// and rhythm per category.
const SMOKE: Record<string, { variant: string; puffs: Puff[] }> = {
  shisha: {
    variant: "plum",
    puffs: [
      { left: "8%", delay: "0s", duration: "7s", drift: "18px" },
      { left: "24%", delay: "1.5s", duration: "8s", drift: "-14px", gold: true },
      { left: "40%", delay: "0.6s", duration: "6.5s", drift: "22px" },
      { left: "56%", delay: "2.4s", duration: "8.5s", drift: "-18px", gold: true },
      { left: "72%", delay: "1.1s", duration: "7.5s", drift: "12px" },
      { left: "88%", delay: "3s", duration: "7s", drift: "-10px" },
    ],
  },
  cocktails: {
    variant: "gold",
    puffs: [
      { left: "12%", delay: "0.4s", duration: "6s", drift: "-20px" },
      { left: "30%", delay: "2s", duration: "7.5s", drift: "16px" },
      { left: "50%", delay: "1.2s", duration: "6.8s", drift: "-24px" },
      { left: "70%", delay: "2.8s", duration: "8s", drift: "18px" },
      { left: "88%", delay: "0.9s", duration: "6.4s", drift: "-12px" },
    ],
  },
  soft: {
    variant: "cool",
    puffs: [
      { left: "6%", delay: "1s", duration: "9s", drift: "14px" },
      { left: "26%", delay: "0.2s", duration: "7.8s", drift: "-18px" },
      { left: "44%", delay: "2.6s", duration: "8.4s", drift: "20px" },
      { left: "62%", delay: "1.7s", duration: "7.2s", drift: "-14px" },
      { left: "80%", delay: "3.2s", duration: "9.5s", drift: "16px" },
      { left: "94%", delay: "0.7s", duration: "8s", drift: "-8px" },
    ],
  },
  hot: {
    variant: "steam",
    puffs: [
      { left: "14%", delay: "0s", duration: "5.5s", drift: "10px" },
      { left: "34%", delay: "1.3s", duration: "6.2s", drift: "-8px" },
      { left: "52%", delay: "0.5s", duration: "5s", drift: "12px" },
      { left: "70%", delay: "2.1s", duration: "6.6s", drift: "-10px" },
      { left: "86%", delay: "1.6s", duration: "5.8s", drift: "8px" },
    ],
  },
};

function SmokeLayer({ variant, puffs }: { variant: string; puffs: Puff[] }) {
  return (
    <span className={`card-smoke card-smoke--${variant}`} aria-hidden="true">
      <span className="card-smoke__base" />
      {puffs.map((p) => (
        <span
          key={p.left}
          className={`card-smoke__puff${p.gold ? " card-smoke__puff--gold" : ""}`}
          style={
            {
              left: p.left,
              animationDelay: p.delay,
              animationDuration: p.duration,
              "--drift": p.drift,
            } as React.CSSProperties
          }
        />
      ))}
    </span>
  );
}

function MenuOverview() {
  const { lang } = useLang();

  return (
    <div className="mx-auto max-w-xl px-5 pb-16">
      <header className="flex items-center justify-between pt-6">
        <h1 className="font-display text-2xl font-bold text-gold-gradient">#Hashtag</h1>
        <LangToggle />
      </header>

      <p className="mt-10 text-center text-xs uppercase tracking-[0.4em] text-muted-foreground">
        {lang === "hu" ? "Étlap" : "Menu"}
      </p>

      <ul className="mt-6 space-y-3">
        {menu.map((c) => {
          const from = Math.min(...c.items.map((i) => i.price));
           const smoke = SMOKE[c.id] ?? SMOKE["cocktails"];
          return (
            <li key={c.id}>
              <Link
                to="/menu/$category"
                params={{ category: c.id }}
                className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-xl border bg-card/70 p-5 transition active:scale-[0.99] hover:border-gold/50 hover:shadow-glow"
              >
                {smoke && <SmokeLayer variant={smoke.variant} puffs={smoke.puffs} />}
                 <span className="relative z-10 min-w-0 break-words">
                  <span className="block font-display text-2xl">{c.title[lang]}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {c.items.length} {lang === "hu" ? "tétel" : "items"}
                    <span className="text-gold/80">
                      {" · "}
                      {lang === "hu" ? `${formatPrice(from)}-től` : `from ${formatPrice(from)}`}
                    </span>
                  </span>
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="relative z-10 h-5 w-5 shrink-0 text-gold/70 transition group-hover:translate-x-1 group-hover:text-gold"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </Link>
            </li>
          );
        })}
      </ul>

      <Link
        to="/policy"
        className="mt-6 block rounded-xl border border-gold/40 bg-card/70 p-4 text-center font-display text-lg text-gold transition hover:shadow-glow"
      >
        {lang === "hu" ? "Vízipipa szabályzat" : "Shisha policy"}
      </Link>

      <footer className="mt-14 text-center text-xs text-muted-foreground">
        <p>{lang === "hu" ? "Az árak forintban, az ÁFA-t tartalmazzák." : "Prices in HUF, VAT included."}</p>
      </footer>

      <Link
        to="/qr"
        aria-label="QR code"
        className="fixed bottom-4 right-4 z-30 rounded-full border border-gold/50 bg-background px-4 py-2 text-xs font-semibold text-gold shadow-glow"
      >
        QR
      </Link>
    </div>
  );
}
