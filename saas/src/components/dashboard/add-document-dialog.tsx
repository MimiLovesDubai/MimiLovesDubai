"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, Upload } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function AddDocumentDialog({ projectId }: { projectId: string }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1_000_000) {
      setError("Bestand is groter dan 1 MB. Plak de belangrijkste tekst handmatig.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setContent(String(reader.result || "").slice(0, 200_000));
      if (!title) setTitle(file.name.replace(/\.(txt|md|csv)$/i, ""));
    };
    reader.readAsText(file);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError("Voeg tekst toe (plakken of een .txt/.md-bestand kiezen).");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, title, content }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Er ging iets mis.");
        return;
      }
      setOpen(false);
      setTitle("");
      setContent("");
      router.refresh();
    } catch {
      setError("Netwerkfout. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Document toevoegen
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title="Document toevoegen">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="dtitle">Titel</Label>
            <Input id="dtitle" required value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="Bijv. Doelgroep-onderzoek" />
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="dcontent">Inhoud</Label>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1 text-xs text-gold-bright hover:underline"
              >
                <Upload className="h-3 w-3" /> .txt / .md uploaden
              </button>
              <input
                ref={fileRef}
                type="file"
                accept=".txt,.md,.csv,text/plain,text/markdown"
                className="hidden"
                onChange={onFile}
              />
            </div>
            <Textarea
              id="dcontent"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Plak hier notities, onderzoek, merkrichtlijnen… Agents gebruiken dit als context."
            />
          </div>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Opslaan
          </Button>
        </form>
      </Dialog>
    </>
  );
}
