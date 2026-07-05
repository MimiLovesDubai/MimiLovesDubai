import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MyAIAgent OS — Jouw AI Business Operating System",
    template: "%s · MyAIAgent OS",
  },
  description:
    "Run je online bedrijf met AI-werknemers: businessplannen, websiteteksten, marketing, SEO en taken — in één futuristisch commandocentrum.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
        <style>{`:root{--font-display:"Space Grotesk",ui-sans-serif,system-ui,sans-serif;--font-body:Inter,ui-sans-serif,system-ui,sans-serif;--font-mono:"JetBrains Mono",ui-monospace,monospace;}`}</style>
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
