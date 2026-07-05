import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { conversationSchema } from "@/lib/validate";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const body = conversationSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Ongeldige invoer." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({
      user_id: user.id,
      agent_id: body.data.agentId,
      project_id: body.data.projectId ?? null,
    })
    .select("id")
    .single();

  if (error) {
    return NextResponse.json({ error: "Gesprek aanmaken mislukte." }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id ontbreekt." }, { status: 400 });

  const { error } = await supabase.from("conversations").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Verwijderen mislukte." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
