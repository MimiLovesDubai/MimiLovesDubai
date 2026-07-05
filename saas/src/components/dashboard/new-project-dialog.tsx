"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export function NewProjectDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Er ging iets mis.");
        return;
      }
      setOpen(false);
      setName("");
      setDescription("");
      router.push(`/dashboard/projects/${data.id}`);
      router.refresh();
    } catch {
      setError("Netwerkfout. Probeer opnieuw.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Nieuw project
      </Button>
      <Dialog open={open} onOpenChange={setOpen} title="Nieuw project">
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="pname">Naam</Label>
            <Input id="pname" required value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Bijv. Webshop kaarsen" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pdesc">Omschrijving (optioneel)</Label>
            <Textarea id="pdesc" value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Waar gaat dit project over? Doelgroep, aanbod, doelen… Hoe meer context, hoe beter je agents werken." />
          </div>
          {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Project aanmaken
          </Button>
        </form>
      </Dialog>
    </>
  );
}
