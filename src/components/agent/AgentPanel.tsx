import { useState, useEffect, useRef, useCallback } from "react";
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
import { InteractionTimeline } from "./InteractionTimeline";
import { ActiveAgentSection } from "./ActiveAgentSection";
import { CombinedCheckout } from "./CombinedCheckout";
import { CustomerData, TimelineEvent } from "@/types/customer";

const stepLabels = ["Identify", "Analyze", "Recommend", "Execute", "Confirm"];

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

interface ActiveAgent {
  title: string;
  step: number;
  activatedAtTurn: number;
  collapsed: boolean;
}

interface AgentPanelProps {
  onActionClick?: (prompt: string) => void;
  customer: CustomerData;
  timeline: TimelineEvent[];
  externalAction?: string | null;
  externalOption?: string | null;
  conversationTurn?: number;
}

export function AgentPanel({ onActionClick, customer, timeline, externalAction, externalOption, conversationTurn = 0 }: AgentPanelProps) {
  const [activeAgents, setActiveAgents] = useState<ActiveAgent[]>([]);
  const lastExternalActionRef = useRef<string | null>(null);

  // Derive the "lead" agent (most recently activated) for step progress display
  const leadAgent = activeAgents.length > 0 ? activeAgents[activeAgents.length - 1] : null;
  const overallStep = leadAgent?.step ?? 0;

  // Sync external action detection — ADD to active agents, don't replace
  useEffect(() => {
    if (externalAction && externalAction !== lastExternalActionRef.current) {
      lastExternalActionRef.current = externalAction;
      setActiveAgents((prev) => {
        const exists = prev.find((a) => a.title === externalAction);
        if (exists) {
          // Already active — just uncollapse it
          return prev.map((a) =>
            a.title === externalAction ? { ...a, collapsed: false } : a
          );
        }
        // Collapse existing agents, add new one expanded
        return [
          ...prev.map((a) => ({ ...a, collapsed: true })),
          { title: externalAction, step: 1, activatedAtTurn: conversationTurn, collapsed: false },
        ];
      });
    }
  }, [externalAction, conversationTurn]);

  // Advance the lead agent's step based on conversation turns
  useEffect(() => {
    if (leadAgent && conversationTurn > leadAgent.activatedAtTurn) {
      const turnsSince = conversationTurn - leadAgent.activatedAtTurn;
      const newStep = Math.min(turnsSince + 1, stepLabels.length - 1);
      setActiveAgents((prev) =>
        prev.map((a, i) =>
          i === prev.length - 1 ? { ...a, step: newStep } : a
        )
      );
    }
  }, [conversationTurn, leadAgent]);

  const handleAction = useCallback((title: string) => {
    setActiveAgents((prev) => {
      const exists = prev.find((a) => a.title === title);
      if (exists) {
        // Already active — uncollapse and advance step
        return prev.map((a) =>
          a.title === title
            ? { ...a, collapsed: false, step: Math.min(a.step + 1, stepLabels.length - 1) }
            : a
        );
      }
      // Add new agent, collapse others
      return [
        ...prev.map((a) => ({ ...a, collapsed: true })),
        { title, step: 1, activatedAtTurn: conversationTurn, collapsed: false },
      ];
    });

    const prompt = actionPrompts[title];
    if (prompt && onActionClick) onActionClick(prompt);
  }, [conversationTurn, onActionClick]);

  const handleRemoveAgent = useCallback((title: string) => {
    setActiveAgents((prev) => prev.filter((a) => a.title !== title));
  }, []);

  const handleToggleCollapse = useCallback((title: string) => {
    setActiveAgents((prev) =>
      prev.map((a) => (a.title === title ? { ...a, collapsed: !a.collapsed } : a))
    );
  }, []);

  const handleAgentBack = useCallback((title: string) => {
    handleRemoveAgent(title);
  }, [handleRemoveAgent]);

  const handleExecuteAll = useCallback(() => {
    const summary = activeAgents.map((a) => a.title).join(", ");
    const prompt = `Execute the following combined actions for this customer: ${summary}. Provide a unified summary of all changes, total monthly cost impact, and confirmation for the customer.`;
    if (onActionClick) onActionClick(prompt);
    // Advance all to final step
    setActiveAgents((prev) =>
      prev.map((a) => ({ ...a, step: stepLabels.length - 1 }))
    );
  }, [activeAgents, onActionClick]);

  const hasActiveAgents = activeAgents.length > 0;
  const activeActionTitles = activeAgents.map((a) => a.title);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-border/50">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-bold px-3 py-1.5 rounded-full bg-primary/15 text-primary flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Multi-Agent Orchestrator
            </span>
            <span className="text-sm text-muted-foreground">
              {hasActiveAgents
                ? `${activeAgents.length} agent${activeAgents.length > 1 ? "s" : ""} active`
                : "9 agents ready"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">Step {overallStep + 1} of {stepLabels.length}</span>
          </div>
        </div>
        <StepProgress steps={stepLabels} currentStep={overallStep} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin p-5 space-y-5">
        <CustomerContext customer={customer} />

        {/* Agent Ribbon */}
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-sm text-foreground">
              {hasActiveAgents ? "Add Another Agent" : "AI Agent Recommendations"}
            </h3>
            {hasActiveAgents && (
              <span className="text-xs text-muted-foreground ml-auto">Tap to add to current flow</span>
            )}
          </div>

          {!hasActiveAgents && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              Pick an agent below to get started. Each one handles a different task.
            </p>
          )}

          <AnimatePresence mode="wait">
            {hasActiveAgents ? (
              <motion.div
                key="ribbon"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2 overflow-x-auto scrollbar-thin pb-1"
              >
                {actions.map((action) => {
                  const Icon = action.icon;
                  const isActive = activeActionTitles.includes(action.title);
                  return (
                    <motion.button
                      key={action.title}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => handleAction(action.title)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 transition-all border min-h-[40px] ${
                        isActive
                          ? "bg-primary/15 border-primary/40 text-primary shadow-sm"
                          : "bg-muted/40 border-border/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {action.agentName}
                      {isActive && <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />}
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4"
              >
                {actions.map((action, i) => (
                  <ActionCard key={action.title} {...action} delay={i} onClick={() => handleAction(action.title)} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Active Agent Sections — stacked & collapsible */}
        <AnimatePresence>
          {activeAgents.map((agent) => (
            <ActiveAgentSection
              key={agent.title}
              actionTitle={agent.title}
              currentStep={agent.step}
              customer={customer}
              externalOptionId={
                externalOption && externalAction === agent.title ? externalOption : null
              }
              isCollapsed={agent.collapsed}
              onToggleCollapse={() => handleToggleCollapse(agent.title)}
              onRemove={() => handleRemoveAgent(agent.title)}
              onOptionSelect={(prompt) => {
                setActiveAgents((prev) =>
                  prev.map((a) =>
                    a.title === agent.title
                      ? { ...a, step: Math.min(a.step + 1, stepLabels.length - 1) }
                      : a
                  )
                );
                if (onActionClick) onActionClick(prompt);
              }}
              onNextStep={(prompt) => {
                setActiveAgents((prev) =>
                  prev.map((a) =>
                    a.title === agent.title
                      ? { ...a, step: Math.min(a.step + 1, stepLabels.length - 1) }
                      : a
                  )
                );
                if (onActionClick) onActionClick(prompt);
              }}
              onBack={() => handleAgentBack(agent.title)}
            />
          ))}
        </AnimatePresence>

        {/* Combined Checkout */}
        <CombinedCheckout
          activeActions={activeActionTitles}
          onExecuteAll={handleExecuteAll}
        />

        <InteractionTimeline events={timeline} />
      </div>
    </div>
  );
}
