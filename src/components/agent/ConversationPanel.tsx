import { useState, useRef, useEffect, useImperativeHandle, forwardRef } from "react";
import { motion } from "framer-motion";
import { Send, Mic, MessageCircle, Loader2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { useToast } from "@/hooks/use-toast";
import { CustomerData, CustomerUpdate } from "@/types/customer";

type Msg = { role: "user" | "assistant" | "system"; content: string; timestamp: string };

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/agent-chat`;

function parseCustomerUpdate(content: string): { update: CustomerUpdate | null; cleanContent: string } {
  const regex = /<customer_update>\s*([\s\S]*?)\s*<\/customer_update>/;
  const match = content.match(regex);
  if (!match) return { update: null, cleanContent: content };
  try {
    const parsed = JSON.parse(match[1]);
    if (parsed.customer && parsed.timeline) {
      return { update: parsed as CustomerUpdate, cleanContent: content.replace(regex, "").trim() };
    }
  } catch { /* ignore parse errors */ }
  return { update: null, cleanContent: content };
}

export interface ConversationPanelHandle {
  sendMessage: (text: string) => void;
}

interface ConversationPanelProps {
  customer: CustomerData;
  onCustomerUpdate: (update: CustomerUpdate) => void;
}

export const ConversationPanel = forwardRef<ConversationPanelHandle, ConversationPanelProps>(
  ({ customer, onCustomerUpdate }, ref) => {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "system",
      content: `Connected to ${customer.name} (${customer.accountId}). Customer is on ${customer.plan} plan. High data usage detected — potential upsell opportunity.`,
      timestamp: "10:32 AM",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const customerUpdateApplied = useRef(false);

  // Update system message when customer changes externally
  useEffect(() => {
    setMessages((prev) => {
      const newSystem: Msg = {
        role: "system",
        content: `Connected to ${customer.name} (${customer.accountId}). Customer is on ${customer.plan} plan.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      // Replace first system message
      if (prev[0]?.role === "system") {
        return [newSystem, ...prev.slice(1)];
      }
      return [newSystem, ...prev];
    });
  }, [customer.accountId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendToAI = async (text: string, currentMessages: Msg[]) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Msg = { role: "user", content: text, timestamp: now };
    const updatedMessages = [...currentMessages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    customerUpdateApplied.current = false;

    const apiMessages = updatedMessages
      .filter((m) => m.role !== "system")
      .map((m) => ({ role: m.role, content: m.content }));

    let assistantContent = "";

    try {
      const resp = await fetch(CHAT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: apiMessages,
          customerContext: customer,
        }),
      });

      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed (${resp.status})`);
      }

      if (!resp.body) throw new Error("No response body");

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = "";

      const upsertAssistant = (content: string) => {
        // Try to parse and strip customer_update from displayed content
        const { update, cleanContent } = parseCustomerUpdate(content);
        if (update && !customerUpdateApplied.current) {
          customerUpdateApplied.current = true;
          onCustomerUpdate(update);
        }
        const displayContent = cleanContent || content;

        const t = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant") {
            return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: displayContent, timestamp: t } : m));
          }
          return [...prev, { role: "assistant" as const, content: displayContent, timestamp: t }];
        });
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith("\r")) line = line.slice(0, -1);
          if (line.startsWith(":") || line.trim() === "") continue;
          if (!line.startsWith("data: ")) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === "[DONE]") break;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = parsed.choices?.[0]?.delta?.content;
            if (delta) {
              assistantContent += delta;
              upsertAssistant(assistantContent);
            }
          } catch {
            textBuffer = line + "\n" + textBuffer;
            break;
          }
        }
      }
    } catch (e: any) {
      console.error("Chat error:", e);
      toast({
        title: "AI Error",
        description: e.message || "Failed to get AI response",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    sendToAI(input, messages);
  };

  useImperativeHandle(ref, () => ({
    sendMessage: (text: string) => {
      if (!isLoading) {
        sendToAI(text, messages);
      }
    },
  }));

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
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
          ) : (
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          )}
          <span className="text-[10px] text-success font-medium">{isLoading ? "Thinking..." : "Live"}</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center">
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
            </div>
            <div className="bg-secondary text-secondary-foreground text-sm px-3.5 py-2.5 rounded-xl rounded-tl-sm">
              Analyzing customer data...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t border-border/50">
        <div className="flex items-center gap-2 bg-muted/60 rounded-xl px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Ask about customer actions, recommendations..."
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
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
            disabled={isLoading || !input.trim()}
            className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </div>
  );
});

ConversationPanel.displayName = "ConversationPanel";
