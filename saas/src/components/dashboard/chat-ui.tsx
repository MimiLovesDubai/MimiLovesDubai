"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Send, ListPlus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgentIcon } from "@/components/agent-icon";

type Msg = { role: "user" | "assistant"; content: string };

/** Minimal, safe markdown-ish renderer (escape first, then light formatting). */
function renderMessage(text: string): string {
  let s = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // fenced code blocks
  s = s.replace(/```([\s\S]*?)```/g, (_m, code) => `<pre><code>${code.trim()}</code></pre>`);
  // inline code
  s = s.replace(/`([^`\n]+)`/g, "<code>$1</code>");
  // headings
  s = s.replace(/^### (.*)$/gm, "<h3>$1</h3>");
  s = s.replace(/^## (.*)$/gm, "<h2>$1</h2>");
  s = s.replace(/^# (.*)$/gm, "<h1>$1</h1>");
  // bold / italic
  s = s.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
  // lists
  s = s.replace(/((?:^[-•] .*(?:\n|$))+)/gm, (m) => {
    const items = m
      .trim()
      .split("\n")
      .map((l) => `<li>${l.replace(/^[-•] /, "")}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });
  s = s.replace(/((?:^\d+\. .*(?:\n|$))+)/gm, (m) => {
    const items = m
      .trim()
      .split("\n")
      .map((l) => `<li>${l.replace(/^\d+\. /, "")}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });
  // paragraphs
  s = s
    .split(/\n{2,}/)
    .map((block) =>
      /^<(h\d|ul|ol|pre)/.test(block.trim()) ? block : `<p>${block.replace(/\n/g, "<br/>")}</p>`
    )
    .join("");
  return s;
}

export function ChatUI({
  conversationId,
  agentName,
  agentIcon,
  agentTagline,
  initialMessages,
}: {
  conversationId: string;
  agentName: string;
  agentIcon: string;
  agentTagline: string;
  initialMessages: Msg[];
}) {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskNotice, setTaskNotice] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setError(null);
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { role: "user", content: text }, { role: "assistant", content: "" }]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId, message: text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setMessages((m) => m.slice(0, -1)); // drop empty assistant bubble
        setError(data.error || "Er ging iets mis. Probeer opnieuw.");
        return;
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) throw new Error("no stream");
      let acc = "";
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setMessages((m) => {
          const copy = [...m];
          copy[copy.length - 1] = { role: "assistant", content: acc };
          return copy;
        });
      }
    } catch {
      setError("Verbinding verbroken tijdens het genereren.");
    } finally {
      setBusy(false);
      taRef.current?.focus();
    }
  }

  async function generateTasks() {
    setGenerating(true);
    setTaskNotice(null);
    setError(null);
    try {
      const res = await fetch("/api/tasks/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ conversationId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Taken genereren mislukte.");
        return;
      }
      setTaskNotice(`${data.tasks.length} taken toegevoegd aan je takenlijst.`);
    } catch {
      setError("Netwerkfout bij taken genereren.");
    } finally {
      setGenerating(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex h-[calc(100vh-8.5rem)] flex-col md:h-[calc(100vh-10rem)]">
      {/* Header */}
      <div className="glass mb-4 flex items-center justify-between rounded-2xl px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gold-grad text-[#1c1606]">
            <AgentIcon icon={agentIcon} className="h-4 w-4" />
          </span>
          <div>
            <p className="font-display text-sm font-semibold">{agentName}</p>
            <p className="text-xs text-zinc-500">{agentTagline}</p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={generateTasks}
          disabled={generating || messages.length === 0}
          title="Zet dit gesprek om in concrete taken"
        >
          {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <ListPlus className="h-4 w-4" />}
          Genereer taken
        </Button>
      </div>

      {taskNotice && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-sm text-emerald-300">
          <Check className="h-4 w-4" /> {taskNotice}{" "}
          <Link href="/dashboard/tasks" className="underline">Bekijk taken</Link>
        </div>
      )}
      {error && (
        <div className="mb-3 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.length === 0 && (
          <div className="hud-ring glass mx-auto mt-10 max-w-md rounded-3xl p-8 text-center">
            <AgentIcon icon={agentIcon} className="mx-auto mb-3 h-8 w-8 text-gold" />
            <h2 className="font-display text-lg font-semibold">{agentName} staat klaar</h2>
            <p className="mt-2 text-sm text-muted">
              Beschrijf wat je nodig hebt — hoe concreter je vraag, hoe beter het resultaat.
            </p>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm md:max-w-[75%] ${
                m.role === "user"
                  ? "bg-gold-grad text-[#1c1606] font-medium rounded-br-md"
                  : "glass rounded-bl-md"
              }`}
            >
              {m.role === "assistant" ? (
                m.content ? (
                  <div
                    className="msg-body"
                    dangerouslySetInnerHTML={{ __html: renderMessage(m.content) }}
                  />
                ) : (
                  <span className="flex items-center gap-2 text-zinc-400">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> {agentName} denkt na…
                  </span>
                )
              ) : (
                <span className="whitespace-pre-wrap">{m.content}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="mt-4">
        <div className="glass flex items-end gap-2.5 rounded-2xl p-2.5 focus-within:border-gold/40">
          <textarea
            ref={taRef}
            rows={1}
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 160) + "px";
            }}
            onKeyDown={onKeyDown}
            placeholder={`Vraag ${agentName} iets… (Enter = versturen, Shift+Enter = nieuwe regel)`}
            className="max-h-40 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 focus:outline-none"
            disabled={busy}
          />
          <Button size="icon" onClick={send} disabled={busy || !input.trim()} aria-label="Versturen">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-zinc-600">
          AI kan fouten maken — controleer belangrijke output voordat je die gebruikt.
        </p>
      </div>
    </div>
  );
}
