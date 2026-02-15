import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic, MessageCircle } from "lucide-react";
import { ChatMessage } from "./ChatMessage";

type Msg = { role: "user" | "assistant" | "system"; content: string; timestamp: string };

const initialMessages: Msg[] = [
  {
    role: "system",
    content: "Connected to Sarah Mitchell (WLS-2847391). Customer is on Unlimited Basic plan. High data usage detected — potential upsell opportunity.",
    timestamp: "10:32 AM",
  },
  {
    role: "assistant",
    content: "Hi there! I can see Sarah is currently using 81% of her data allowance with 10 days left in her cycle. I've prepared some upgrade options. Would you like to explore a plan upgrade or address another concern?",
    timestamp: "10:32 AM",
  },
];

export function ConversationPanel() {
  const [messages, setMessages] = useState<Msg[]>(initialMessages);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setMessages((prev) => [...prev, { role: "user", content: input, timestamp: now }]);
    setInput("");

    // Simulated agent response
    setTimeout(() => {
      const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Great question! Based on Sarah's usage patterns, I'd recommend the Unlimited Premium plan. It includes 5G access, 50GB hotspot, and HD streaming — all for just $10 more per month. This would increase ARPU while reducing churn risk. Shall I prepare the upgrade?",
          timestamp: t,
        },
      ]);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <MessageCircle className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-semibold text-sm text-foreground">AI Conversation</h2>
          <p className="text-[10px] text-muted-foreground">Agent-assisted customer interaction</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] text-success font-medium">Live</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message or instruction..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="w-8 h-8 rounded-lg bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mic className="w-4 h-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
