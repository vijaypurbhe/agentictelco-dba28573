import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QuickOption } from "./ConversationPanel";
import { ChevronDown, X, CheckCircle2 } from "lucide-react";
import {
  TrendingUp, Zap, Gift, Smartphone, Wifi, Shield, Receipt, Power, Users,
} from "lucide-react";
import { QuickSelectCard } from "./QuickSelectCard";
import { DynamicActionContent } from "./DynamicActionContent";
import { CustomerData } from "@/types/customer";

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

const agentNames: Record<string, string> = {
  "Plan Upgrade": "Plan Agent",
  "Add-On Bundle": "Bundle Agent",
  "Loyalty Reward": "Loyalty Agent",
  "Device Trade-In": "Device Agent",
  "Home Internet Bundle": "Home Agent",
  "Premium Support": "Support Agent",
  "Billing Dispute": "Billing Agent",
  "Account Suspend/Reactivate": "Account Agent",
  "Multi-Line Management": "Lines Agent",
};

const steps = ["Identify", "Analyze", "Recommend", "Execute", "Confirm"];

interface ActiveAgentSectionProps {
  actionTitle: string;
  currentStep: number;
  customer: CustomerData;
  externalOptionId?: string | null;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onRemove: () => void;
  onOptionSelect: (prompt: string) => void;
  onNextStep: (prompt: string) => void;
  onBack: () => void;
}

export function ActiveAgentSection({
  actionTitle,
  currentStep,
  customer,
  externalOptionId,
  isCollapsed,
  onToggleCollapse,
  onRemove,
  onOptionSelect,
  onNextStep,
  onBack,
}: ActiveAgentSectionProps) {
  const Icon = actionIcons[actionTitle] || TrendingUp;
  const agentName = agentNames[actionTitle] || actionTitle;
  const isComplete = currentStep >= steps.length - 1;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12, height: 0 }}
      className={`glass-panel border overflow-hidden transition-colors ${
        isComplete
          ? "border-success/30"
          : "border-primary/20"
      }`}
    >
      {/* Collapsible header */}
      <button
        onClick={onToggleCollapse}
        className="w-full flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors"
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
          isComplete ? "bg-success/15" : "bg-primary/15"
        }`}>
          {isComplete ? (
            <CheckCircle2 className="w-4.5 h-4.5 text-success" />
          ) : (
            <Icon className="w-4.5 h-4.5 text-primary" />
          )}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-foreground">{agentName}</span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
              isComplete
                ? "bg-success/15 text-success"
                : "bg-primary/15 text-primary"
            }`}>
              {isComplete ? "Complete" : `Step ${currentStep + 1}/${steps.length}`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{actionTitle}</p>
        </div>
        <motion.div
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.2 }}
          className="text-muted-foreground"
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </button>

      {/* Collapsible content */}
      <AnimatePresence initial={false}>
        {!isCollapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 space-y-4">
              <QuickSelectCard
                actionTitle={actionTitle}
                externalSelectedId={externalOptionId}
                onSelect={onOptionSelect}
              />
              <DynamicActionContent
                actionTitle={actionTitle}
                currentStep={currentStep}
                customer={customer}
                onBack={onBack}
                onNextStep={onNextStep}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
