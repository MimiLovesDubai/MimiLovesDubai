"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, MailCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Gebruik minimaal 8 tekens voor je wachtwoord.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    setLoading(false);
    if (error) {
      setError(
        error.message.includes("already registered")
          ? "Dit e-mailadres heeft al een account. Log in."
          : error.message
      );
      return;
    }
    // With email confirmation ON there is no session yet.
    if (!data.session) {
      setConfirmSent(true);
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5 font-display font-bold">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-grad text-[#1c1606] shadow-glow">
            <Sparkles className="h-4 w-4" />
          </span>
          MyAIAgent <span className="gold-text">OS</span>
        </Link>
        <div className="hud-ring glass rounded-2xl p-7">
          {confirmSent ? (
            <div className="text-center">
              <MailCheck className="mx-auto mb-3 h-10 w-10 text-gold" />
              <h1 className="font-display text-xl font-semibold">Check je inbox</h1>
              <p className="mt-2 text-sm text-muted">
                We hebben een bevestigingslink naar <span className="text-zinc-200">{email}</span> gestuurd.
                Klik erop en log daarna in.
              </p>
              <Link href="/login">
                <Button variant="secondary" className="mt-5 w-full">Naar inloggen</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="mb-1 font-display text-xl font-semibold">Maak je gratis account</h1>
              <p className="mb-6 text-sm text-muted">Direct toegang tot alle zes AI-werknemers.</p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name">Naam</Label>
                  <Input id="name" required value={fullName}
                    onChange={(e) => setFullName(e.target.value)} placeholder="Je naam" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email">E-mailadres</Label>
                  <Input id="email" type="email" required autoComplete="email"
                    value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jij@bedrijf.nl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Wachtwoord</Label>
                  <Input id="password" type="password" required autoComplete="new-password"
                    value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimaal 8 tekens" />
                </div>
                {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />} Account aanmaken
                </Button>
              </form>
              <p className="mt-4 text-center text-xs text-zinc-500">
                Door te registreren ga je akkoord met de{" "}
                <Link href="/terms" className="underline hover:text-zinc-300">voorwaarden</Link> en het{" "}
                <Link href="/privacy" className="underline hover:text-zinc-300">privacybeleid</Link>.
              </p>
              <p className="mt-4 text-center text-sm text-muted">
                Al een account?{" "}
                <Link href="/login" className="text-gold-bright hover:underline">Log in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
