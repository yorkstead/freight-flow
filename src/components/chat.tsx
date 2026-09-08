"use client";

import { useState, useRef, useCallback, type FormEvent } from "react";

/**
 * Streaming Chat Component
 * ========================
 * A minimal client component that demonstrates:
 *   1. Sending messages to the /api/ai/chat endpoint
 *   2. Reading a streaming response with the ReadableStream API
 *   3. Rendering tokens as they arrive
 *
 * This uses plain fetch + Web Streams — no extra SDK or hook needed.
 * Copy and adapt this pattern for any streaming AI feature.
 */

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      const trimmed = input.trim();
      if (!trimmed || isStreaming) return;

      // Add the user message
      const userMessage: Message = { role: "user", content: trimmed };
      const updatedMessages = [...messages, userMessage];
      setMessages(updatedMessages);
      setInput("");
      setIsStreaming(true);

      // Prepare the assistant placeholder
      const assistantMessage: Message = { role: "assistant", content: "" };
      setMessages([...updatedMessages, assistantMessage]);

      try {
        // --- Fetch the streaming response ---
        abortRef.current = new AbortController();

        const response = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: updatedMessages }),
          signal: abortRef.current.signal,
        });

        if (!response.ok || !response.body) {
          throw new Error(`API error: ${response.status}`);
        }

        // --- Read the stream token by token ---
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          accumulated += decoder.decode(value, { stream: true });

          // Update the last message with accumulated text
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              role: "assistant",
              content: accumulated,
            };
            return next;
          });
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          // User cancelled — not an error
        } else {
          console.error("Chat error:", err);
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = {
              role: "assistant",
              content: "Something went wrong. Check the console for details.",
            };
            return next;
          });
        }
      } finally {
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [input, messages, isStreaming]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Message list */}
      <div className="flex max-h-96 flex-col gap-3 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-gray-400 italic">
            Send a message to start the conversation.
          </p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`rounded-lg px-4 py-2 text-sm whitespace-pre-wrap ${
              msg.role === "user"
                ? "self-end bg-blue-600 text-white"
                : "self-start bg-gray-100 text-gray-800"
            }`}
          >
            {msg.content || (
              <span className="animate-pulse text-gray-400">Thinking…</span>
            )}
          </div>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message…"
          disabled={isStreaming}
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2 text-sm
                     focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500
                     disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isStreaming || !input.trim()}
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white
                     hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50"
        >
          {isStreaming ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
