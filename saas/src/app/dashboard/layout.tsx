import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUsageAndLimit } from "@/lib/usage";
import { Sidebar, MobileBar } from "@/components/dashboard/sidebar";
import { CommandPalette } from "@/components/dashboard/command-palette";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const usage = await getUsageAndLimit(supabase, user.id);
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  const isAdmin = !!user.email && adminEmails.includes(user.email.toLowerCase());

  return (
    <div className="min-h-screen">
      <Sidebar
        email={user.email || ""}
        planName={usage.plan.name}
        used={usage.used}
        limit={usage.limit}
        isAdmin={isAdmin}
      />
      <MobileBar />
      <CommandPalette />
      <main className="md:pl-60">
        <div className="mx-auto max-w-5xl px-5 py-8 md:px-8 md:py-10">{children}</div>
      </main>
    </div>
  );
}
