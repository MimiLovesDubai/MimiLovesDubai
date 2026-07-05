import type { SupabaseClient } from "@supabase/supabase-js";
import { planFor } from "@/lib/plans";

/** First day of the current month (UTC) as ISO string. */
export function monthStartIso() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export async function getUsageAndLimit(supabase: SupabaseClient, userId: string) {
  const [{ count }, { data: sub }] = await Promise.all([
    supabase
      .from("usage_logs")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStartIso()),
    supabase.from("subscriptions").select("plan,status").eq("user_id", userId).maybeSingle(),
  ]);
  const plan = planFor(sub?.plan);
  return {
    used: count ?? 0,
    limit: plan.messagesPerMonth,
    plan,
    remaining: Math.max(0, plan.messagesPerMonth - (count ?? 0)),
  };
}

export async function logUsage(
  supabase: SupabaseClient,
  userId: string,
  kind: "chat" | "task_gen",
  model: string,
  inputTokens: number,
  outputTokens: number
) {
  await supabase.from("usage_logs").insert({
    user_id: userId,
    kind,
    model,
    input_tokens: inputTokens,
    output_tokens: outputTokens,
  });
}
