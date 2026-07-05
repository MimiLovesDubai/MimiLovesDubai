import { createClient } from "@/lib/supabase/server";
import { PromptLibrary } from "@/components/dashboard/prompt-library";

export const metadata = { title: "Prompt-bibliotheek" };
export const dynamic = "force-dynamic";

export default async function PromptsPage() {
  const supabase = await createClient();
  const { data: prompts } = await supabase
    .from("prompts")
    .select("id,user_id,title,category,content")
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-7 animate-fade-up">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Bibliotheek</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Prompt-bibliotheek</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted">
          Beproefde prompts om direct te gebruiken in je agent-gesprekken. Kopieer, vul de
          [variabelen] in en plak in de chat. Sla je eigen favorieten op.
        </p>
      </div>
      <PromptLibrary prompts={prompts || []} />
    </div>
  );
}
