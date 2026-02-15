import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  content: string;
  timestamp?: string;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isAgent = role === "assistant" || role === "system";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex gap-2.5 ${isAgent ? "" : "flex-row-reverse"}`}
    >
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
          isAgent ? "bg-primary/15" : "bg-accent/15"
        }`}
      >
        {isAgent ? (
          <Bot className="w-3.5 h-3.5 text-primary" />
        ) : (
          <User className="w-3.5 h-3.5 text-accent" />
        )}
      </div>
      <div className={`max-w-[80%] ${isAgent ? "" : "text-right"}`}>
        <div
          className={`text-sm px-3.5 py-2.5 rounded-xl leading-relaxed ${
            isAgent
              ? "bg-secondary text-secondary-foreground rounded-tl-sm"
              : "bg-primary text-primary-foreground rounded-tr-sm"
          }`}
        >
          {content}
        </div>
        {timestamp && (
          <p className="text-[10px] text-muted-foreground mt-1 px-1">{timestamp}</p>
        )}
      </div>
    </motion.div>
  );
}
