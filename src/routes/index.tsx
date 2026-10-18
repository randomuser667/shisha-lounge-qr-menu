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

// Decorative smoke puffs that rise up inside the shisha card.
const PUFFS = [
  { left: "10%", delay: "0s", duration: "6.5s", drift: "16px", gold: false },
  { left: "28%", delay: "1.4s", duration: "7.5s", drift: "-12px", gold: true },
  { left: "46%", delay: "0.6s", duration: "6s", drift: "20px", gold: false },
  { left: "64%", delay: "2.2s", duration: "8s", drift: "-16px", gold: true },
  { left: "82%", delay: "1.1s", duration: "7s", drift: "10px", gold: false },
];

function SmokeLayer() {
  return (
    <span className="card-smoke" aria-hidden="true">
      {PUFFS.map((p) => (
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
          return (
            <li key={c.id}>
              <Link
                to="/menu/$category"
                params={{ category: c.id }}
                className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-xl border bg-card/70 p-5 transition active:scale-[0.99] hover:border-gold/50 hover:shadow-glow"
              >
                {c.id === "shisha" && <SmokeLayer />}
                <span className="relative z-10">
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

      <footer className="mt-14 text-center text-xs text-muted-foreground">
        <p>{lang === "hu" ? "Az árak forintban, az ÁFA-t tartalmazzák." : "Prices in HUF, VAT included."}</p>
      </footer>
    </div>
  );
}
