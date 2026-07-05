import Link from "next/link";
import { FolderKanban, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { NewProjectDialog } from "@/components/dashboard/new-project-dialog";
import { formatDate, truncate } from "@/lib/utils";

export const metadata = { title: "Projecten" };
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("id,name,description,created_at, documents(count), conversations(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-7 animate-fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Projecten</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Jouw bedrijven & ideeën</h1>
        </div>
        <NewProjectDialog />
      </div>

      {(projects || []).length === 0 ? (
        <div className="hud-ring glass rounded-3xl p-12 text-center">
          <FolderKanban className="mx-auto mb-4 h-10 w-10 text-gold" />
          <h2 className="font-display text-xl font-semibold">Nog geen projecten</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Een project is de kennisbank voor je AI-team: voeg je idee en documenten toe,
            en elke agent gebruikt die context automatisch.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {(projects || []).map((p) => {
            const docCount = (p.documents as unknown as { count: number }[])?.[0]?.count ?? 0;
            const convCount = (p.conversations as unknown as { count: number }[])?.[0]?.count ?? 0;
            return (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`}>
                <div className="group glass h-full rounded-2xl p-6 transition-all hover:border-gold/50 hover:shadow-glow">
                  <div className="flex items-start justify-between">
                    <h2 className="font-display text-lg font-semibold">{p.name}</h2>
                    <ArrowRight className="h-4 w-4 text-zinc-600 transition-transform group-hover:translate-x-1 group-hover:text-gold" />
                  </div>
                  <p className="mt-1.5 text-sm text-muted">
                    {p.description ? truncate(p.description, 120) : "Geen omschrijving."}
                  </p>
                  <div className="mt-4 flex items-center gap-4 text-xs text-zinc-500">
                    <span>{docCount} document{docCount === 1 ? "" : "en"}</span>
                    <span>{convCount} gesprek{convCount === 1 ? "" : "ken"}</span>
                    <span className="ml-auto">{formatDate(p.created_at)}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
