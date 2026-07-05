import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, aiConfigured, AI_MODEL } from "@/lib/ai";
import { generateTasksSchema } from "@/lib/validate";
import { getUsageAndLimit, logUsage } from "@/lib/usage";
import { rateLimit } from "@/lib/ratelimit";

export const runtime = "nodejs";
export const maxDuration = 60;

/**
 * POST /api/tasks/generate — turn a conversation into concrete tasks using
 * structured output (JSON schema), store them, return them.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

    if (!aiConfigured()) {
      return NextResponse.json(
        { error: "AI is niet geconfigureerd: zet ANTHROPIC_API_KEY in .env.local." },
        { status: 503 }
      );
    }

    const rl = rateLimit(`taskgen:${user.id}`, 6, 60_000);
    if (!rl.ok) {
      return NextResponse.json({ error: "Even rustig aan — probeer zo opnieuw." }, { status: 429 });
    }

    const body = generateTasksSchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Ongeldige invoer." }, { status: 400 });
    }

    const usage = await getUsageAndLimit(supabase, user.id);
    if (usage.remaining <= 0) {
      return NextResponse.json(
        { error: `Maandlimiet van ${usage.limit} AI-acties bereikt. Upgrade je plan.`, upgrade: true },
        { status: 402 }
      );
    }

    const { data: conv } = await supabase
      .from("conversations")
      .select("id,project_id")
      .eq("id", body.data.conversationId)
      .single();
    if (!conv) return NextResponse.json({ error: "Gesprek niet gevonden." }, { status: 404 });

    const { data: msgs } = await supabase
      .from("messages")
      .select("role,content")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: false })
      .limit(16);
    const history = (msgs || []).reverse();
    if (!history.length) {
      return NextResponse.json({ error: "Dit gesprek heeft nog geen berichten." }, { status: 400 });
    }

    const transcript = history
      .map((m) => `${m.role === "user" ? "GEBRUIKER" : "AGENT"}: ${m.content}`)
      .join("\n\n")
      .slice(0, 24_000);

    const anthropic = getAnthropic();
    const response = await anthropic.messages.create({
      model: AI_MODEL,
      max_tokens: 2048,
      system:
        "Je destilleert concrete, uitvoerbare taken uit een gesprek tussen een gebruiker en een AI-agent. Elke taak is klein (af te ronden in één werksessie), begint met een werkwoord en is in het Nederlands. Maximaal 8 taken, alleen taken die echt uit het gesprek volgen.",
      messages: [
        {
          role: "user",
          content: `Hier is het gesprek:\n\n${transcript}\n\nGeef de takenlijst.`,
        },
      ],
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              tasks: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    title: { type: "string" },
                    description: { type: "string" },
                  },
                  required: ["title", "description"],
                  additionalProperties: false,
                },
              },
            },
            required: ["tasks"],
            additionalProperties: false,
          },
        },
      },
    });

    const text =
      response.content.find(
        (b): b is Extract<(typeof response.content)[number], { type: "text" }> =>
          b.type === "text"
      )?.text || "{}";

    let tasks: { title: string; description: string }[] = [];
    try {
      const parsed = JSON.parse(text);
      tasks = Array.isArray(parsed.tasks) ? parsed.tasks.slice(0, 8) : [];
    } catch {
      return NextResponse.json({ error: "Kon de taken niet verwerken. Probeer opnieuw." }, { status: 500 });
    }
    if (!tasks.length) {
      return NextResponse.json({ error: "Geen concrete taken gevonden in dit gesprek." }, { status: 422 });
    }

    const rows = tasks.map((t) => ({
      user_id: user.id,
      project_id: conv.project_id,
      source_conversation_id: conv.id,
      title: String(t.title).slice(0, 300),
      description: String(t.description || "").slice(0, 2000),
    }));
    const { data: inserted, error: insErr } = await supabase
      .from("tasks")
      .insert(rows)
      .select("id,title,description,status");
    if (insErr) {
      return NextResponse.json({ error: "Taken opslaan mislukte." }, { status: 500 });
    }

    await logUsage(
      supabase,
      user.id,
      "task_gen",
      AI_MODEL,
      response.usage.input_tokens,
      response.usage.output_tokens
    );

    return NextResponse.json({ tasks: inserted });
  } catch (err) {
    console.error("task generate error", err);
    return NextResponse.json({ error: "Onverwachte fout bij taken genereren." }, { status: 500 });
  }
}
