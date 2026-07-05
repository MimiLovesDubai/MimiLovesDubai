import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <Link
        href="/"
        className="mb-10 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" /> Terug naar home
      </Link>
      <article className="prose-invert space-y-4 text-[0.95rem] leading-relaxed text-zinc-300 [&_h1]:font-display [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-white [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
        {children}
      </article>
    </div>
  );
}
