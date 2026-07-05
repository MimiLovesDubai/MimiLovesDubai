import Link from "next/link";
import {
  FolderKanban,
  MessageSquare,
  ListChecks,
  Bot,
  ArrowRight,
  Command,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getUsageAndLimit } from "@/lib/usage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AgentIcon } from "@/components/agent-icon";
import { formatDate, truncate } from "@/lib/utils";

export const metadata = { title: "Overzicht" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const [projects, conversations, tasks, agents, usage, profile] = await Promise.all([
    supabase
      .from("projects")
      .select("id,name,description,created_at")
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("conversations")
      .select("id,title,updated_at, agents(name,icon)")
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("tasks")
      .select("id,title,status")
      .neq("status", "done")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase.from("agents").select("id,slug,name,tagline,icon").order("created_at"),
    getUsageAndLimit(supabase, user.id),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
  ]);

  const name = profile.data?.full_name?.split(" ")[0] || "founder";

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Commandocentrum</p>
          <h1 className="mt-1 font-display text-3xl font-bold">Welkom terug, {name}</h1>
        </div>
        <Badge variant="secondary" className="hidden md:inline-flex">
          <Command className="h-3 w-3" /> Druk op ⌘K om snel te navigeren
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Projecten", value: projects.data?.length ?? 0, icon: FolderKanban, href: "/dashboard/projects" },
          { label: "Open taken", value: tasks.data?.length ?? 0, icon: ListChecks, href: "/dashboard/tasks" },
          { label: "AI-berichten deze maand", value: `${usage.used}/${usage.limit}`, icon: MessageSquare, href: "/dashboard/settings" },
        ].map((s) => (
          <Link key={s.label} href={s.href}>
            <Card className="transition-colors hover:border-gold/40">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs text-muted">{s.label}</p>
                  <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
                </div>
                <s.icon className="h-6 w-6 text-gold" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Agent launcher */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-lg font-semibold">
            <Bot className="h-5 w-5 text-gold" /> Start een AI-werknemer
          </h2>
          <Link href="/dashboard/agents" className="flex items-center gap-1 text-sm text-gold-bright hover:underline">
            Alle agents <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(agents.data || []).map((a) => (
            <Link key={a.id} href={`/dashboard/agents?start=${a.slug}`}>
              <div className="group glass flex items-center gap-3.5 rounded-2xl p-4 transition-all hover:border-gold/50 hover:shadow-glow">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-grad text-[#1c1606] transition-transform group-hover:scale-110">
                  <AgentIcon icon={a.icon} className="h-4.5 w-4.5 h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-display text-sm font-semibold">{a.name}</p>
                  <p className="truncate text-xs text-muted">{a.tagline}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent conversations */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recente gesprekken</CardTitle>
            <CardDescription>Ga verder waar je gebleven was.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {(conversations.data || []).length === 0 && (
              <p className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-muted">
                Nog geen gesprekken — start je eerste agent hierboven. ✨
              </p>
            )}
            {(conversations.data || []).map((c) => {
              const agent = Array.isArray(c.agents) ? c.agents[0] : c.agents;
              return (
                <Link
                  key={c.id}
                  href={`/dashboard/chat/${c.id}`}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
                >
                  <AgentIcon icon={agent?.icon || "bot"} className="h-4 w-4 shrink-0 text-gold" />
                  <span className="min-w-0 flex-1 truncate text-sm">{truncate(c.title, 48)}</span>
                  <span className="shrink-0 text-xs text-zinc-600">{formatDate(c.updated_at)}</span>
                </Link>
              );
            })}
          </CardContent>
        </Card>

        {/* Open tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Open taken</CardTitle>
            <CardDescription>Wat je AI-team voor je heeft klaargezet.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5">
            {(tasks.data || []).length === 0 && (
              <p className="rounded-xl border border-dashed border-white/10 p-5 text-center text-sm text-muted">
                Geen open taken. Genereer taken vanuit een gesprek. ✅
              </p>
            )}
            {(tasks.data || []).map((t) => (
              <Link
                key={t.id}
                href="/dashboard/tasks"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-white/[0.05]"
              >
                <span
                  className={`h-2 w-2 shrink-0 rounded-full ${
                    t.status === "doing" ? "bg-amber-400" : "bg-zinc-600"
                  }`}
                />
                <span className="min-w-0 flex-1 truncate text-sm">{t.title}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
