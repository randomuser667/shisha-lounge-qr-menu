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
    title: { hu: "A vízipipát a személyzet készíti el", en: "The shisha is prepared by the staff" },
    body: {
      hu: "A dohányt, a szenet, a csövet és a teljes összeállítást kizárólag a dolgozók kezelik.",
      en: "The tobacco, the coals, the hose and the full setup are handled exclusively by our staff.",
    },
  },
  {
    title: { hu: "Kérés, panasz → személyzet", en: "Requests & complaints → staff" },
    body: {
      hu: "Ha bármire szükséged van (erősebb/lazább füst, más íz, több szén, tiszta szipka, víz, rendelés), fordulj a dolgozókhoz. Ne próbáld magad állítani vagy „javítani” a pipát.",
      en: "If you need anything (stronger/lighter smoke, a different flavour, more coals, a clean mouthpiece, water, another order), ask our staff. Please don't adjust or \"fix\" the pipe yourself.",
    },
  },
  {
    title: { hu: "Tisztaság és rend", en: "Cleanliness & order" },
    body: {
      hu: "A hamutálat és a tálcát használd. Ne dobálj semmit a padlóra, és ne hagyj rendetlenséget az asztalon.",
      en: "Use the ashtray and the tray. Please don't drop anything on the floor and don't leave the table messy.",
    },
  },
  {
    title: { hu: "Általános viselkedés", en: "General behaviour" },
    body: {
      hu: "Légy udvarias a többi vendéggel és a személyzettel. Hangoskodás, vitatkozás, agresszív viselkedés nem megengedett.",
      en: "Be polite to other guests and to the staff. Loud arguing or aggressive behaviour is not allowed.",
    },
  },
  {
    title: { hu: "Saját dohány / saját vízipipa", en: "Own tobacco / own shisha" },
    body: {
      hu: "Saját dohány vagy saját vízipipa behozatala nem engedélyezett (kivéve, ha a hely külön engedi). Kérdezz rá a személyzetnél.",
      en: "Bringing your own tobacco or shisha is not allowed (unless the venue allows it specifically). Ask our staff about it.",
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
