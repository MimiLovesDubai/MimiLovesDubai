import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, FileText, MessageSquare, Bot } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AddDocumentDialog } from "@/components/dashboard/add-document-dialog";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { AgentIcon } from "@/components/agent-icon";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatDate, truncate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("id,name,description,created_at")
    .eq("id", id)
    .maybeSingle();
  if (!project) notFound();

  const [{ data: documents }, { data: conversations }, { data: agents }] =
    await Promise.all([
      supabase
        .from("documents")
        .select("id,title,content,created_at")
        .eq("project_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("conversations")
        .select("id,title,updated_at, agents(name,icon)")
        .eq("project_id", id)
        .order("updated_at", { ascending: false })
        .limit(10),
      supabase.from("agents").select("id,slug,name,icon").order("created_at"),
    ]);

  return (
    <div className="space-y-7 animate-fade-up">
      <div>
        <Link
          href="/dashboard/projects"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Alle projecten
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="mt-2 max-w-2xl text-sm text-muted">{project.description}</p>
            )}
          </div>
          <DeleteButton
            endpoint="/api/projects"
            id={project.id}
            confirmText={`Project "${project.name}" en alles erin verwijderen?`}
            redirectTo="/dashboard/projects"
          />
        </div>
      </div>

      {/* Start an agent with this project's context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-4 w-4 text-gold" /> Start een agent met deze projectcontext
          </CardTitle>
          <CardDescription>
            De agent leest automatisch de omschrijving en documenten van dit project mee.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {(agents || []).map((a) => (
            <Link
              key={a.id}
              href={`/dashboard/agents?start=${a.slug}&project=${project.id}`}
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-sm transition-colors hover:border-gold/50 hover:text-gold-bright"
            >
              <AgentIcon icon={a.icon} className="h-4 w-4" /> {a.name}
            </Link>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Documents */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="h-4 w-4 text-gold" /> Documenten
              </CardTitle>
              <CardDescription>Kennisbank voor je agents.</CardDescription>
            </div>
            <AddDocumentDialog projectId={project.id} />
          </CardHeader>
          <CardContent className="space-y-2">
            {(documents || []).length === 0 && (
              <p className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-muted">
                Nog geen documenten. Voeg notities, onderzoek of merkteksten toe.
              </p>
            )}
            {(documents || []).map((d) => (
              <div key={d.id} className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-3.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{d.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {truncate(d.content, 110) || "—"}
                  </p>
                </div>
                <DeleteButton endpoint="/api/documents" id={d.id} />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Conversations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <MessageSquare className="h-4 w-4 text-gold" /> Gesprekken in dit project
            </CardTitle>
            <CardDescription>Alle agent-sessies met deze context.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {(conversations || []).length === 0 && (
              <p className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-muted">
                Nog geen gesprekken. Start hierboven een agent.
              </p>
            )}
            {(conversations || []).map((c) => {
              const agent = Array.isArray(c.agents) ? c.agents[0] : c.agents;
              return (
                <Link
                  key={c.id}
                  href={`/dashboard/chat/${c.id}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
                >
                  <AgentIcon icon={agent?.icon || "bot"} className="h-4 w-4 shrink-0 text-gold" />
                  <span className="min-w-0 flex-1 truncate text-sm">{truncate(c.title, 44)}</span>
                  <span className="shrink-0 text-xs text-zinc-600">{formatDate(c.updated_at)}</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
