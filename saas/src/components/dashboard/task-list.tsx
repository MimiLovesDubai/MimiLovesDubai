"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Circle, CircleDot, CheckCircle2, Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { cn } from "@/lib/utils";

type Task = {
  id: string;
  title: string;
  description: string | null;
  status: "todo" | "doing" | "done";
  projects?: { name: string } | { name: string }[] | null;
};

const NEXT_STATUS: Record<Task["status"], Task["status"]> = {
  todo: "doing",
  doing: "done",
  done: "todo",
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  const router = useRouter();
  const [items, setItems] = useState(tasks);
  const [newTitle, setNewTitle] = useState("");
  const [adding, setAdding] = useState(false);
  const [filter, setFilter] = useState<"open" | "done" | "all">("open");

  const visible = items.filter((t) =>
    filter === "all" ? true : filter === "done" ? t.status === "done" : t.status !== "done"
  );

  async function cycle(task: Task) {
    const status = NEXT_STATUS[task.status];
    setItems((arr) => arr.map((t) => (t.id === task.id ? { ...t, status } : t)));
    await fetch("/api/tasks", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, status }),
    });
    router.refresh();
  }

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setAdding(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      if (res.ok) {
        setNewTitle("");
        router.refresh();
        const data = await res.json();
        setItems((arr) => [
          { id: data.id, title: newTitle, description: "", status: "todo" },
          ...arr,
        ]);
      }
    } finally {
      setAdding(false);
    }
  }

  const StatusIcon = ({ s }: { s: Task["status"] }) =>
    s === "done" ? (
      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
    ) : s === "doing" ? (
      <CircleDot className="h-5 w-5 text-amber-400" />
    ) : (
      <Circle className="h-5 w-5 text-zinc-600" />
    );

  return (
    <div className="space-y-5">
      <form onSubmit={add} className="glass flex items-center gap-2.5 rounded-2xl p-2.5">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Snel een taak toevoegen…"
          className="border-0 bg-transparent focus-visible:ring-0"
        />
        <Button type="submit" size="sm" disabled={adding || !newTitle.trim()}>
          {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Toevoegen
        </Button>
      </form>

      <div className="flex gap-2">
        {(["open", "done", "all"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors",
              filter === f
                ? "bg-gold/15 text-gold-bright border border-gold/30"
                : "text-zinc-400 hover:text-white border border-transparent"
            )}
          >
            {f === "open" ? "Open" : f === "done" ? "Afgerond" : "Alles"}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {visible.length === 0 && (
          <p className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-muted">
            {filter === "done"
              ? "Nog niets afgerond — aan de slag! 💪"
              : "Geen taken hier. Genereer taken vanuit een agent-gesprek of voeg er zelf een toe."}
          </p>
        )}
        {visible.map((t) => {
          const project = Array.isArray(t.projects) ? t.projects[0] : t.projects;
          return (
            <div
              key={t.id}
              className={cn(
                "glass flex items-start gap-3.5 rounded-2xl p-4 transition-opacity",
                t.status === "done" && "opacity-60"
              )}
            >
              <button
                onClick={() => cycle(t)}
                className="mt-0.5 shrink-0"
                title="Status wisselen (open → bezig → klaar)"
                aria-label="Status wisselen"
              >
                <StatusIcon s={t.status} />
              </button>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    "text-sm font-medium",
                    t.status === "done" && "line-through text-zinc-500"
                  )}
                >
                  {t.title}
                </p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-zinc-500">{t.description}</p>
                )}
                {project?.name && (
                  <span className="mt-1.5 inline-block rounded-full bg-white/[0.05] px-2 py-0.5 text-[10px] text-zinc-400">
                    {project.name}
                  </span>
                )}
              </div>
              <DeleteButton endpoint="/api/tasks" id={t.id} confirmText="Taak verwijderen?" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
