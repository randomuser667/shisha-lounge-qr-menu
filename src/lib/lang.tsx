import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Lang } from "./menu";

type LangCtx = { lang: Lang; setLang: (l: Lang) => void };

const Ctx = createContext<LangCtx>({ lang: "hu", setLang: () => {} });
const KEY = "hashtag-lang";

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>("hu");

  // Read the guest's previous choice after hydration (never during SSR).
  useEffect(() => {
    const saved = window.localStorage.getItem(KEY);
    if (saved === "en" || saved === "hu") setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(KEY, lang);
    document.documentElement.lang = lang;
  }, [lang]);

  return <Ctx.Provider value={{ lang, setLang }}>{children}</Ctx.Provider>;
}

export const useLang = () => useContext(Ctx);

export function LangToggle() {
  const { lang, setLang } = useLang();
  return (
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
  );
}
