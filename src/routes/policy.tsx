import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang, LangToggle } from "@/lib/lang";

export const Route = createFileRoute("/policy")({
  head: () => ({
    meta: [
      { title: "#Hashtag — Vízipipa Bár Házirend / Shisha House Rules" },
      { name: "description", content: "House rules for shisha at #Hashtag lounge." },
      { property: "og:title", content: "#Hashtag — Shisha House Rules" },
      { property: "og:description", content: "House rules for shisha at #Hashtag lounge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PolicyPage,
});

const RULES = [
  {
    title: { hu: "Csak 18 éven felülieknek", en: "Only for guests over 18" },
    body: {
      hu: "Vízipipát csak 18 éven felüli vendégeink rendelhetnek. Kérésre igazolni kell az életkort.",
      en: "Shisha is served only to guests aged 18+. ID may be requested.",
    },
  },
  {
    title: { hu: "A pipát a személyzet kezeli", en: "The staff handle the pipe" },
    body: {
      hu: "A pipát kizárólag a személyzet helyezheti át, töltheti újra és cserélheti a szenet.",
      en: "Only staff may move, refill or change the coals of a pipe.",
    },
  },
  {
    title: { hu: "Higiéniai szipka", en: "Hygienic mouthpiece" },
    body: {
      hu: "Minden pipához új, eldobható szipkát kapsz — higiéniai okokból a használata kötelező.",
      en: "Every shisha comes with a new disposable mouthpiece tip — using it is compulsory for hygiene reasons.",
    },
  },
  {
    title: { hu: "Kár", en: "Damage" },
    body: {
      hu: "A pipában vagy a berendezésben okozott kárt felszámítjuk.",
      en: "Damage caused to the pipe or the equipment will be charged.",
    },
  },
];

function PolicyPage() {
  const { lang } = useLang();
  return (
    <div className="mx-auto max-w-xl px-5 pb-24">
      <header className="sticky top-0 z-20 -mx-5 flex items-center justify-between bg-background/90 px-5 py-4 backdrop-blur">
        <Link to="/" className="text-sm font-semibold text-gold">← {lang === "hu" ? "Vissza" : "Back"}</Link>
        <LangToggle />
      </header>
      <h1 className="mt-6 font-display text-3xl text-gold-gradient">
        {lang === "hu" ? "Vízipipa Bár Házirend" : "Shisha Bar House Rules"}
      </h1>
      <ol className="mt-6 space-y-3">
        {RULES.map((r, i) => (
          <li key={i} className="flex gap-3 rounded-xl border bg-card/70 p-4 text-sm">
            <span className="font-display text-gold">{i + 1}.</span>
            <span>
              <span className="block font-display text-base text-foreground">{r.title[lang]}</span>
              <span className="mt-1 block text-muted-foreground">{r.body[lang]}</span>
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-10 text-center">
        <Link to="/" className="rounded-full border px-6 py-2 text-sm font-semibold text-gold">
          ← {lang === "hu" ? "Vissza az étlaphoz" : "Back to menu"}
        </Link>
      </div>
    </div>
  );
}
