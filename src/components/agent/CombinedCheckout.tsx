import { motion } from "framer-motion";
import { ShoppingCart, CheckCircle2, ArrowRight } from "lucide-react";
import {
  TrendingUp, Zap, Gift, Smartphone, Wifi, Shield, Receipt, Power, Users,
} from "lucide-react";

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

interface CombinedCheckoutProps {
  activeActions: string[];
  onExecuteAll: () => void;
}

export function CombinedCheckout({ activeActions, onExecuteAll }: CombinedCheckoutProps) {
  if (activeActions.length < 2) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel border border-primary/30 p-5 space-y-4"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
          <ShoppingCart className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Combined Execution Summary</h3>
          <p className="text-xs text-muted-foreground">{activeActions.length} actions queued for this interaction</p>
        </div>
      </div>

      <div className="space-y-2">
        {activeActions.map((action, i) => {
          const Icon = actionIcons[action] || TrendingUp;
          return (
            <div key={action} className="flex items-center gap-3 p-3 rounded-lg bg-muted/40 border border-border/40">
              <span className="w-6 h-6 rounded-full bg-primary/15 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <Icon className="w-4 h-4 text-primary shrink-0" />
              <span className="text-sm font-medium text-foreground flex-1">{action}</span>
              <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            </div>
          );
        })}
      </div>

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={onExecuteAll}
        className="w-full flex items-center justify-center gap-2 py-4 px-5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:bg-primary/90 transition-all min-h-[48px]"
      >
        <ShoppingCart className="w-4 h-4" />
        Execute All {activeActions.length} Actions
        <ArrowRight className="w-4 h-4" />
      </motion.button>
    </motion.div>
  );
}
