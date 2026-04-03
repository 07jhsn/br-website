"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const EXAMPLES = [
  "Landing page for a dog grooming salon, fun and colorful",
  "Dark minimalist portfolio for a photographer",
  "Bakery website with warm, cozy vibes",
  "SaaS dashboard for a project management tool",
  "Pizza restaurant site, bold and appetizing",
];

interface PromptBarProps {
  onGenerate: (prompt: string) => void;
  isLoading: boolean;
}

export default function PromptBar({ onGenerate, isLoading }: PromptBarProps) {
  const [prompt, setPrompt] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) onGenerate(prompt.trim());
  };

  const useExample = (example: string) => {
    setPrompt(example);
    onGenerate(example);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col gap-4"
    >
      <div>
        <h1 className="text-2xl font-bold text-white mb-1">
          AI Website Builder
        </h1>
        <p className="text-zinc-400 text-sm">
          Describe your website — the AI builds it instantly.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Landing page for a coffee shop, warm and modern..."
          rows={4}
          className="w-full rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 p-3 text-sm resize-none focus:outline-none focus:border-violet-500 transition-colors"
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSubmit(e);
          }}
        />
        <motion.button
          type="submit"
          disabled={!prompt.trim() || isLoading}
          whileTap={{ scale: 0.97 }}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-semibold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Building your site...
            </span>
          ) : (
            "✨ Build My Website"
          )}
        </motion.button>
      </form>

      <div>
        <p className="text-zinc-500 text-xs mb-2">Try an example:</p>
        <div className="flex flex-col gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => useExample(ex)}
              disabled={isLoading}
              className="text-left text-xs text-zinc-400 hover:text-violet-400 hover:bg-zinc-800 rounded-lg px-3 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
