import { motion } from "framer-motion";
import { LucideIcon, Sparkles } from "lucide-react";
import { actionEmoji } from "@/lib/action-emoji";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


interface ActionCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  tag?: string;
  tagColor?: "primary" | "accent" | "success" | "warning";
  onClick: () => void;
  delay?: number;
  recommended?: boolean;
}

const tagStyles = {
  primary: "bg-primary text-primary-foreground",
  accent: "bg-accent text-accent-foreground",
  success: "bg-success text-success-foreground",
  warning: "bg-warning text-warning-foreground",
};

const actionTooltips: Record<string, string> = {
  "Plan Upgrade": "Pick a new unlimited plan for the customer and the agent will activate it and confirm the new monthly bill.",
  "Add-On Bundle": "Choose a protection or cloud add-on and the agent will attach it to the account with the updated charge.",
  "Loyalty Reward": "Apply a thank-you perk like streaming, bill credit, or bonus data and the agent will confirm when it kicks in.",
  "Device Trade-In": "Select a new phone with trade-in credit and the agent will set up financing and a delivery date.",
  "Home Internet Bundle": "Add 5G or LTE home internet and the agent will bundle it with the discount and schedule setup.",
  "Premium Support": "Upgrade the customer's support tier and the agent will activate priority service right away.",
  "Billing Dispute": "Pick how to resolve the disputed charge and the agent will post the adjustment to the next bill.",
  "Account Suspend/Reactivate": "Choose a reactivation path and the agent will restore service and confirm the timeline.",
  "Multi-Line Management": "Add, remove, or port a line and the agent will update the account and confirm the new total.",
};

export function ActionCard({ icon: Icon, title, description, tag, tagColor = "primary", onClick, delay = 0, recommended = false }: ActionCardProps) {
  const emoji = actionEmoji[title];
  const baseTooltip = actionTooltips[title] || `Start ${title}: ${description}`;
  const tooltip = recommended ? `AI recommends this next — ${baseTooltip}` : baseTooltip;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={
            recommended
              ? { opacity: 1, y: 0, boxShadow: ["0 0 0 0 hsl(var(--accent) / 0)", "0 0 0 8px hsl(var(--accent) / 0.25)", "0 0 0 0 hsl(var(--accent) / 0)"] }
              : { opacity: 1, y: 0 }
          }
          transition={
            recommended
              ? { boxShadow: { duration: 1.8, repeat: Infinity }, default: { delay: delay * 0.08, duration: 0.3 } }
              : { delay: delay * 0.08, duration: 0.3 }
          }
          whileHover={{ y: -3 }}
          whileTap={{ y: 2, scale: 0.99 }}
          onClick={onClick}
          aria-label={`${title}. ${tooltip}`}
          className={`menu-tile relative p-5 text-left w-full group cursor-pointer min-h-[140px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            recommended
              ? "border-accent ring-2 ring-accent/60 bg-accent/10"
              : "hover:border-primary"
          }`}
        >
          {recommended && (
            <span className="absolute -top-3 left-4 z-10 flex items-center gap-1 text-[10px] px-2.5 py-1 rounded-full bg-accent text-accent-foreground font-display uppercase tracking-wider shadow-md">
              <Sparkles className="w-3 h-3" />
              AI Pick
            </span>
          )}
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
      </TooltipTrigger>
      <TooltipContent side="top" className="max-w-xs text-sm leading-snug">
        {tooltip}
      </TooltipContent>
    </Tooltip>
  );
}
