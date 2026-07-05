import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { ChatUI } from "@/components/dashboard/chat-ui";

export const dynamic = "force-dynamic";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select("id,title,project_id, agents(name,tagline,icon), projects(name)")
    .eq("id", id)
    .maybeSingle();
  if (!conv) notFound();

  const agent = Array.isArray(conv.agents) ? conv.agents[0] : conv.agents;
  const project = Array.isArray(conv.projects) ? conv.projects[0] : conv.projects;

  const { data: messages } = await supabase
    .from("messages")
    .select("role,content")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true })
    .limit(100);

  return (
    <div className="animate-fade-up">
      <div className="mb-3 flex items-center gap-3 text-sm text-muted">
        <Link
          href={conv.project_id ? `/dashboard/projects/${conv.project_id}` : "/dashboard/agents"}
          className="inline-flex items-center gap-1.5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {project ? `Project: ${project.name}` : "Alle agents"}
        </Link>
      </div>
      <ChatUI
        conversationId={conv.id}
        agentName={agent?.name || "Agent"}
        agentIcon={agent?.icon || "bot"}
        agentTagline={agent?.tagline || ""}
        initialMessages={(messages || []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        }))}
      />
    </div>
  );
}
