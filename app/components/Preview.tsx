"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useRef, useState } from "react";

interface PreviewProps {
  html: string;
  isLoading: boolean;
}

export default function Preview({ html, isLoading }: PreviewProps) {
  const [copied, setCopied] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(html);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-website.html";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-800 border-b border-zinc-700 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="ml-3 text-zinc-500 text-xs">Live Preview</span>
        </div>
        <AnimatePresence>
          {html && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2"
            >
              <button
                onClick={handleCopy}
                className="text-xs px-3 py-1 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-300 hover:text-white transition-colors"
              >
                {copied ? "✓ Copied!" : "Copy HTML"}
              </button>
              <button
                onClick={handleDownload}
                className="text-xs px-3 py-1 rounded-lg bg-violet-600 hover:bg-violet-500 text-white transition-colors"
              >
                ↓ Download
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Preview area */}
      <div className="relative flex-1 bg-white overflow-hidden">
        {/* Empty state */}
        {!html && !isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-900">
            <div className="text-5xl">✨</div>
            <p className="text-zinc-400 text-sm text-center max-w-xs">
              Describe your website on the left and hit{" "}
              <strong className="text-white">Build My Website</strong>. Your
              site will appear here.
            </p>
          </div>
        )}

        {/* Loading shimmer */}
        {isLoading && !html && (
          <div className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center gap-4">
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full bg-violet-500"
                  animate={{ y: [0, -10, 0] }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                />
              ))}
            </div>
            <p className="text-zinc-400 text-sm">The AI is building your site...</p>
          </div>
        )}

        {/* Iframe preview */}
        {html && (
          <iframe
            ref={iframeRef}
            srcDoc={html}
            className="w-full h-full border-0"
            sandbox="allow-scripts"
            title="Generated Website Preview"
          />
        )}

        {/* Streaming overlay */}
        {isLoading && html && (
          <div className="absolute top-3 right-3">
            <span className="flex items-center gap-1.5 text-xs bg-violet-600/90 text-white px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Building...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
