import Anthropic from "@anthropic-ai/sdk";

export const AI_MODEL = process.env.ANTHROPIC_MODEL || "claude-opus-4-8";

let _client: Anthropic | null = null;

export function aiConfigured() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export function getAnthropic(): Anthropic {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY ontbreekt. Zet hem in .env.local (zie .env.example)."
      );
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

/**
 * Compose the system prompt for an agent call: the agent persona + optional
 * project context (name, description, documents). Documents are truncated to
 * keep requests fast and affordable.
 */
export function buildSystemPrompt(opts: {
  agentPrompt: string;
  projectName?: string | null;
  projectDescription?: string | null;
  documents?: { title: string; content: string }[];
}) {
  const parts = [opts.agentPrompt];

  if (opts.projectName) {
    parts.push(
      `\n\nPROJECTCONTEXT\nProject: ${opts.projectName}` +
        (opts.projectDescription ? `\nOmschrijving: ${opts.projectDescription}` : "")
    );
  }

  const docs = (opts.documents || []).filter((d) => d.content?.trim());
  if (docs.length) {
    const MAX_PER_DOC = 6000;
    const MAX_TOTAL = 24000;
    let used = 0;
    const rendered: string[] = [];
    for (const d of docs) {
      if (used >= MAX_TOTAL) break;
      const slice = d.content.slice(0, Math.min(MAX_PER_DOC, MAX_TOTAL - used));
      used += slice.length;
      rendered.push(`--- Document: ${d.title} ---\n${slice}`);
    }
    parts.push(
      `\n\nDOCUMENTEN (door de gebruiker aan dit project toegevoegd; gebruik als bron):\n${rendered.join("\n\n")}`
    );
  }

  return parts.join("");
}
