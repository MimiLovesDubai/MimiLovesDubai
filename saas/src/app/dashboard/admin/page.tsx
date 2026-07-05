import { redirect } from "next/navigation";
import { Users, FolderKanban, MessageSquare, ListChecks, Coins, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (!user.email || !adminEmails.includes(user.email.toLowerCase())) {
    redirect("/dashboard");
  }

  const admin = createAdminClient();
  if (!admin) {
    return (
      <div className="animate-fade-up">
        <h1 className="font-display text-3xl font-bold">Admin</h1>
        <p className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-300">
          Zet <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code> in je omgeving om het
          admin-overzicht te activeren (nodig om over alle gebruikers heen te tellen).
        </p>
      </div>
    );
  }

  const [users, projects, conversations, messages, tasks, subs, usage, recent] =
    await Promise.all([
      admin.from("profiles").select("id", { count: "exact", head: true }),
      admin.from("projects").select("id", { count: "exact", head: true }),
      admin.from("conversations").select("id", { count: "exact", head: true }),
      admin.from("messages").select("id", { count: "exact", head: true }),
      admin.from("tasks").select("id", { count: "exact", head: true }),
      admin.from("subscriptions").select("plan"),
      admin.from("usage_logs").select("input_tokens,output_tokens"),
      admin
        .from("profiles")
        .select("email,full_name,created_at")
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  const planCounts = (subs.data || []).reduce<Record<string, number>>((acc, s) => {
    acc[s.plan] = (acc[s.plan] || 0) + 1;
    return acc;
  }, {});
  const totalTokens = (usage.data || []).reduce(
    (sum, u) => sum + (u.input_tokens || 0) + (u.output_tokens || 0),
    0
  );

  const stats = [
    { label: "Gebruikers", value: users.count ?? 0, icon: Users },
    { label: "Projecten", value: projects.count ?? 0, icon: FolderKanban },
    { label: "Gesprekken", value: conversations.count ?? 0, icon: MessageSquare },
    { label: "Berichten", value: messages.count ?? 0, icon: MessageSquare },
    { label: "Taken", value: tasks.count ?? 0, icon: ListChecks },
    { label: "Tokens totaal", value: totalTokens.toLocaleString("nl-NL"), icon: Coins },
  ];

  return (
    <div className="space-y-7 animate-fade-up">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-violet-300">Beheer</p>
        <h1 className="mt-1 font-display text-3xl font-bold">Admin-overzicht</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-xs text-muted">{s.label}</p>
                <p className="mt-1 font-display text-2xl font-bold">{s.value}</p>
              </div>
              <s.icon className="h-6 w-6 text-violet-300" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4 text-violet-300" /> Abonnementen
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            {(["free", "pro", "agency"] as const).map((p) => (
              <div key={p} className="flex items-center gap-2 rounded-xl bg-white/[0.04] px-4 py-3">
                <Badge variant={p === "free" ? "secondary" : "default"} className="capitalize">{p}</Badge>
                <span className="font-display text-lg font-bold">{planCounts[p] || 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nieuwste gebruikers</CardTitle>
            <CardDescription>Laatste 10 registraties.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-1.5 text-sm">
            {(recent.data || []).map((u) => (
              <div key={u.email} className="flex items-center justify-between rounded-lg px-2 py-1.5">
                <span className="truncate">{u.full_name || u.email}</span>
                <span className="shrink-0 text-xs text-zinc-500">{formatDate(u.created_at)}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
