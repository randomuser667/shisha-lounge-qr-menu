import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { menu, formatPrice, type Category } from "@/lib/menu";
import { useLang, LangToggle } from "@/lib/lang";

export const Route = createFileRoute("/menu/$category")({
  head: ({ params }) => {
    const cat = menu.find((c) => c.id === params.category);
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
  loader: ({ params }): Category => {
    const cat = menu.find((c) => c.id === params.category);
    if (!cat) throw notFound();
    return cat;
  },
  component: CategorySlide,
});

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
  const { category } = Route.useParams();
  // The loader already 404s unknown slugs, so this lookup always hits.
  const cat = menu.find((c) => c.id === category)!;
  const { lang } = useLang();

  return (
    <div className="mx-auto max-w-xl px-5 pb-16">
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
        {cat.items.map((item) => (
          <li
            key={item.name.en}
            className="rounded-xl border bg-card/70 p-4 animate-in fade-in slide-in-from-bottom-2"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="font-display text-lg">{item.name[lang]}</h3>
              <span className="flex-1 border-b border-dotted" />
              <span className="font-semibold text-gold">{formatPrice(item.price)}</span>
            </div>
            {item.desc && <p className="mt-1 text-sm text-muted-foreground">{item.desc[lang]}</p>}
          </li>
        ))}
      </ul>

      <div className="mt-10 flex justify-center">
        <BackButton label={lang === "hu" ? "Vissza az étlaphoz" : "Back to menu"} />
      </div>

      <footer className="mt-10 text-center text-xs text-muted-foreground">
        <p>{lang === "hu" ? "Az árak forintban, az ÁFA-t tartalmazzák." : "Prices in HUF, VAT included."}</p>
      </footer>
    </div>
  );
}
