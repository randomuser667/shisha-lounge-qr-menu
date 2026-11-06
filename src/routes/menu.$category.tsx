import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { formatPrice, isUnavailable, type Category } from "@/lib/menu";
import { loadMenu } from "@/lib/public-menu";
import { useLang, LangToggle } from "@/lib/lang";
import { Fragment } from "react";

export const Route = createFileRoute("/menu/$category")({
  head: ({ loaderData }) => {
    const cat = loaderData;
    const title = cat ? `${cat.title.en} — #Hashtag` : "#Hashtag";
    const desc = cat
      ? `${cat.title.en} at #Hashtag shisha lounge — ${cat.items.length} items.`
      : "Menu at #Hashtag shisha lounge.";
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: title },
        { property: "og:description", content: desc },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary" },
      ],
    };
  },
  loader: async ({ params }): Promise<Category> => {
    const menu = await loadMenu();
    const cat = menu.find((c) => c.id === params.category);
    if (!cat) throw notFound();
    return cat;
  },
  staleTime: 30_000,
  component: CategorySlide,
});

type Puff = { left: string; delay: string; duration: string; drift: string; gold?: boolean };

// Big, slow smoke clouds that fill the whole screen behind the shisha slide.
const PAGE_PUFFS: Puff[] = [
  { left: "-10%", delay: "0s", duration: "17s", drift: "70px" },
  { left: "8%", delay: "4s", duration: "20s", drift: "-60px", gold: true },
  { left: "26%", delay: "1.5s", duration: "15s", drift: "80px" },
  { left: "42%", delay: "6s", duration: "22s", drift: "-70px" },
  { left: "58%", delay: "2.5s", duration: "18s", drift: "60px", gold: true },
  { left: "74%", delay: "8s", duration: "19s", drift: "-50px" },
  { left: "88%", delay: "5s", duration: "16s", drift: "40px" },
];

function PageSmoke() {
  return (
    <span className="page-smoke" aria-hidden="true">
      <span className="page-smoke__base" />
      {PAGE_PUFFS.map((p) => (
        <span
          key={p.left}
          className={`page-smoke__puff${p.gold ? " page-smoke__puff--gold" : ""}`}
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

function BackButton({ label }: { label: string }) {
  return (
    <Link
      to="/"
      className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition active:scale-[0.98] hover:border-gold/60 hover:text-gold"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
      {label}
    </Link>
  );
}

function CategorySlide() {
  const cat = Route.useLoaderData();
  const { lang } = useLang();

  return (
    <div className="mx-auto max-w-xl px-5 pb-16">
      {cat.id === "shisha" && <PageSmoke />}

      <div className="sticky top-0 z-10 -mx-5 flex items-center justify-between gap-3 bg-background/85 px-5 py-3 backdrop-blur">
        <BackButton label={lang === "hu" ? "Vissza" : "Back"} />
        <LangToggle />
      </div>

      <section className="pt-8 pb-6 text-center">
        <h1 className="font-display text-4xl font-bold text-gold-gradient">{cat.title[lang]}</h1>
        <p className="mt-2 text-xs uppercase tracking-[0.3em] text-muted-foreground">
          {cat.items.length} {lang === "hu" ? "tétel" : "items"}
        </p>
      </section>

      <ul className="space-y-3">
        {cat.items.map((item, i) => {
          const out = isUnavailable(item);
          return (
            <Fragment key={item.id ?? i}>
              {item.group && (
                <li className="pt-5 pb-1">
                  <h2 className="font-display text-lg text-gold">{item.group[lang]}</h2>
                </li>
              )}
              <li
                className={`rounded-xl border bg-card/70 p-4 animate-in fade-in slide-in-from-bottom-2${out ? " opacity-60" : ""}`}
              >
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <h3 className="min-w-0 font-display text-lg break-words">{item.name[lang]}</h3>
                  <span className="flex shrink-0 items-baseline gap-2 whitespace-nowrap">
                    {out && (
                      <span className="rounded-full border border-destructive/60 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-destructive">
                        {lang === "hu" ? "Elfogyott" : "Sold out"}
                      </span>
                    )}
                    {item.price != null && (
                      <span className={`font-semibold text-gold${out ? " line-through" : ""}`}>
                        {formatPrice(item.price)}
                      </span>
                    )}
                  </span>
                </div>
                {item.desc && <p className="mt-1 text-sm text-muted-foreground">{item.desc[lang]}</p>}
              </li>
            </Fragment>
          );
        })}
      </ul>

      <div className="mt-10 flex justify-center">
        <BackButton label={lang === "hu" ? "Vissza az étlaphoz" : "Back to menu"} />
      </div>

      <footer className="mt-10 text-center text-xs text-foreground/80">
        <p className="inline-block rounded-full bg-background px-3 py-1">
          {lang === "hu"
            ? "Az árak forintban, az ÁFA-t tartalmazzák. Árainkhoz 10% szervítdíjat számítunk fel."
            : "Prices in HUF, VAT included. A 10% service charge is added to our prices."}
        </p>
      </footer>
    </div>
  );
}
