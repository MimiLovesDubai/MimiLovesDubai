"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Bot,
  ListChecks,
  BookOpen,
  Settings,
  ShieldHalf,
  Sparkles,
  LogOut,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { href: "/dashboard", label: "Overzicht", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/projects", label: "Projecten", icon: FolderKanban },
  { href: "/dashboard/agents", label: "AI-agents", icon: Bot },
  { href: "/dashboard/tasks", label: "Taken", icon: ListChecks },
  { href: "/dashboard/prompts", label: "Prompts", icon: BookOpen },
  { href: "/dashboard/settings", label: "Instellingen", icon: Settings },
];

export function Sidebar({
  email,
  planName,
  used,
  limit,
  isAdmin,
}: {
  email: string;
  planName: string;
  used: number;
  limit: number;
  isAdmin: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const pct = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col border-r border-white/[0.06] bg-black/30 backdrop-blur-xl md:flex">
      <div className="flex h-16 items-center gap-2.5 border-b border-white/[0.06] px-5 font-display font-bold">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-grad text-[#1c1606] shadow-glow">
          <Sparkles className="h-4 w-4" />
        </span>
        MyAIAgent <span className="gold-text">OS</span>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-gold/10 text-gold-bright border border-gold/25"
                  : "text-zinc-400 hover:bg-white/[0.05] hover:text-white border border-transparent"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/dashboard/admin"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors border",
              pathname.startsWith("/dashboard/admin")
                ? "bg-violet-400/10 text-violet-300 border-violet-400/25"
                : "text-zinc-400 hover:bg-white/[0.05] hover:text-white border-transparent"
            )}
          >
            <ShieldHalf className="h-4 w-4" /> Admin
          </Link>
        )}
      </nav>

      <div className="space-y-3 border-t border-white/[0.06] p-4">
        <div className="rounded-xl bg-white/[0.04] p-3.5">
          <div className="mb-1.5 flex items-center justify-between text-xs">
            <span className="text-zinc-400">AI-berichten</span>
            <span className="font-mono text-zinc-300">
              {used}/{limit}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                pct >= 90 ? "bg-red-400" : "bg-gold-grad"
              )}
              style={{ width: `${pct}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-zinc-500">{planName}-plan</span>
            <Link
              href="/pricing"
              className="flex items-center gap-1 text-xs text-gold-bright hover:underline"
            >
              <CreditCard className="h-3 w-3" /> Upgrade
            </Link>
          </div>
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="truncate text-xs text-zinc-500" title={email}>
            {email}
          </span>
          <button
            onClick={signOut}
            className="rounded-lg p-1.5 text-zinc-500 hover:bg-white/[0.06] hover:text-white"
            title="Uitloggen"
            aria-label="Uitloggen"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}

/** Compact top bar for mobile. */
export function MobileBar() {
  const router = useRouter();
  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-white/[0.06] bg-black/40 px-4 backdrop-blur-xl md:hidden">
      <Link href="/dashboard" className="flex items-center gap-2 font-display font-bold">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gold-grad text-[#1c1606]">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
        <span className="gold-text">OS</span>
      </Link>
      <nav className="flex items-center gap-1">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="rounded-lg p-2 text-zinc-400 hover:bg-white/[0.06] hover:text-white"
            aria-label={n.label}
          >
            <n.icon className="h-4 w-4" />
          </Link>
        ))}
        <button
          onClick={signOut}
          className="rounded-lg p-2 text-zinc-500 hover:text-white"
          aria-label="Uitloggen"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </nav>
    </div>
  );
}
