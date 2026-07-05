import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { AgentLauncher } from "@/components/dashboard/agent-launcher";

export const metadata = { title: "AI-agents" };
export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const supabase = await createClient();
  const [{ data: agents }, { data: projects }] = await Promise.all([
    supabase
      .from("agents")
      .select("id,slug,name,tagline,description,icon")
      .order("created_at"),
    supabase.from("projects").select("id,name").order("created_at", { ascending: false }),
  ]);

  return (
    <div className="space-y-7 animate-fade-up">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Je team</p>
        <h1 className="mt-1 font-display text-3xl font-bold">AI-werknemers</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Kies een specialist en start een gesprek. Elke agent heeft zijn eigen expertise
          en werkwijze — en kent jouw project als je er een selecteert.
        </p>
      </div>
      <Suspense>
        <AgentLauncher agents={agents || []} projects={projects || []} />
      </Suspense>
    </div>
  );
}
