import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { taskSchema, taskStatusSchema } from "@/lib/validate";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const body = taskSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Ongeldige invoer." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      project_id: body.data.projectId ?? null,
      title: body.data.title,
      description: body.data.description,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: "Taak aanmaken mislukte." }, { status: 500 });
  return NextResponse.json({ id: data.id });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const body = taskStatusSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Ongeldige invoer." }, { status: 400 });
  }

  const { error } = await supabase
    .from("tasks")
    .update({ status: body.data.status })
    .eq("id", body.data.id);

  if (error) return NextResponse.json({ error: "Bijwerken mislukte." }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id ontbreekt." }, { status: 400 });

  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Verwijderen mislukte." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
