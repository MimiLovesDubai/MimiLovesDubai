import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { documentSchema } from "@/lib/validate";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const body = documentSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json({ error: "Ongeldige invoer." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("documents")
    .insert({
      user_id: user.id,
      project_id: body.data.projectId,
      title: body.data.title,
      content: body.data.content,
    })
    .select("id")
    .single();

  if (error) {
    // Most likely: project not owned by user (RLS)
    return NextResponse.json({ error: "Document toevoegen mislukte." }, { status: 500 });
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

  const { error } = await supabase.from("documents").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Verwijderen mislukte." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
