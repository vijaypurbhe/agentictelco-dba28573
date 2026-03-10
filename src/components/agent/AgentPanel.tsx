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
  Bot,
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
  { icon: TrendingUp, title: "Plan Upgrade", description: "Upgrade to Unlimited Premium — 5G, 50GB hotspot, HD streaming. +$10/mo ARPU lift.", tag: "Upsell", tagColor: "accent" as const, agentName: "Plan Agent" },
  { icon: Zap, title: "Add-On Bundle", description: "Device protection + cloud storage bundle. Cross-sell opportunity at $8/mo.", tag: "Cross-sell", tagColor: "primary" as const, agentName: "Bundle Agent" },
  { icon: Gift, title: "Loyalty Reward", description: "Apply 3-year tenure reward: free streaming subscription for 6 months.", tag: "Retention", tagColor: "success" as const, agentName: "Loyalty Agent" },
  { icon: Smartphone, title: "Device Trade-In", description: "Eligible for device upgrade with $200 trade-in credit. Extends contract 24mo.", tag: "Revenue", tagColor: "warning" as const, agentName: "Device Agent" },
  { icon: Wifi, title: "Home Internet Bundle", description: "Add home 5G internet for $25/mo. Household convergence strategy.", tag: "Cross-sell", tagColor: "primary" as const, agentName: "Home Agent" },
  { icon: Shield, title: "Premium Support", description: "Add priority support tier. Reduces churn by 40% for high-value accounts.", tag: "Retention", tagColor: "success" as const, agentName: "Support Agent" },
  { icon: Receipt, title: "Billing Dispute", description: "Resolve billing discrepancies. Issue credits, reversals, or payment plans.", tag: "Support", tagColor: "warning" as const, agentName: "Billing Agent" },
  { icon: Power, title: "Account Suspend/Reactivate", description: "Manage account suspension, reactivation, and payment arrangements.", tag: "Account", tagColor: "accent" as const, agentName: "Account Agent" },
  { icon: Users, title: "Multi-Line Management", description: "Add, remove, or transfer lines. Family plan optimization.", tag: "Account", tagColor: "primary" as const, agentName: "Lines Agent" },
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

  const selectedActionData = actions.find((a) => a.title === selectedAction);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/15 text-primary flex items-center gap-1.5">
              <Bot className="w-3 h-3" />
              Multi-Agent Orchestrator
            </span>
            <span className="text-xs text-muted-foreground">
              {selectedAction ? `${selectedActionData?.agentName} active` : "9 agents ready"}
            </span>
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

        {/* Agent Ribbon — always visible */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <h3 className="font-semibold text-xs text-foreground">
              {selectedAction ? "Switch Agent" : "AI Agent Recommendations"}
            </h3>
            {selectedAction && (
              <span className="text-[10px] text-muted-foreground ml-auto">Click any agent to switch</span>
            )}
          </div>

          {!selectedAction && (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on usage patterns, tenure, and predictive models, the following agents are ranked by expected ARPU impact and retention probability.
            </p>
          )}

          <AnimatePresence mode="wait">
            {selectedAction ? (
              /* Compact horizontal ribbon when an agent is active */
              <motion.div
                key="ribbon"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-1.5 overflow-x-auto scrollbar-thin pb-1"
              >
                {actions.map((action) => {
                  const Icon = action.icon;
                  const isActive = action.title === selectedAction;
                  return (
                    <motion.button
                      key={action.title}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleAction(action.title)}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap shrink-0 transition-all border ${
                        isActive
                          ? "bg-primary/15 border-primary/40 text-primary shadow-sm"
                          : "bg-muted/40 border-border/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      {action.agentName}
                      {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />}
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              /* Full grid when no agent is selected */
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-3"
              >
                {actions.map((action, i) => (
                  <ActionCard key={action.title} {...action} delay={i} onClick={() => handleAction(action.title)} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active agent flow detail */}
        <AnimatePresence mode="wait">
          {selectedAction && (
            <motion.div
              key={`flow-${selectedAction}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              <QuickSelectCard
                actionTitle={selectedAction}
                onSelect={(prompt) => {
                  setCurrentStep((s) => Math.min(s + 1, steps.length - 1));
                  if (onActionClick) onActionClick(prompt);
                }}
              />

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
          )}
        </AnimatePresence>

        <InteractionTimeline events={timeline} />
      </div>
    </div>
  );
}
