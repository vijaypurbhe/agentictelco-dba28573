import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  Zap,
  Shield,
  Gift,
  Smartphone,
  Wifi,
  BarChart3,
  Receipt,
  Power,
  Users,
} from "lucide-react";
import { ActionCard } from "./ActionCard";
import { StepProgress } from "./StepProgress";
import { CustomerContext } from "./CustomerContext";
import { QuickSelectCard } from "./QuickSelectCard";
import { InteractionTimeline } from "./InteractionTimeline";
import { DynamicActionContent } from "./DynamicActionContent";
import { CustomerData, TimelineEvent } from "@/types/customer";

const steps = ["Identify", "Analyze", "Recommend", "Execute", "Confirm"];

const actionPrompts: Record<string, string> = {
  "Plan Upgrade": "The customer wants to explore a plan upgrade. Recommend the best upgrade from Unlimited Basic, explain the benefits, pricing difference, ARPU impact, and provide talking points to handle price objections.",
  "Add-On Bundle": "Recommend a device protection + cloud storage cross-sell bundle for this customer. Include pricing, value proposition, and how to position it based on their device count and tenure.",
  "Loyalty Reward": "This is a 3-year tenure customer. What loyalty rewards can we apply? Suggest the best retention offer including free streaming subscriptions or bill credits, and explain the ROI.",
  "Device Trade-In": "Customer may be eligible for a device trade-in. Provide details on trade-in credit value, new device options, contract extension terms, and how to position the upgrade.",
  "Home Internet Bundle": "Explore a home 5G internet cross-sell for this household. Provide the bundle pricing, convergence discount, and talking points about combining wireless and home internet.",
  "Premium Support": "Recommend adding premium support tier for this high-value customer. Explain the benefits, churn reduction impact, and how to position it as a value-add rather than an upsell.",
  "Billing Dispute": "The customer has a billing dispute. Review the account for recent charges, identify discrepancies, and recommend the best resolution — partial credit, full reversal, or payment arrangement.",
  "Account Suspend/Reactivate": "The customer's account is suspended or needs reactivation. Review the suspension reason, outstanding balance, and recommend the best path to restore service — immediate reactivation, payment arrangement, or partial restore.",
  "Multi-Line Management": "The customer needs to manage lines on their account. Review current lines, pricing, and recommend the best action — add a new line, remove a line, or transfer a number from another carrier.",
};

const actions = [
  { icon: TrendingUp, title: "Plan Upgrade", description: "Upgrade to Unlimited Premium — 5G, 50GB hotspot, HD streaming. +$10/mo ARPU lift.", tag: "Upsell", tagColor: "accent" as const },
  { icon: Zap, title: "Add-On Bundle", description: "Device protection + cloud storage bundle. Cross-sell opportunity at $8/mo.", tag: "Cross-sell", tagColor: "primary" as const },
  { icon: Gift, title: "Loyalty Reward", description: "Apply 3-year tenure reward: free streaming subscription for 6 months.", tag: "Retention", tagColor: "success" as const },
  { icon: Smartphone, title: "Device Trade-In", description: "Eligible for device upgrade with $200 trade-in credit. Extends contract 24mo.", tag: "Revenue", tagColor: "warning" as const },
  { icon: Wifi, title: "Home Internet Bundle", description: "Add home 5G internet for $25/mo. Household convergence strategy.", tag: "Cross-sell", tagColor: "primary" as const },
  { icon: Shield, title: "Premium Support", description: "Add priority support tier. Reduces churn by 40% for high-value accounts.", tag: "Retention", tagColor: "success" as const },
  { icon: Receipt, title: "Billing Dispute", description: "Resolve billing discrepancies. Issue credits, reversals, or payment plans.", tag: "Support", tagColor: "warning" as const },
  { icon: Power, title: "Account Suspend/Reactivate", description: "Manage account suspension, reactivation, and payment arrangements.", tag: "Account", tagColor: "accent" as const },
  { icon: Users, title: "Multi-Line Management", description: "Add, remove, or transfer lines. Family plan optimization.", tag: "Account", tagColor: "primary" as const },
];

interface AgentPanelProps {
  onActionClick?: (prompt: string) => void;
  customer: CustomerData;
  timeline: TimelineEvent[];
}

export function AgentPanel({ onActionClick, customer, timeline }: AgentPanelProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);

  const handleAction = (title: string) => {
    if (selectedAction !== title) {
      setCurrentStep(1);
    } else {
      setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
    }
    setSelectedAction(title);

    const prompt = actionPrompts[title];
    if (prompt && onActionClick) {
      onActionClick(prompt);
    }
  };

  const handleBack = () => {
    setSelectedAction(null);
    setCurrentStep(0);
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-primary">
              Dynamic Interface
            </span>
            <span className="text-xs text-muted-foreground">Generated by AI Agent</span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">Step {currentStep + 1} of {steps.length}</span>
          </div>
        </div>
        <StepProgress steps={steps} currentStep={currentStep} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
        <CustomerContext customer={customer} />

        <AnimatePresence>
          {selectedAction && (
            <motion.div key={`quickselect-${selectedAction}`} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }}>
              <QuickSelectCard
                actionTitle={selectedAction}
                onSelect={(prompt) => {
                  setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
                  if (onActionClick) onActionClick(prompt);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {selectedAction ? (
            <motion.div
              key={`dynamic-${selectedAction}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <DynamicActionContent
                actionTitle={selectedAction}
                currentStep={currentStep}
                customer={customer}
                onBack={handleBack}
                onNextStep={(prompt) => {
                  setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
                  if (onActionClick) onActionClick(prompt);
                }}
              />
            </motion.div>
          ) : (
            <motion.div
              key="action-cards"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="gradient-hero rounded-xl p-4 border border-primary/20 mb-4"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold text-sm text-foreground">AI Agent Recommendations</h3>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Based on usage patterns, tenure, and predictive models, the following actions are ranked by expected ARPU impact and retention probability.
                </p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {actions.map((action, i) => (
                  <ActionCard key={action.title} {...action} delay={i} onClick={() => handleAction(action.title)} />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <InteractionTimeline events={timeline} />
      </div>
    </div>
  );
}
