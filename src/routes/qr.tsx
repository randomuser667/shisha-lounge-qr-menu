import { createFileRoute } from "@tanstack/react-router";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

export const Route = createFileRoute("/qr")({
  head: () => ({
    meta: [
      { title: "#Hashtag — Table QR code" },
      { name: "description", content: "Printable QR code that opens the #Hashtag menu." },
      { property: "og:title", content: "#Hashtag — Table QR code" },
      { property: "og:description", content: "Printable QR code that opens the #Hashtag menu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: QrPage,
});

function QrPage() {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.origin + "/"), []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-5 text-center">
      <h1 className="font-display text-5xl font-bold text-gold-gradient">#Hashtag</h1>
      <p className="text-muted-foreground">Scan for the menu · Szkenneld be az étlapért</p>
      <div className="rounded-2xl bg-foreground p-5 shadow-glow">
        {url && <QRCodeSVG value={url} size={240} bgColor="transparent" fgColor="currentColor" className="text-background" />}
      </div>
      <p className="text-xs text-muted-foreground break-all">{url}</p>
      <button onClick={() => window.print()} className="rounded-full bg-gold-gradient px-6 py-2 font-semibold text-primary-foreground">
        Print
      </button>
    </div>
  );
}
