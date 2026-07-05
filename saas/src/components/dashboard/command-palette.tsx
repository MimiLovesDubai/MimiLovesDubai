"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  LayoutDashboard,
  FolderKanban,
  Bot,
  ListChecks,
  BookOpen,
  Settings,
  CreditCard,
  Command,
} from "lucide-react";

const ITEMS = [
  { label: "Overzicht", hint: "dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Projecten", hint: "projects", href: "/dashboard/projects", icon: FolderKanban },
  { label: "AI-agents starten", hint: "agents chat", href: "/dashboard/agents", icon: Bot },
  { label: "Taken", hint: "tasks todo", href: "/dashboard/tasks", icon: ListChecks },
  { label: "Prompt-bibliotheek", hint: "prompts library", href: "/dashboard/prompts", icon: BookOpen },
  { label: "Instellingen", hint: "settings account", href: "/dashboard/settings", icon: Settings },
  { label: "Upgrade plan", hint: "billing pricing", href: "/pricing", icon: CreditCard },
];

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [index, setIndex] = useState(0);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return ITEMS;
    return ITEMS.filter(
      (i) => i.label.toLowerCase().includes(s) || i.hint.includes(s)
    );
  }, [q]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
        setQ("");
        setIndex(0);
      }
      if (!open) return;
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setIndex((i) => Math.min(i + 1, results.length - 1));
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setIndex((i) => Math.max(i - 1, 0));
      }
      if (e.key === "Enter" && results[index]) {
        setOpen(false);
        router.push(results[index].href);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, results, index, router]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-start justify-center bg-black/60 p-4 pt-[18vh] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-gold/25 bg-[#14121b] shadow-glow-lg"
            initial={{ scale: 0.96, y: -8 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.96, y: -8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
              <Command className="h-4 w-4 text-gold" />
              <input
                autoFocus
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setIndex(0);
                }}
                placeholder="Waar wil je naartoe?"
                className="h-13 w-full bg-transparent py-4 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
              />
              <kbd className="rounded-md border border-white/10 bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-zinc-500">
                ESC
              </kbd>
            </div>
            <ul className="max-h-72 overflow-y-auto p-2">
              {results.length === 0 && (
                <li className="px-3 py-6 text-center text-sm text-zinc-500">
                  Niets gevonden.
                </li>
              )}
              {results.map((item, i) => (
                <li key={item.href}>
                  <button
                    className={`flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm ${
                      i === index
                        ? "bg-gold/10 text-gold-bright"
                        : "text-zinc-300 hover:bg-white/[0.05]"
                    }`}
                    onMouseEnter={() => setIndex(i)}
                    onClick={() => {
                      setOpen(false);
                      router.push(item.href);
                    }}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-white/[0.07] px-4 py-2 text-[11px] text-zinc-600">
              Navigeer met ↑ ↓ · Enter om te openen · ⌘K / Ctrl+K om te sluiten
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
