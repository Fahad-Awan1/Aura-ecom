"use client";

import Image from "next/image";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { ArrowUp, MessageCircle, RotateCcw, X } from "lucide-react";
import { StarMark } from "@/components/ui/Logo";
import { answer, WELCOME, type BotReply, type ChatMemory } from "@/lib/chatbot";
import { formatPrice, getColor } from "@/lib/products";
import { useShop } from "@/lib/store";

type Message = { id: number; from: "user" | "bot"; text: string; reply?: BotReply };

const STORAGE_KEY = "aura-chat";

/** Renders **bold** and line breaks from the hardcoded answers. */
function RichText({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line.split(/(\*\*[^*]+\*\*)/g).map((part, j) => (part.startsWith("**") ? <b key={j} className="font-semibold">{part.slice(2, -2)}</b> : part))}
        </Fragment>
      ))}
    </>
  );
}

function load(): Message[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [{ id: 0, from: "bot", text: WELCOME.text, reply: WELCOME }];
}

export default function ChatWidget() {
  const open = useShop((s) => s.chatOpen);
  const setOpen = useShop((s) => s.setChatOpen);
  const cartOpen = useShop((s) => s.cartOpen);
  const [messages, setMessages] = useState<Message[]>(() => [{ id: 0, from: "bot", text: WELCOME.text, reply: WELCOME }]);
  const [restored, setRestored] = useState(false);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(true);
  const memory = useRef<ChatMemory>({});
  const list = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);

  // restore the conversation for this tab once the panel is first opened
  if (open && !restored) {
    setRestored(true);
    setMessages(load());
  }

  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {}
  }, [messages, restored]);

  useEffect(() => {
    list.current?.scrollTo({ top: list.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing, open]);

  useEffect(() => {
    if (open) window.setTimeout(() => field.current?.focus(), 250);
  }, [open]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || typing) return;
    setInput("");
    setMessages((m) => [...m, { id: Date.now(), from: "user", text: t }]);
    setTyping(true);
    const reply = answer(t, memory.current);
    // a short, length-aware "typing" pause feels more natural than an instant answer
    window.setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { id: Date.now() + 1, from: "bot", text: reply.text, reply }]);
    }, Math.min(500 + reply.text.length * 6, 1400));
  };

  const reset = () => {
    memory.current = {};
    setMessages([{ id: Date.now(), from: "bot", text: WELCOME.text, reply: WELCOME }]);
  };

  const last = messages[messages.length - 1];

  return (
    <>
      {/* launcher */}
      <button
        onClick={() => {
          setOpen(!open);
          setUnread(false);
        }}
        aria-label={open ? "Close chat" : "Chat with Aria, our style assistant"}
        aria-expanded={open}
        className={clsx(
          "fixed bottom-4 right-4 z-[58] grid h-14 w-14 place-items-center rounded-full bg-brown-900 text-cream shadow-[0_15px_40px_-10px_rgba(42,29,20,0.7)] transition-all duration-500 hover:scale-105 hover:bg-gold sm:bottom-6 sm:right-6",
          cartOpen && "pointer-events-none scale-0 opacity-0",
        )}
      >
        <span className={clsx("absolute transition-all duration-500", open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0")}>
          <X className="h-6 w-6" strokeWidth={1.5} />
        </span>
        <span className={clsx("absolute transition-all duration-500", open ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100")}>
          <MessageCircle className="h-6 w-6" strokeWidth={1.5} />
        </span>
        {unread && !open && <span className="absolute right-0.5 top-0.5 h-3.5 w-3.5 animate-pulse rounded-full border-2 border-white bg-gold" />}
      </button>

      {/* panel */}
      <section
        aria-label="Aura style assistant"
        aria-hidden={!open}
        data-lenis-prevent
        className={clsx(
          "fixed z-[58] flex flex-col overflow-hidden bg-ivory shadow-[0_30px_80px_-20px_rgba(42,29,20,0.55)] transition-[opacity,transform] duration-500 ease-[cubic-bezier(.2,.9,.3,1)]",
          "inset-x-2 bottom-20 top-20 rounded-3xl sm:inset-x-auto sm:bottom-24 sm:right-6 sm:top-auto sm:h-[min(640px,calc(100dvh-8rem))] sm:w-[400px]",
          open ? "translate-y-0 scale-100 opacity-100" : "pointer-events-none translate-y-6 scale-95 opacity-0",
        )}
        style={{ transformOrigin: "bottom right" }}
      >
        <header className="flex items-center gap-3 bg-brown-900 px-5 py-4 text-cream">
          <span className="relative grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-gold to-[#7a5a40]">
            <StarMark className="h-5 w-5" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-brown-900 bg-emerald-400" />
          </span>
          <div className="flex-1">
            <p className="font-display text-lg leading-none">Aria</p>
            <p className="mt-1 text-[0.65rem] uppercase tracking-[0.2em] text-cream/60">Aura style assistant · online</p>
          </div>
          <button onClick={reset} aria-label="Restart conversation" title="Restart" className="grid h-8 w-8 place-items-center rounded-full text-cream/70 hover:bg-cream/10 hover:text-cream">
            <RotateCcw className="h-4 w-4" />
          </button>
          <button onClick={() => setOpen(false)} aria-label="Close chat" className="grid h-8 w-8 place-items-center rounded-full text-cream/70 hover:bg-cream/10 hover:text-cream">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div ref={list} className="flex-1 space-y-4 overflow-y-auto px-4 py-5" aria-live="polite">
          {messages.map((m) => (
            <div key={m.id} className={clsx("flex animate-[msg-in_.4s_ease-out]", m.from === "user" ? "justify-end" : "justify-start")}>
              <div className={clsx("max-w-[88%]", m.from === "bot" && "w-full")}>
                <div
                  className={clsx(
                    "inline-block rounded-2xl px-4 py-2.5 text-[0.86rem] leading-relaxed",
                    m.from === "user" ? "rounded-br-md bg-brown-900 text-cream" : "rounded-bl-md bg-white text-ink shadow-[0_2px_10px_-4px_rgba(59,42,30,0.25)]",
                  )}
                >
                  <RichText text={m.text} />
                </div>

                {m.reply?.products && (
                  <div className="no-scrollbar -mx-1 mt-2 flex gap-2.5 overflow-x-auto px-1 pb-1">
                    {m.reply.products.map(({ product, color }) => {
                      const c = getColor(product, color);
                      return (
                        <Link
                          key={product.slug}
                          href={`/shop/${product.slug}${c.name !== product.colors[0].name ? `?color=${encodeURIComponent(c.name)}` : ""}`}
                          onClick={() => window.innerWidth < 640 && setOpen(false)}
                          className="group w-32 shrink-0 overflow-hidden rounded-xl bg-white shadow-[0_2px_10px_-4px_rgba(59,42,30,0.25)]"
                        >
                          <span className="relative block aspect-[3/4] overflow-hidden bg-cream">
                            <Image src={c.image} alt={product.name} fill sizes="128px" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                          </span>
                          <span className="block p-2">
                            <span className="block truncate text-xs font-medium">{product.name}</span>
                            <span className="mt-0.5 block text-[0.7rem] text-taupe">
                              {formatPrice(product.price)} · {c.name}
                            </span>
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}

                {m.reply?.link && (
                  <Link href={m.reply.link.href} className="mt-2 inline-block text-xs font-medium uppercase tracking-[0.18em] text-gold underline-offset-4 hover:underline">
                    {m.reply.link.label} →
                  </Link>
                )}

                {/* only the latest bot message keeps its quick replies */}
                {m === last && m.reply?.suggestions && !typing && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {m.reply.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => send(s)}
                        className="rounded-full border border-brown-900/20 bg-white px-3 py-1.5 text-xs text-brown-900 transition-colors hover:border-brown-900 hover:bg-brown-900 hover:text-cream"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {typing && (
            <div className="flex">
              <div className="flex items-center gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3.5 shadow-[0_2px_10px_-4px_rgba(59,42,30,0.25)]" aria-label="Aria is typing">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="h-1.5 w-1.5 rounded-full bg-taupe" style={{ animation: `typing 1.1s ${i * 0.15}s infinite` }} />
                ))}
              </div>
            </div>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="flex items-center gap-2 border-t border-brown-900/10 bg-white p-3"
        >
          <input
            ref={field}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about products, sizes, delivery…"
            aria-label="Message"
            className="min-w-0 flex-1 rounded-full bg-cream/70 px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-brown-900/30"
          />
          <button
            type="submit"
            disabled={!input.trim() || typing}
            aria-label="Send"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brown-900 text-cream transition-colors hover:bg-gold disabled:opacity-30"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </form>
      </section>
    </>
  );
}
