"use client";

import { useState, useRef, useEffect } from "react";
import { ChatbotPlugin, type ChatMessage } from "@/lib/ai/plugins/chatbotPlugin";
import { MessageSquare, X, Send, Sparkles, Bot, User, Loader2 } from "lucide-react";

export default function AIChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I am your AI Financial Advisor. Ask me anything about your spending, budgets, savings goals, or account balances!",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const botPluginRef = useRef<ChatbotPlugin>(new ChatbotPlugin());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (open) scrollToBottom();
  }, [messages, open]);

  const handleSend = async (customText?: string) => {
    const textToSend = customText || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: "user_" + Date.now(),
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!customText) setInput("");
    setIsTyping(true);

    try {
      const replyText = await botPluginRef.current.askQuestion(textToSend);
      setTimeout(() => {
        const aiMsg: ChatMessage = {
          id: "ai_" + Date.now(),
          sender: "ai",
          text: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setIsTyping(false);
      }, 400);
    } catch {
      setIsTyping(false);
    }
  };

  const quickPrompts = [
    "What do you suggest on saving?",
    "Food spending this month",
    "Am I over budget?",
    "Show account balances",
    "Savings goals status",
  ];

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl transition-transform hover:scale-105 active:scale-95 border-2 border-background"
        aria-label="Open AI Assistant Chatbot"
      >
        {open ? <X className="size-6" /> : <Bot className="size-7" />}
        {!open && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-[9px] font-bold text-white ring-2 ring-background animate-pulse">
            AI
          </span>
        )}
      </button>

      {/* Chat Window Drawer / Modal */}
      {open && (
        <div className="fixed bottom-22 right-5 z-50 flex h-[480px] w-full max-w-[360px] flex-col overflow-hidden rounded-2xl border bg-card/95 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-4 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-xs text-foreground">Financial AI Assistant</h3>
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" /> Offline Active
                </span>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary mt-1">
                    <Bot className="size-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] rounded-2xl p-3 leading-relaxed shadow-2xs ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-tr-none"
                      : "bg-muted/70 border text-foreground rounded-tl-none"
                  }`}
                >
                  <p className="whitespace-pre-line">
                    {msg.text.split(/\*\*(.*?)\*\*/).map((part, i) =>
                      i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                    )}
                  </p>
                  <span
                    className={`block mt-1 text-[9px] text-right ${
                      msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs italic">
                <Loader2 className="size-3.5 animate-spin" /> AI analyzing financial data...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestion Chips */}
          <div className="flex gap-1.5 overflow-x-auto px-3 py-2 border-t bg-muted/20 no-scrollbar">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap rounded-full border bg-background px-2.5 py-1 text-[10px] font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 border-t p-2.5 bg-card"
          >
            <input
              type="text"
              placeholder="Ask AI about expenses, budgets..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 bg-transparent px-3 py-1.5 text-xs outline-none placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform hover:scale-105 disabled:opacity-40"
            >
              <Send className="size-3.5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
