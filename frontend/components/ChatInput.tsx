"use client";

import { useRef, useState, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Square, Paperclip, X, FileText, AlertCircle } from "lucide-react";
import clsx from "clsx";
import { PendingDocument } from "@/types";

/* ── Spring presets ────────────────────────────────────────── */
const SPRING_ENTER = { type: "spring" as const, stiffness: 300, damping: 22, mass: 0.8 };
const SPRING_POP   = { type: "spring" as const, stiffness: 380, damping: 20, mass: 0.7 };

const ACCEPTED_TYPES =
  ".txt,.md,.csv,.json,.py,.js,.ts,.tsx,.jsx,.html,.xml,.yaml,.yml,.cpp,.java,.c,.h,.hpp,.cs,.php,.rb,.swift,.go,.rs,.pdf";
const MAX_SIZE_BYTES = 500_000;

interface ChatInputProps {
  onSend: (text: string, docContent?: string, docName?: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
}: ChatInputProps) {
  const [value,      setValue]      = useState("");
  const [pendingDoc, setPendingDoc] = useState<PendingDocument | null>(null);
  const [fileError,  setFileError]  = useState<string | null>(null);
  const [focused,    setFocused]    = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /* ── Auto-grow textarea ── */
  function autoResize() {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 220)}px`;
  }

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    autoResize();
  }

  /* Reset height on submit */
  function handleSubmit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = value.trim();
    if (isStreaming || disabled) return;
    if (!text && !pendingDoc) return;
    const msg = text || (pendingDoc ? `Please analyze the attached document: ${pendingDoc.name}` : "");
    onSend(msg, pendingDoc?.content, pendingDoc?.name);
    setValue("");
    setPendingDoc(null);
    setFileError(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  }

  function handleFileClick() {
    setFileError(null);
    fileInputRef.current?.click();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!e.target.files?.length) return;
    e.target.value = "";
    if (!file) return;

    if (file.size > MAX_SIZE_BYTES) {
      setFileError(`File too large (max 500 KB). This file is ${(file.size / 1024).toFixed(0)} KB.`);
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (!result) { setFileError("Could not read file."); return; }
      setPendingDoc({ name: file.name, content: result, size: file.size });
      setFileError(null);
    };
    reader.onerror = () => setFileError("Failed to read file.");

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      reader.readAsDataURL(file);
    } else {
      reader.readAsText(file);
    }
  }

  const canSend = !isStreaming && !disabled && (value.trim().length > 0 || pendingDoc !== null);
  const isActive = focused || value.length > 0 || !!pendingDoc;

  return (
    <div className="px-4 pb-4 pt-2">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES}
        className="hidden"
        onChange={handleFileChange}
        aria-label="Attach document"
      />

      {/* File error */}
      <AnimatePresence>
        {fileError && (
          <motion.div
            className="flex items-center gap-2 mb-2 px-3.5 py-2.5 rounded-xl text-sm text-red-400"
            style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)" }}
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{ opacity: 0, y: 8,    scale: 0.96 }}
            transition={SPRING_ENTER}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{fileError}</span>
            <motion.button
              onClick={() => setFileError(null)}
              whileTap={{ scale: 0.88 }}
              className="text-red-500 hover:text-red-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pending document chip */}
      <AnimatePresence>
        {pendingDoc && (
          <motion.div
            className="flex items-center gap-2.5 mb-2 px-3.5 py-2.5 rounded-xl text-sm relative overflow-hidden"
            style={{
              background: "rgba(124,58,237,0.08)",
              border: "1px solid rgba(124,58,237,0.28)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0,   scale: 1 }}
            exit={{ opacity: 0,   y: 10,   scale: 0.95 }}
            transition={SPRING_POP}
          >
            {/* subtle shimmer background */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(167,139,250,0.08), transparent)",
                backgroundSize: "200% 100%",
                animation: "shimmer 2s infinite",
              }}
              aria-hidden="true"
            />
            <FileText className="w-4 h-4 text-penda-400 flex-shrink-0 relative z-10" />
            <div className="flex-1 min-w-0 relative z-10">
              <span className="text-penda-300 font-medium truncate block">{pendingDoc.name}</span>
              <span className="text-zinc-500 text-xs">{(pendingDoc.size / 1024).toFixed(1)} KB</span>
            </div>
            <motion.button
              onClick={() => setPendingDoc(null)}
              whileTap={{ scale: 0.88 }}
              className="text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0 relative z-10"
              aria-label="Remove document"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main input form ── */}
      <motion.form
        onSubmit={handleSubmit}
        className="relative rounded-2xl border"
        animate={{
          borderColor: isActive
            ? "rgba(124,58,237,0.5)"
            : "rgba(255,255,255,0.08)",
          boxShadow: isActive
            ? "0 0 0 3px rgba(124,58,237,0.10), 0 4px 28px rgba(0,0,0,0.25)"
            : "0 4px 24px rgba(0,0,0,0.18)",
        }}
        transition={{ duration: 0.2 }}
        style={{ background: "rgba(14,14,18,0.92)", backdropFilter: "blur(8px)" }}
        layout
      >
        <textarea
          id="chat-input"
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          rows={1}
          disabled={disabled || isStreaming}
          placeholder={
            isStreaming
              ? "Penda is thinking…"
              : pendingDoc
              ? "Ask something about the document, or press Send…"
              : "Ask anything… (Shift+Enter for newline)"
          }
          className={clsx(
            "w-full resize-none bg-transparent text-[14.5px] text-zinc-100 placeholder-zinc-600",
            "px-4 py-3.5 pr-28 outline-none leading-relaxed",
            "transition-[height] duration-150 ease-out",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
          style={{ minHeight: 52, maxHeight: 220 }}
        />

        {/* Action buttons row */}
        <div className="absolute right-3 bottom-3 flex items-center gap-2">

          {/* Paperclip */}
          <motion.button
            type="button"
            onClick={handleFileClick}
            disabled={isStreaming}
            whileTap={{ scale: 0.88 }}
            className={clsx(
              "p-1.5 rounded-lg transition-colors",
              pendingDoc
                ? "text-penda-400 bg-penda-500/10"
                : "text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60"
            )}
            title={`Attach a document (${ACCEPTED_TYPES})`}
          >
            <Paperclip className="w-4 h-4" />
          </motion.button>

          {/* Send / Stop — spring-loaded swap */}
          <AnimatePresence mode="wait">
            {isStreaming ? (
              <motion.button
                key="stop"
                type="button"
                onClick={onStop}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-zinc-700 hover:bg-zinc-600 border border-white/[0.08]"
                initial={{ scale: 0.5, opacity: 0, rotate: -90 }}
                animate={{ scale: 1,   opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5,    opacity: 0, rotate: 90 }}
                transition={SPRING_POP}
                whileTap={{ scale: 0.88 }}
                title="Stop generation"
              >
                <Square className="w-3.5 h-3.5 text-zinc-200" fill="currentColor" />
              </motion.button>
            ) : (
              <motion.button
                key="send"
                type="submit"
                disabled={!canSend}
                className={clsx(
                  "flex items-center justify-center w-9 h-9 rounded-xl",
                  canSend
                    ? "shadow-glow-sm hover:shadow-glow-violet border border-penda-400/20"
                    : "bg-zinc-800 border border-white/[0.04] text-zinc-600 cursor-not-allowed"
                )}
                style={canSend ? { background: "linear-gradient(135deg, #7c3aed, #4f46e5)" } : {}}
                initial={{ scale: 0.5, opacity: 0, rotate: 90 }}
                animate={{ scale: 1,   opacity: 1, rotate: 0 }}
                exit={{ scale: 0.5,    opacity: 0, rotate: -90 }}
                transition={SPRING_POP}
                whileTap={{ scale: 0.88 }}
                title="Send message (Enter)"
              >
                <motion.div
                  animate={canSend ? { rotate: 0 } : { rotate: 0 }}
                  transition={SPRING_POP}
                >
                  <Send className="w-4 h-4 text-white" />
                </motion.div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.form>

      <p className="hidden sm:block text-center text-zinc-700/70 text-[11px] mt-2">
        Penda can make mistakes. Verify important information.
      </p>
    </div>
  );
}
