"use client";

import { useState } from "react";
import PromptBar from "./components/PromptBar";
import Preview from "./components/Preview";

export default function Home() {
  const [html, setHtml] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (prompt: string) => {
    setIsLoading(true);
    setHtml("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(
          res.status === 401
            ? "⚠️ Your Claude API key is missing or invalid.\n\nOpen .env.local and paste your key from console.anthropic.com"
            : err.error || "Something went wrong. Check your API key and try again."
        );
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setHtml(accumulated);
      }
    } catch {
      alert("Network error. Make sure the dev server is running.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-zinc-950 text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 shrink-0 border-r border-zinc-800 flex flex-col">
        <div className="p-5 flex-1 overflow-y-auto">
          <PromptBar onGenerate={handleGenerate} isLoading={isLoading} />
        </div>
        <div className="px-5 py-3 border-t border-zinc-800">
          <p className="text-zinc-600 text-xs text-center">
            Powered by Claude AI · UI/UX Pro Max · Framer Motion
          </p>
        </div>
      </aside>

      {/* Preview */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <Preview html={html} isLoading={isLoading} />
      </main>
    </div>
  );
}
