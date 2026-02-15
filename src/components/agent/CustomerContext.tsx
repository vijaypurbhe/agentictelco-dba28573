import { motion } from "framer-motion";
import { User, Phone, Signal, Calendar, TrendingUp, Shield } from "lucide-react";
import { CustomerData } from "@/types/customer";

interface CustomerContextProps {
  customer: CustomerData;
}

export function CustomerContext({ customer }: CustomerContextProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      key={customer.accountId}
      className="glass-panel p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{customer.name}</h3>
            <p className="text-xs text-muted-foreground">{customer.accountId}</p>
          </div>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-success/15 text-success font-medium">
          Active
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <InfoItem icon={Phone} label="Phone" value={customer.phone} />
        <InfoItem icon={Signal} label="Plan" value={customer.plan} />
        <InfoItem icon={Calendar} label="Tenure" value={customer.tenure} />
        <InfoItem icon={TrendingUp} label="ARPU" value={customer.arpu} />
        <InfoItem icon={Shield} label="Risk" value={customer.riskScore} />
        <InfoItem icon={TrendingUp} label="LTV" value={customer.ltv} />
      </div>

      <div className="pt-2 border-t border-border/50">
        <p className="text-xs text-muted-foreground">
          <span className="font-medium text-foreground/80">Data: </span>
          {customer.dataUsage}
        </p>
        <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full rounded-full bg-primary/80" style={{ width: `${customer.dataPercent}%` }} />
        </div>
      </div>
    </motion.div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5 text-muted-foreground">
      <Icon className="w-3 h-3 shrink-0" />
      <span>{label}:</span>
      <span className="text-foreground font-medium truncate">{value}</span>
    </div>
  );
}
