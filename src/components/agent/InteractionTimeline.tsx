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
import { TimelineEvent } from "@/types/customer";

const eventConfig: Record<TimelineEvent["type"], { icon: LucideIcon; color: string; bg: string }> = {
  call: { icon: Phone, color: "text-primary", bg: "bg-primary/15" },
  plan_change: { icon: ArrowUpRight, color: "text-accent", bg: "bg-accent/15" },
  billing: { icon: CreditCard, color: "text-success", bg: "bg-success/15" },
  complaint: { icon: AlertTriangle, color: "text-destructive", bg: "bg-destructive/15" },
  device: { icon: RefreshCw, color: "text-warning", bg: "bg-warning/15" },
  retention: { icon: MessageSquare, color: "text-primary", bg: "bg-primary/15" },
};

interface InteractionTimelineProps {
  events: TimelineEvent[];
}

export function InteractionTimeline({ events }: InteractionTimelineProps) {
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
          <div className="absolute left-[29px] top-0 bottom-0 w-px bg-border/60" />
          <div className="space-y-1">
            {events.map((event, i) => {
              const config = eventConfig[event.type] || eventConfig.call;
              const Icon = config.icon;
              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="relative flex gap-3 py-2.5 group"
                >
                  <div className={`w-6 h-6 rounded-full ${config.bg} flex items-center justify-center shrink-0 z-10 ring-2 ring-background`}>
                    <Icon className={`w-3 h-3 ${config.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-xs font-semibold text-foreground truncate">{event.title}</h4>
                      <span className="text-[10px] text-muted-foreground whitespace-nowrap">{event.date}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">{event.description}</p>
                    <div className="flex items-center gap-3 mt-1">
                      {event.agent && <span className="text-[10px] text-muted-foreground/70">{event.agent}</span>}
                      {event.outcome && <span className="text-[10px] font-medium text-foreground/70">{event.outcome}</span>}
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
