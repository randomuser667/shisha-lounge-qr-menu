import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { menu, formatPrice, type Lang } from "@/lib/menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "#Hashtag Shisha Lounge — Menu" },
      { name: "description", content: "Shisha flavors, cocktails and drinks at #Hashtag lounge." },
      { property: "og:title", content: "#Hashtag Shisha Lounge — Menu" },
      { property: "og:description", content: "Shisha flavors, cocktails and drinks at #Hashtag lounge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const [lang, setLang] = useState<Lang>("hu");
  const [active, setActive] = useState("shisha");
  const cat = menu.find((c) => c.id === active) ?? menu[0]!;

  return (
    <div className="mx-auto max-w-xl px-5 pb-16">
      <header className="flex items-center justify-between pt-6">
        <span className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Shisha Lounge</span>
        <div className="flex rounded-full border p-1 text-xs">
          {(["hu", "en"] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`rounded-full px-3 py-1 font-semibold uppercase transition ${
                lang === l ? "bg-gold-gradient text-primary-foreground" : "text-muted-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      <section className="py-12 text-center">
        <h1 className="font-display text-6xl font-bold text-gold-gradient">#Hashtag</h1>
        <p className="mt-3 text-muted-foreground">
          {lang === "hu" ? "Dőlj hátra, és válassz ízt." : "Sit back and pick your flavor."}
        </p>
      </section>

      <nav className="sticky top-0 z-10 -mx-5 flex gap-2 overflow-x-auto bg-background/80 px-5 py-3 backdrop-blur">
        {menu.map((c) => (
          <button
            key={c.id}
            onClick={() => setActive(c.id)}
            className={`whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition ${
              active === c.id ? "border-accent bg-accent text-accent-foreground shadow-glow" : "text-muted-foreground"
            }`}
          >
            {c.title[lang]}
          </button>
        ))}
      </nav>

      <ul className="mt-6 space-y-3">
        {cat.items.map((item) => (
          <li key={item.name.en} className="rounded-xl border bg-card/70 p-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-lg">{item.name[lang]}</h3>
              <span className="flex-1 border-b border-dotted" />
              <span className="font-semibold text-gold">{formatPrice(item.price)}</span>
            </div>
            {item.desc && <p className="mt-1 text-sm text-muted-foreground">{item.desc[lang]}</p>}
          </li>
        ))}
      </ul>

      <footer className="mt-14 text-center text-xs text-muted-foreground">
        <p>{lang === "hu" ? "Az árak forintban, az ÁFA-t tartalmazzák." : "Prices in HUF, VAT included."}</p>
        <Link to="/qr" className="mt-3 inline-block text-gold/60 underline">QR</Link>
      </footer>
    </div>
  );
}
