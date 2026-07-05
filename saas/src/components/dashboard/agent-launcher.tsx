"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Play } from "lucide-react";
import { AgentIcon } from "@/components/agent-icon";
import { Button } from "@/components/ui/button";

type Agent = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
};
type Project = { id: string; name: string };

export function AgentLauncher({
  agents,
  projects,
}: {
  agents: Agent[];
  projects: Project[];
}) {
  const router = useRouter();
  const search = useSearchParams();
  const [projectId, setProjectId] = useState<string>(search.get("project") || "");
  const [starting, setStarting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function start(agent: Agent) {
    setError(null);
    setStarting(agent.id);
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId: agent.id, projectId: projectId || null }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Kon geen gesprek starten.");
        return;
      }
      router.push(`/dashboard/chat/${data.id}`);
    } catch {
      setError("Netwerkfout. Probeer opnieuw.");
    } finally {
      setStarting(null);
    }
  }

  // Deep link: /dashboard/agents?start=<slug>&project=<id>
  useEffect(() => {
    const slug = search.get("start");
    if (!slug) return;
    const agent = agents.find((a) => a.slug === slug);
    if (agent && !starting) {
      start(agent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <div className="glass flex flex-wrap items-center gap-3 rounded-2xl p-4">
        <label htmlFor="project" className="text-sm text-zinc-300">
          Projectcontext:
        </label>
        <select
          id="project"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          className="h-9 rounded-xl border border-white/10 bg-[#14121b] px-3 text-sm text-zinc-100 focus:border-gold/50 focus:outline-none"
        >
          <option value="">Geen project (los gesprek)</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <span className="text-xs text-zinc-500">
          Met een project leest de agent je omschrijving en documenten mee.
        </span>
      </div>

      {error && (
        <p className="rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {agents.map((a) => (
          <div
            key={a.id}
            className="group hud-ring glass flex flex-col rounded-2xl p-6 transition-all hover:border-gold/50 hover:shadow-glow"
          >
            <div className="flex items-center gap-3.5">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gold-grad text-[#1c1606] shadow-glow transition-transform group-hover:scale-110">
                <AgentIcon icon={a.icon} className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-display text-lg font-semibold">{a.name}</h2>
                <p className="text-xs text-gold-bright/80">{a.tagline}</p>
              </div>
            </div>
            <p className="mt-3 flex-1 text-sm text-muted">{a.description}</p>
            <Button
              className="mt-5"
              onClick={() => start(a)}
              disabled={starting !== null}
            >
              {starting === a.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4" />
              )}
              Start gesprek
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
