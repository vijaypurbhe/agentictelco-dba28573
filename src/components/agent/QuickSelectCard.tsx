import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  Zap,
  Gift,
  Smartphone,
  Wifi,
  Shield,
  Receipt,
  Power,
  Users,
  Sparkles,
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
  externalSelectedId?: string | null;
  dynamicOptions?: QuickOption[] | null;
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
  "Billing Dispute": [
    { id: "partial-credit", label: "Partial Credit", sublabel: "Apply proportional credit for disputed charges", price: "-$25", highlight: true },
    { id: "full-reversal", label: "Full Reversal", sublabel: "Reverse entire disputed charge amount", price: "-$78" },
    { id: "payment-plan", label: "Payment Plan", sublabel: "Split disputed balance over 3 billing cycles", price: "$26/mo" },
  ],
  "Account Suspend/Reactivate": [
    { id: "reactivate-now", label: "Reactivate Now", sublabel: "Full service restoration with past-due payment", price: "Pay balance", highlight: true },
    { id: "payment-arrangement", label: "Payment Arrangement", sublabel: "Restore service with 3-month payment plan", price: "3 installments" },
    { id: "partial-restore", label: "Partial Restore", sublabel: "Enable incoming calls only, outgoing blocked", price: "No payment" },
  ],
  "Multi-Line Management": [
    { id: "add-line", label: "Add New Line", sublabel: "New number with device financing available", price: "+$35/mo", highlight: true },
    { id: "remove-line", label: "Remove Line", sublabel: "Cancel line, keep number eligible for port-out", price: "-$35/mo" },
    { id: "transfer-number", label: "Transfer Number", sublabel: "Port-in from another carrier, keep number", price: "$0 fee" },
  ],
};

const actionIcons: Record<string, React.ElementType> = {
  "Plan Upgrade": TrendingUp,
  "Add-On Bundle": Zap,
  "Loyalty Reward": Gift,
  "Device Trade-In": Smartphone,
  "Home Internet Bundle": Wifi,
  "Premium Support": Shield,
  "Billing Dispute": Receipt,
  "Account Suspend/Reactivate": Power,
  "Multi-Line Management": Users,
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
  "Billing Dispute": (o) =>
    `The customer wants to resolve billing dispute via ${o.label}. Details: ${o.sublabel}. Value: ${o.price}. Process the resolution and confirm the adjustment on the next billing cycle.`,
  "Account Suspend/Reactivate": (o) =>
    `Process account action: ${o.label}. Details: ${o.sublabel}. Terms: ${o.price}. Execute the reactivation/arrangement and confirm service restoration timeline.`,
  "Multi-Line Management": (o) =>
    `Process multi-line action: ${o.label}. Details: ${o.sublabel}. Cost: ${o.price}. Execute the line change and confirm updated account details.`,
};

export function QuickSelectCard({ actionTitle, onSelect, externalSelectedId, dynamicOptions }: QuickSelectCardProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const options = dynamicOptions && dynamicOptions.length > 0 ? dynamicOptions : (actionOptions[actionTitle] || []);

  // Sync external selection from voice/typed input
  useEffect(() => {
    if (externalSelectedId && options.some((o) => o.id === externalSelectedId)) {
      setSelectedId(externalSelectedId);
    }
  }, [externalSelectedId, options]);

  // Reset selection when dynamic options change
  useEffect(() => {
    if (dynamicOptions && dynamicOptions.length > 0) {
      setSelectedId(null);
    }
  }, [dynamicOptions]);

  const Icon = actionIcons[actionTitle] || TrendingUp;
  const promptBuilder = selectPrompts[actionTitle];

  const handleSelect = (option: QuickOption) => {
    setSelectedId(option.id);
    // For dynamic options, build a generic prompt; for hardcoded, use the specific builder
    if (dynamicOptions && dynamicOptions.length > 0) {
      const prompt = `The customer has selected "${option.label}" (${option.sublabel}) at ${option.price || "N/A"}. Process this selection now. Confirm the details and next steps.`;
      onSelect(prompt);
    } else if (promptBuilder) {
      onSelect(promptBuilder(option));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-5 space-y-4"
    >
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Pick one option below</h3>
          <p className="text-xs text-muted-foreground">Tap to proceed with the customer</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {options.map((option, i) => {
          const isSelected = selectedId === option.id;
          const isRecommended = option.highlight && !selectedId;

          return (
            <motion.button
              key={option.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => handleSelect(option)}
              className={`relative flex flex-col items-center text-center gap-2 p-4 rounded-xl transition-all group hover:scale-[1.03] active:scale-[0.97] min-h-[110px] ${
                isSelected
                  ? "bg-primary/15 border-2 border-primary shadow-md shadow-primary/10 ring-2 ring-primary/20"
                  : isRecommended
                  ? "bg-primary/10 border-2 border-primary/40 shadow-md shadow-primary/10"
                  : "bg-muted/50 border border-border/50 hover:bg-muted/70 hover:border-border"
              }`}
            >
              {option.highlight && !selectedId && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-3 py-0.5 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-wider">
                  Best
                </span>
              )}
              {isSelected && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] px-3 py-0.5 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-wider">
                  Selected
                </span>
              )}
              {option.price && (
                <span className={`text-lg font-bold mt-1 ${isSelected || isRecommended ? "text-primary" : "text-foreground"}`}>
                  {option.price}
                </span>
              )}
              <span className="text-sm font-bold text-foreground leading-tight">{option.label}</span>
              <p className="text-xs text-muted-foreground leading-snug line-clamp-2">{option.sublabel}</p>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
