import { motion } from "framer-motion";
import {
  TrendingUp,
  Zap,
  Gift,
  Smartphone,
  Wifi,
  Shield,
  ChevronRight,
} from "lucide-react";

interface QuickOption {
  id: string;
  label: string;
  sublabel: string;
  price?: string;
  highlight?: boolean;
}

interface QuickSelectCardProps {
  actionTitle: string;
  onSelect: (prompt: string) => void;
}

const actionOptions: Record<string, QuickOption[]> = {
  "Plan Upgrade": [
    { id: "basic-plus", label: "Unlimited Plus", sublabel: "5G, 30GB hotspot, HD streaming", price: "$80/mo" },
    { id: "premium", label: "Unlimited Premium", sublabel: "5G UW, 50GB hotspot, 4K UHD", price: "$85/mo", highlight: true },
    { id: "ultimate", label: "Unlimited Ultimate", sublabel: "5G UW, 100GB hotspot, 4K UHD + international", price: "$95/mo" },
  ],
  "Add-On Bundle": [
    { id: "protection", label: "Device Protection", sublabel: "Screen repair, loss & theft coverage", price: "$17/mo" },
    { id: "total-bundle", label: "Total Protection Bundle", sublabel: "Device + cloud + identity theft", price: "$8/mo", highlight: true },
    { id: "cloud-only", label: "Cloud Storage 200GB", sublabel: "Photo & video backup across devices", price: "$3/mo" },
  ],
  "Loyalty Reward": [
    { id: "streaming", label: "Free Streaming (6mo)", sublabel: "Disney+, Netflix, or Hulu — customer's choice", price: "FREE", highlight: true },
    { id: "bill-credit", label: "$50 Bill Credit", sublabel: "One-time credit applied to next cycle", price: "-$50" },
    { id: "data-boost", label: "Permanent 10GB Bonus", sublabel: "Extra data added to plan at no cost", price: "FREE" },
  ],
  "Device Trade-In": [
    { id: "iphone16", label: "iPhone 16 Pro", sublabel: "128GB, $200 trade-in credit applied", price: "$27.77/mo", highlight: true },
    { id: "iphone16plus", label: "iPhone 16 Pro Max", sublabel: "256GB, $200 trade-in credit applied", price: "$33.33/mo" },
    { id: "galaxy-s25", label: "Galaxy S25 Ultra", sublabel: "256GB, $200 trade-in credit applied", price: "$30.55/mo" },
  ],
  "Home Internet Bundle": [
    { id: "home-basic", label: "5G Home", sublabel: "85-300 Mbps, no data caps", price: "$25/mo" },
    { id: "home-plus", label: "5G Home Plus", sublabel: "300-1000 Mbps, Wi-Fi 7 router", price: "$35/mo", highlight: true },
    { id: "lte-home", label: "LTE Home", sublabel: "25-50 Mbps, rural coverage", price: "$20/mo" },
  ],
  "Premium Support": [
    { id: "priority", label: "Priority Support", sublabel: "<2 min wait, extended hours", price: "$7/mo", highlight: true },
    { id: "dedicated", label: "Dedicated Specialist", sublabel: "Named rep, proactive monitoring", price: "$12/mo" },
    { id: "team-support", label: "Family Support Plan", sublabel: "Priority for all lines on account", price: "$15/mo" },
  ],
};

const actionIcons: Record<string, React.ElementType> = {
  "Plan Upgrade": TrendingUp,
  "Add-On Bundle": Zap,
  "Loyalty Reward": Gift,
  "Device Trade-In": Smartphone,
  "Home Internet Bundle": Wifi,
  "Premium Support": Shield,
};

const selectPrompts: Record<string, (option: QuickOption) => string> = {
  "Plan Upgrade": (o) =>
    `The customer has selected the ${o.label} plan at ${o.price}. Process this plan upgrade now. Confirm the features: ${o.sublabel}. Explain the billing change and next steps.`,
  "Add-On Bundle": (o) =>
    `The customer wants to add the ${o.label} (${o.sublabel}) at ${o.price}. Process this add-on. Explain what's included and activation timeline.`,
  "Loyalty Reward": (o) =>
    `Apply the ${o.label} loyalty reward for this customer. Details: ${o.sublabel}. Value: ${o.price}. Confirm the reward and explain when it takes effect.`,
  "Device Trade-In": (o) =>
    `The customer has chosen the ${o.label} (${o.sublabel}) at ${o.price}. Process the trade-in and new device order. Confirm trade-in credit, monthly cost, and delivery timeline.`,
  "Home Internet Bundle": (o) =>
    `The customer wants to add ${o.label} home internet at ${o.price}. Details: ${o.sublabel}. Process the order with convergence discount and confirm installation details.`,
  "Premium Support": (o) =>
    `Upgrade the customer to ${o.label} at ${o.price}. Features: ${o.sublabel}. Activate immediately and confirm the new support experience.`,
};

export function QuickSelectCard({ actionTitle, onSelect }: QuickSelectCardProps) {
  const options = actionOptions[actionTitle] || [];
  const Icon = actionIcons[actionTitle] || TrendingUp;
  const promptBuilder = selectPrompts[actionTitle];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 space-y-3"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg bg-primary/15 flex items-center justify-center">
          <Icon className="w-3.5 h-3.5 text-primary" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground">Select an option</h3>
          <p className="text-[10px] text-muted-foreground">Choose to proceed in conversation</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {options.map((option, i) => (
          <motion.button
            key={option.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            onClick={() => promptBuilder && onSelect(promptBuilder(option))}
            className={`relative flex flex-col items-center text-center gap-1.5 p-3 rounded-xl transition-all group hover:scale-[1.03] active:scale-[0.97] ${
              option.highlight
                ? "bg-primary/15 border-2 border-primary/40 shadow-md shadow-primary/10"
                : "bg-muted/50 border border-border/50 hover:bg-muted/70 hover:border-border"
            }`}
          >
            {option.highlight && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] px-2 py-0.5 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-wider">
                Best
              </span>
            )}
            {option.price && (
              <span className={`text-sm font-bold mt-1 ${option.highlight ? "text-primary" : "text-foreground"}`}>
                {option.price}
              </span>
            )}
            <span className="text-[11px] font-semibold text-foreground leading-tight">{option.label}</span>
            <p className="text-[9px] text-muted-foreground leading-snug line-clamp-2">{option.sublabel}</p>
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}
