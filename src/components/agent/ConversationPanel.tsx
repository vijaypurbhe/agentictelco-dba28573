import { useState, useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Mic, MicOff, MessageCircle, Loader2 } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { useToast } from "@/hooks/use-toast";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { CustomerData, CustomerUpdate } from "@/types/customer";
import { detectActionIntent } from "@/lib/intent-detection";

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
  onActionDetected?: (actionTitle: string) => void;
  onMessageSent?: () => void;
}

export const ConversationPanel = forwardRef<ConversationPanelHandle, ConversationPanelProps>(
  ({ customer, onCustomerUpdate, onActionDetected }, ref) => {
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
  const messagesRef = useRef(messages);
  const isLoadingRef = useRef(isLoading);
  messagesRef.current = messages;
  isLoadingRef.current = isLoading;

  const handleAutoStop = useCallback((finalTranscript: string) => {
    if (finalTranscript && !isLoadingRef.current) {
      sendToAIRef.current(finalTranscript, messagesRef.current);
    }
  }, []);

  const {
    isListening,
    transcript,
    interimTranscript,
    isSupported: voiceSupported,
    startListening,
    stopListening,
    resetTranscript,
  } = useVoiceInput({ silenceTimeout: 1500, onAutoStop: handleAutoStop });

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const displayInput = input || (isListening ? interimTranscript : "");

  useEffect(() => {
    setMessages((prev) => {
      const newSystem: Msg = {
        role: "system",
        content: `Connected to ${customer.name} (${customer.accountId}). Customer is on ${customer.plan} plan.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      if (prev[0]?.role === "system") {
        return [newSystem, ...prev.slice(1)];
      }
      return [newSystem, ...prev];
    });
  }, [customer.accountId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendToAIRef = useRef<(text: string, msgs: Msg[]) => Promise<void>>(null!);
  const sendToAI = async (text: string, currentMessages: Msg[]) => {
    const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const userMsg: Msg = { role: "user", content: text, timestamp: now };
    const updatedMessages = [...currentMessages, userMsg];
    setMessages(updatedMessages);
    setInput("");
    resetTranscript();

    // Detect intent and notify parent to sync agent panel
    const detectedAction = detectActionIntent(text);
    if (detectedAction && onActionDetected) {
      onActionDetected(detectedAction);
    }
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
  sendToAIRef.current = sendToAI;

  const handleSend = () => {
    const textToSend = input.trim() || transcript.trim();
    if (!textToSend || isLoading) return;
    if (isListening) stopListening();
    sendToAI(textToSend, messages);
  };

  const handleVoiceToggle = () => {
    if (isListening) {
      stopListening();
    } else {
      setInput("");
      startListening();
    }
  };

  useImperativeHandle(ref, () => ({
    sendMessage: (text: string) => {
      if (!isLoadingRef.current) {
        sendToAIRef.current(text, messagesRef.current);
      }
    },
  }), []);

  return (
    <div className="flex flex-col h-full relative">
      {/* Header */}
      <div className="p-5 border-b border-border/50 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <MessageCircle className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="font-bold text-base text-foreground">AI Conversation</h2>
          <p className="text-xs text-muted-foreground">Agent-assisted customer interaction</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {isLoading ? (
            <Loader2 className="w-4 h-4 text-primary animate-spin" />
          ) : (
            <span className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
          )}
          <span className="text-xs text-success font-semibold">{isLoading ? "Thinking..." : "Live"}</span>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
        {messages.map((msg, i) => (
          <ChatMessage key={i} {...msg} />
        ))}
        {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
          <div className="flex gap-3">
            <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
            <div className="bg-secondary text-secondary-foreground text-sm px-4 py-3 rounded-2xl rounded-tl-sm">
              Analyzing customer data...
            </div>
          </div>
        )}
      </div>

      {/* Voice listening indicator */}
      <AnimatePresence>
        {isListening && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="px-4 pb-1"
          >
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-destructive/10 border border-destructive/20">
              <span className="w-2.5 h-2.5 rounded-full bg-destructive animate-pulse" />
              <span className="text-sm font-semibold text-destructive">Listening...</span>
              {interimTranscript && (
                <span className="text-sm text-muted-foreground italic truncate flex-1">
                  {interimTranscript}
                </span>
              )}
              <div className="flex gap-1">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-1 bg-destructive rounded-full"
                    animate={{ height: [6, 16, 6] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating mic FAB */}
      {voiceSupported && (
        <AnimatePresence>
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleVoiceToggle}
            disabled={isLoading}
            className={`absolute bottom-24 right-5 z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50 ${
              isListening
                ? "bg-destructive text-destructive-foreground shadow-destructive/30"
                : "bg-primary text-primary-foreground shadow-primary/30 hover:shadow-xl"
            }`}
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            {isListening && (
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-destructive"
                animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.button>
        </AnimatePresence>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 bg-muted/60 rounded-2xl px-4 py-3">
          <input
            type="text"
            value={displayInput}
            onChange={(e) => {
              setInput(e.target.value);
              if (isListening) stopListening();
            }}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={isListening ? "Speak now..." : "Type your message here..."}
            disabled={isLoading}
            className="flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground outline-none disabled:opacity-50"
          />
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            disabled={isLoading || (!input.trim() && !transcript.trim())}
            className="w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-50"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </div>
      </div>
    </div>
  );
});

ConversationPanel.displayName = "ConversationPanel";
