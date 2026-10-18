import { createFileRoute, Link } from "@tanstack/react-router";
import { useLang, LangToggle } from "@/lib/lang";

export const Route = createFileRoute("/policy")({
  head: () => ({
    meta: [
      { title: "#Hashtag — Vízipipa szabályzat / Shisha policy" },
      { name: "description", content: "House rules for enjoying shisha at #Hashtag lounge." },
      { property: "og:title", content: "#Hashtag — Shisha policy" },
      { property: "og:description", content: "House rules for enjoying shisha at #Hashtag lounge." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PolicyPage,
});

const RULES = [
  { hu: "Vízipipát csak 18 éven felüli vendégeink rendelhetnek. Kérésre igazolni kell az életkort.", en: "Shisha is served only to guests aged 18+. ID may be requested." },
  { hu: "Várandós vendégeknek nem szolgálunk fel vízipipát.", en: "We do not serve shisha to pregnant guests." },
  { hu: "A pipát kizárólag a személyzet helyezheti át, töltheti újra és cserélheti a szenet.", en: "Only staff may move, refill or change the coals of a pipe." },
  { hu: "Saját dohány vagy pipa behozatala nem engedélyezett.", en: "Bringing your own tobacco or pipe is not allowed." },
  { hu: "Minden vendég higiéniai szipkát kap — kérjük, ne cseréljétek egymás között.", en: "Every guest gets a hygienic mouthpiece — please do not share them." },
  { hu: "Egy pipa kb. 60–90 percig élvezhető; szénfrissítés ingyenes.", en: "A pipe lasts about 60–90 minutes; coal refreshes are free." },
  { hu: "A pipában okozott kárt (pl. törött üveg) felszámíthatjuk.", en: "Damage to the pipe (e.g. broken glass) may be charged." },
  { hu: "Rosszullét esetén azonnal szólj a személyzetnek.", en: "If you feel unwell, tell the staff immediately." },
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
        {lang === "hu" ? "Vízipipa szabályzat" : "Shisha policy"}
      </h1>
      <ol className="mt-6 space-y-3">
        {RULES.map((r, i) => (
          <li key={i} className="flex gap-3 rounded-xl border bg-card/70 p-4 text-sm">
            <span className="font-display text-gold">{i + 1}.</span>
            <span>{r[lang]}</span>
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
