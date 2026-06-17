"use client";

import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Message } from "@/types";
import { Sparkles, User, Copy, Check, Wrench } from "lucide-react";
import { useState } from "react";

/* ── Spring presets ────────────────────────────────────────── */
const SPRING_ENTER = { type: "spring" as const, stiffness: 260, damping: 22, mass: 0.9 };
const SPRING_POP   = { type: "spring" as const, stiffness: 320, damping: 20, mass: 0.8 };

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
  activeTool?: string | null;
}

// ── Inline code copy button with animated check ────────────
function CopyCodeButton({ code }: { code: string }) {
  const [done, setDone] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setDone(true);
    setTimeout(() => setDone(false), 1800);
  }

  return (
    <motion.button
      onClick={copy}
      whileTap={{ scale: 0.90 }}
      aria-label="Copy code"
      className="
        absolute top-2.5 right-2.5 flex items-center gap-1.5
        px-2.5 py-1 rounded-lg text-xs font-medium
        bg-zinc-800/90 border border-white/[0.06]
        text-zinc-400 opacity-0 group-hover/code:opacity-100
        hover:text-white hover:bg-zinc-700 hover:border-white/10
        transition-all duration-150
      "
    >
      <AnimatePresence mode="wait" initial={false}>
        {done ? (
          <motion.span
            key="check"
            className="flex items-center gap-1 text-emerald-400"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={SPRING_POP}
          >
            <Check className="w-3 h-3" /> Copied
          </motion.span>
        ) : (
          <motion.span
            key="copy"
            className="flex items-center gap-1"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={SPRING_POP}
          >
            <Copy className="w-3 h-3" /> Copy
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default function MessageBubble({
  message,
  isStreaming = false,
  activeTool = null,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  async function copyContent() {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <motion.div
      className={`flex gap-3.5 w-full ${isUser ? "justify-end" : "justify-start"}`}
      initial={{ opacity: 0, y: 16, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={SPRING_ENTER}
      layout="position"
    >
      {/* ── Assistant avatar ── */}
      {!isUser && (
        <motion.div
          className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 shadow-glow-sm"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}
          whileHover={{ scale: 1.1, boxShadow: "0 0 24px -4px rgba(124,58,237,0.7)" }}
          transition={SPRING_POP}
        >
          <Sparkles className="w-4 h-4 text-white" />
        </motion.div>
      )}

      {/* ── Message body ── */}
      <div className={`group relative max-w-[82%] ${isUser ? "items-end" : "items-start"} flex flex-col gap-1`}>

        {/* Tool call indicator with breathing dot */}
        <AnimatePresence>
          {!isUser && isStreaming && activeTool && (
            <motion.div
              className="flex items-center gap-2 px-3.5 py-2 rounded-full text-xs font-medium self-start"
              style={{
                background: "rgba(124,58,237,0.1)",
                border: "1px solid rgba(124,58,237,0.25)",
                color: "#c4b5fd",
                boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
              initial={{ opacity: 0, scale: 0.85, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 6 }}
              transition={SPRING_POP}
            >
              <span className="breathing-dot" />
              <Wrench className="w-3 h-3 text-penda-400" />
              <span>Using <span className="font-semibold text-penda-300">{activeTool}</span>…</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Bubble */}
        <motion.div
          className={`relative px-4 py-3.5 text-sm leading-relaxed ${
            isUser
              ? "rounded-2xl rounded-tr-md text-white"
              : "rounded-2xl rounded-tl-md text-zinc-100"
          }`}
          style={
            isUser
              ? {
                  background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.28), inset 0 1px 0 rgba(255,255,255,0.12)",
                }
              : {
                  background: "rgba(20,20,25,0.78)",
                  border: "1px solid rgba(255,255,255,0.07)",
                  backdropFilter: "blur(8px)",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.04)",
                }
          }
          whileHover={isUser ? { boxShadow: "0 6px 28px rgba(124,58,237,0.38), inset 0 1px 0 rgba(255,255,255,0.14)" } : {}}
          transition={{ duration: 0.2 }}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <div className="prose-penda">
              {message.content ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // @ts-expect-error — react-markdown inline prop type mismatch
                    code({ inline, className, children, ...props }) {
                      const match = /language-(\w+)/.exec(className || "");
                      const codeStr = String(children).replace(/\n$/, "");
                      return !inline && match ? (
                        <motion.div
                          className="relative group/code my-1"
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        >
                          {/* Language badge */}
                          <div className="absolute top-0 left-0 px-3 py-1 text-[10px] font-mono font-semibold text-zinc-500 uppercase tracking-wider select-none">
                            {match[1]}
                          </div>
                          <SyntaxHighlighter
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            style={oneDark as any}
                            language={match[1]}
                            PreTag="div"
                            customStyle={{
                              margin: 0,
                              borderRadius: "12px",
                              fontSize: "13px",
                              background: "#0b0b0f",
                              border: "1px solid rgba(255,255,255,0.07)",
                              paddingTop: "30px",
                              boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
                            }}
                          >
                            {codeStr}
                          </SyntaxHighlighter>
                          <CopyCodeButton code={codeStr} />
                        </motion.div>
                      ) : (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                    // Fade-in tables
                    table({ children }) {
                      return (
                        <motion.table
                          className="w-full border-collapse my-3 text-sm"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          {children}
                        </motion.table>
                      );
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              ) : (
                /* Typing bouncing dots */
                <div className="flex items-center gap-1.5 py-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-penda-400/60"
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.14, ease: "easeInOut" }}
                    />
                  ))}
                </div>
              )}

              {/* Live streaming cursor — glowing bar */}
              {isStreaming && message.content && (
                <span className="streaming-cursor" aria-hidden="true" />
              )}
            </div>
          )}
        </motion.div>

        {/* Copy button — assistant only, after streaming ends */}
        <AnimatePresence>
          {!isUser && message.content && !isStreaming && (
            <motion.button
              onClick={copyContent}
              whileTap={{ scale: 0.88 }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 0, y: 0 }}
              whileHover={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="
                group-hover:opacity-100 transition-opacity
                self-start mt-0.5 flex items-center gap-1.5
                px-2 py-1 rounded-lg text-xs
                text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/70
              "
              aria-label="Copy message"
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span
                    key="done"
                    className="flex items-center gap-1 text-emerald-400"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={SPRING_POP}
                  >
                    <Check className="w-3 h-3" /> Copied
                  </motion.span>
                ) : (
                  <motion.span
                    key="idle"
                    className="flex items-center gap-1"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={SPRING_POP}
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── User avatar ── */}
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center mt-0.5 bg-zinc-800 border border-white/[0.07]">
          <User className="w-4 h-4 text-zinc-300" />
        </div>
      )}
    </motion.div>
  );
}
