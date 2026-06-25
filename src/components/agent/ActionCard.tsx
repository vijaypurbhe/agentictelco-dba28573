import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { actionEmoji } from "@/lib/action-emoji";

interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tag?: string;
  tagColor?: "primary" | "accent" | "success" | "warning";
  onClick: () => void;
  delay?: number;
}

const tagStyles = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
};

export function ActionCard({ icon: Icon, title, description, tag, tagColor = "primary", onClick, delay = 0 }: ActionCardProps) {
  const emoji = actionEmoji[title];
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.08, duration: 0.3 }}
      whileHover={{ y: -3 }}
      whileTap={{ y: 2, scale: 0.99 }}
      onClick={onClick}
      className="menu-tile p-5 text-left w-full group cursor-pointer min-h-[140px] hover:border-primary"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-16 h-16 rounded-2xl bg-accent/30 flex items-center justify-center text-4xl shrink-0 group-hover:bg-accent/50 transition-colors">
          {emoji || <Icon className="w-7 h-7 text-primary" />}
        </div>
        {tag && (
          <span className={`text-[11px] font-display uppercase tracking-wider px-3 py-1 rounded-full ${tagStyles[tagColor]}`}>
            {tag}
          </span>
        )}
      </div>
      <h4 className="font-display text-lg text-foreground mb-1 leading-tight">{title}</h4>
      <p className="text-sm text-muted-foreground leading-snug">{description}</p>
    </motion.button>
  );
}
