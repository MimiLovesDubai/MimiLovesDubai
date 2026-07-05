import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropic, aiConfigured, AI_MODEL, buildSystemPrompt } from "@/lib/ai";
import { chatSchema } from "@/lib/validate";
import { getUsageAndLimit, logUsage } from "@/lib/usage";
import { rateLimit } from "@/lib/ratelimit";
import { truncate } from "@/lib/utils";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * POST /api/chat — send a user message, stream the agent's reply as plain
 * text chunks. Persists both messages and logs token usage.
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

    const rl = rateLimit(`chat:${user.id}`, 20, 60_000);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "Te veel berichten achter elkaar. Wacht even en probeer opnieuw." },
        { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } }
      );
    }

    const body = chatSchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json(
        { error: body.error.issues[0]?.message || "Ongeldige invoer." },
        { status: 400 }
      );
    }
    const { conversationId, message } = body.data;

    // Plan limit
    const usage = await getUsageAndLimit(supabase, user.id);
    if (usage.remaining <= 0) {
      return NextResponse.json(
        {
          error: `Je hebt je maandlimiet van ${usage.limit} AI-berichten bereikt. Upgrade je plan om verder te gaan.`,
          upgrade: true,
        },
        { status: 402 }
      );
    }

    // Conversation + agent (RLS guarantees ownership)
    const { data: conv, error: convErr } = await supabase
      .from("conversations")
      .select("id,title,project_id,agent_id, agents(name,system_prompt), projects(name,description)")
      .eq("id", conversationId)
      .single();
    if (convErr || !conv) {
      return NextResponse.json({ error: "Gesprek niet gevonden." }, { status: 404 });
    }
    const agent = Array.isArray(conv.agents) ? conv.agents[0] : conv.agents;
    const project = Array.isArray(conv.projects) ? conv.projects[0] : conv.projects;
    if (!agent) return NextResponse.json({ error: "Agent niet gevonden." }, { status: 404 });

    // Project documents as context
    let documents: { title: string; content: string }[] = [];
    if (conv.project_id) {
      const { data: docs } = await supabase
        .from("documents")
        .select("title,content")
        .eq("project_id", conv.project_id)
        .order("created_at", { ascending: false })
        .limit(8);
      documents = docs || [];
    }

    // History (last 30 messages) BEFORE inserting the new one
    const { data: history } = await supabase
      .from("messages")
      .select("role,content")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(30);

    // Persist the user message
    const { error: insErr } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: "user",
      content: message,
    });
    if (insErr) {
      return NextResponse.json({ error: "Bericht opslaan mislukte." }, { status: 500 });
    }

    // First message names the conversation
    if (!history?.length && conv.title === "Nieuw gesprek") {
      await supabase
        .from("conversations")
        .update({ title: truncate(message, 60) })
        .eq("id", conversationId);
    }

    const system = buildSystemPrompt({
      agentPrompt: agent.system_prompt,
      projectName: project?.name,
      projectDescription: project?.description,
      documents,
    });

    const anthropic = getAnthropic();
    const stream = anthropic.messages.stream({
      model: AI_MODEL,
      max_tokens: 8192,
      system,
      messages: [
        ...(history || []).map((m) => ({
          role: m.role as "user" | "assistant",
          content: m.content,
        })),
        { role: "user" as const, content: message },
      ],
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream<Uint8Array>({
      async start(controller) {
        let full = "";
        try {
          for await (const event of stream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              full += event.delta.text;
              controller.enqueue(encoder.encode(event.delta.text));
            }
          }
          const final = await stream.finalMessage();
          // Persist assistant reply + usage
          await supabase.from("messages").insert({
            conversation_id: conversationId,
            user_id: user.id,
            role: "assistant",
            content: full || "(leeg antwoord)",
          });
          await supabase
            .from("conversations")
            .update({ updated_at: new Date().toISOString() })
            .eq("id", conversationId);
          await logUsage(
            supabase,
            user.id,
            "chat",
            AI_MODEL,
            final.usage.input_tokens,
            final.usage.output_tokens
          );
        } catch (err) {
          const msg =
            "\n\n[Er ging iets mis bij het genereren. Probeer het opnieuw.]";
          controller.enqueue(encoder.encode(msg));
          if (full) {
            await supabase.from("messages").insert({
              conversation_id: conversationId,
              user_id: user.id,
              role: "assistant",
              content: full + msg,
            });
          }
          console.error("chat stream error", err);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (err) {
    console.error("chat route error", err);
    return NextResponse.json({ error: "Onverwachte fout." }, { status: 500 });
  }
}
