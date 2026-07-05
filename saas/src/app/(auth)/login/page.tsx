"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Sparkles, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError(
        error.message === "Invalid login credentials"
          ? "Onjuiste e-mail of wachtwoord."
          : error.message
      );
      return;
    }
    router.push(search.get("next") || "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="email">E-mailadres</Label>
        <Input id="email" type="email" required autoComplete="email"
          value={email} onChange={(e) => setEmail(e.target.value)} placeholder="jij@bedrijf.nl" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">Wachtwoord</Label>
        <Input id="password" type="password" required autoComplete="current-password"
          value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
      </div>
      {error && <p className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
      <Button type="submit" className="w-full" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />} Inloggen
      </Button>
    </form>
  );
}

export default function LoginPage() {
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
          <h1 className="mb-1 font-display text-xl font-semibold">Welkom terug</h1>
          <p className="mb-6 text-sm text-muted">Log in op je commandocentrum.</p>
          <Suspense>
            <LoginForm />
          </Suspense>
          <p className="mt-6 text-center text-sm text-muted">
            Nog geen account?{" "}
            <Link href="/register" className="text-gold-bright hover:underline">Start gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
