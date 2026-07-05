"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, Plus, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { DeleteButton } from "@/components/dashboard/delete-button";
import { cn } from "@/lib/utils";

type Prompt = {
  id: string;
  user_id: string | null;
  title: string;
  category: string;
  content: string;
};

export function PromptLibrary({ prompts }: { prompts: Prompt[] }) {
  const router = useRouter();
  const [copied, setCopied] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("alles");
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState("algemeen");
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = useMemo(
    () => ["alles", ...Array.from(new Set(prompts.map((p) => p.category)))],
    [prompts]
  );
  const visible = prompts.filter((p) => category === "alles" || p.category === category);

  async function copy(p: Prompt) {
    await navigator.clipboard.writeText(p.content);
    setCopied(p.id);
    setTimeout(() => setCopied(null), 1500);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, category: cat, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Opslaan mislukte.");
        return;
      }
      setOpen(false);
      setTitle("");
      setContent("");
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium capitalize transition-colors border",
                category === c
                  ? "bg-gold/15 text-gold-bright border-gold/30"
                  : "text-zinc-400 hover:text-white border-transparent"
              )}
            >
              {c}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4" /> Eigen prompt
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {visible.map((p) => (
          <div key={p.id} className="glass flex h-full flex-col rounded-2xl p-5">
            <div className="mb-2 flex items-start justify-between gap-2">
              <h2 className="font-display text-sm font-semibold">{p.title}</h2>
              <div className="flex items-center gap-1">
                {p.user_id === null ? (
                  <Badge variant="violet" className="text-[10px]">
                    <Sparkles className="h-2.5 w-2.5" /> Standaard
                  </Badge>
                ) : (
                  <DeleteButton endpoint="/api/prompts" id={p.id} confirmText="Prompt verwijderen?" />
                )}
              </div>
            </div>
            <p className="flex-1 whitespace-pre-wrap rounded-xl bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-zinc-400">
              {p.content}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider text-zinc-600">{p.category}</span>
              <Button variant="secondary" size="sm" onClick={() => copy(p)}>
                {copied === p.id ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-400" /> Gekopieerd
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Kopieer
                  </>
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen} title="Eigen prompt opslaan">
        <form onSubmit={save} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="ptitle">Titel</Label>
            <Input id="ptitle" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pcat">Categorie</Label>
            <Input id="pcat" required value={cat} onChange={(e) => setCat(e.target.value)}
              placeholder="bijv. marketing" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pcontent">Prompt</Label>
            <Textarea id="pcontent" required rows={6} value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Gebruik [haakjes] voor variabelen die je later invult." />
          </div>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          <Button type="submit" className="w-full" disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Opslaan
          </Button>
        </form>
      </Dialog>
    </div>
  );
}
