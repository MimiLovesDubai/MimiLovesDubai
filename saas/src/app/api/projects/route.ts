import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { projectSchema } from "@/lib/validate";
import { getUsageAndLimit } from "@/lib/usage";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });

  const body = projectSchema.safeParse(await req.json());
  if (!body.success) {
    return NextResponse.json(
      { error: body.error.issues[0]?.message || "Ongeldige invoer." },
      { status: 400 }
    );
  }

  // Plan limit on number of projects
  const [{ count }, usage] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("user_id", user.id),
    getUsageAndLimit(supabase, user.id),
  ]);
  if ((count ?? 0) >= usage.plan.projects) {
    return NextResponse.json(
      {
        error: `Je ${usage.plan.name}-plan staat maximaal ${usage.plan.projects} project(en) toe. Upgrade om meer aan te maken.`,
        upgrade: true,
      },
      { status: 402 }
    );
  }

  // Attach to the user's default organization
  const { data: org } = await supabase
    .from("organizations")
    .select("id")
    .eq("owner_id", user.id)
    .limit(1)
    .maybeSingle();

  const { data, error } = await supabase
    .from("projects")
    .insert({
      user_id: user.id,
      org_id: org?.id ?? null,
      name: body.data.name,
      description: body.data.description,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: "Project aanmaken mislukte." }, { status: 500 });
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

  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return NextResponse.json({ error: "Verwijderen mislukte." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
