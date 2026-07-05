import { createClient } from "@/lib/supabase/server";
import { TaskList } from "@/components/dashboard/task-list";

export const metadata = { title: "Taken" };
export const dynamic = "force-dynamic";

export default async function TasksPage() {
  const supabase = await createClient();
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id,title,description,status, projects(name)")
    .order("created_at", { ascending: false })
    .limit(200);

  return (
    <div className="space-y-7 animate-fade-up">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Uitvoering</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Taken</h1>
        <p className="mt-2 text-sm text-muted">
          Alles wat jij en je AI-team hebben klaargezet. Klik op het rondje om de status te wisselen.
        </p>
      </div>
      <TaskList
        tasks={(tasks || []).map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status as "todo" | "doing" | "done",
          projects: t.projects,
        }))}
      />
    </div>
  );
}
