import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

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
  primary: "bg-primary/15 text-primary",
  accent: "bg-accent/15 text-accent",
  success: "bg-success/15 text-success",
  warning: "bg-warning/15 text-warning",
};

export function ActionCard({ icon: Icon, title, description, tag, tagColor = "primary", onClick, delay = 0 }: ActionCardProps) {
  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1, duration: 0.35 }}
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-panel p-4 text-left w-full group hover:border-primary/30 transition-all duration-200 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="w-4.5 h-4.5 text-primary" />
        </div>
        {tag && (
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${tagStyles[tagColor]}`}>
            {tag}
          </span>
        )}
      </div>
      <h4 className="font-semibold text-sm text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
    </motion.button>
  );
}
