import { motion } from "framer-motion";
import {
  Phone,
  ArrowUpRight,
  CreditCard,
  MessageSquare,
  RefreshCw,
  AlertTriangle,
  Clock,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

type EventType = "call" | "plan_change" | "billing" | "complaint" | "device" | "retention";

interface TimelineEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  date: string;
  agent?: string;
  outcome?: string;
}

const eventConfig: Record<EventType, { icon: LucideIcon; color: string; bg: string }> = {
  call: { icon: Phone, color: "text-primary", bg: "bg-primary/15" },
  plan_change: { icon: ArrowUpRight, color: "text-accent", bg: "bg-accent/15" },
  billing: { icon: CreditCard, color: "text-success", bg: "bg-success/15" },
  complaint: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/15" },
  device: { icon: RefreshCw, color: "text-warning", bg: "bg-warning/15" },
  retention: { icon: MessageSquare, color: "text-primary", bg: "bg-primary/15" },
};

const events: TimelineEvent[] = [
  {
    id: "1",
    type: "call",
    title: "Plan Inquiry Call",
    description: "Customer called asking about data overage charges. Explained current plan limits.",
    date: "Feb 3, 2026",
    agent: "Agent Williams",
    outcome: "Resolved — no action taken",
  },
  {
    id: "2",
    type: "billing",
    title: "Payment Processed",
    description: "Monthly billing cycle completed. Auto-pay from Visa ending 4821.",
    date: "Jan 28, 2026",
    outcome: "$75.00 charged",
  },
  {
    id: "3",
    type: "plan_change",
    title: "Data Add-On Purchased",
    description: "Customer added 5GB one-time data boost due to approaching cap.",
    date: "Jan 15, 2026",
    agent: "Self-service (App)",
    outcome: "+$10.00 one-time",
  },
  {
    id: "4",
    type: "retention",
    title: "Loyalty Offer Applied",
    description: "Applied $5/mo discount for 12 months as tenure reward (3-year milestone).",
    date: "Dec 20, 2025",
    agent: "Agent Chen",
    outcome: "Discount active until Dec 2026",
  },
  {
    id: "5",
    type: "device",
    title: "Device Upgrade — iPhone 16 Pro",
    description: "Customer upgraded from iPhone 14. 24-month installment plan at $33.34/mo.",
    date: "Nov 8, 2025",
    agent: "Retail Store #4412",
    outcome: "Contract extended to Nov 2027",
  },
  {
    id: "6",
    type: "complaint",
    title: "Network Coverage Complaint",
    description: "Reported poor signal at home address. Escalated to network engineering.",
    date: "Oct 2, 2025",
    agent: "Agent Patel",
    outcome: "Resolved — tower upgrade completed",
  },
  {
    id: "7",
    type: "plan_change",
    title: "Plan Migration: Plus → Basic",
    description: "Customer downgraded from Unlimited Plus to Unlimited Basic to reduce costs.",
    date: "Aug 15, 2025",
    agent: "Agent Williams",
    outcome: "ARPU decreased $10/mo",
  },
  {
    id: "8",
    type: "billing",
    title: "Late Payment — Fee Waived",
    description: "Payment 5 days late. Agent waived $25 late fee due to customer tenure.",
    date: "Jun 28, 2025",
    agent: "Agent Torres",
    outcome: "$25 fee waived",
  },
];

export function InteractionTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel overflow-hidden"
    >
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Interaction History</h3>
        </div>
        <span className="text-[10px] text-muted-foreground">{events.length} events</span>
      </div>

      <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
        <div className="relative px-4 py-3">
          {/* Vertical line */}
          <div className="absolute left-[29px] top-0 bottom-0 w-px bg-border/60" />

          <div className="space-y-1">
            {events.map((event, i) => {
              const config = eventConfig[event.type];
              const Icon = config.icon;

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative flex gap-3 py-2.5 group"
                >
                  {/* Icon dot */}
                  <div
                    className={`w-6 h-6 rounded-full ${config.bg} flex items-center justify-center shrink-0 z-10 ring-2 ring-background`}
                  >
                    <Icon className={`w-3 h-3 ${config.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-foreground truncate">
                        {event.title}
                      </h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {event.date}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      {event.agent && (
                        <span className="text-[10px] text-muted-foreground/70">
                          {event.agent}
                        </span>
                      )}
                      {event.outcome && (
                        <span className="text-[10px] font-medium text-foreground/70">
                          {event.outcome}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
