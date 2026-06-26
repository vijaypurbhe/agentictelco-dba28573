import { motion } from "framer-motion";
import telephonyIcon from "@/assets/telephony-icon.png";
import { ThemeToggle } from "./ThemeToggle";


export function TopBar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 border-b border-border bg-card flex items-center justify-between px-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-sm">
          <Globe className="w-5 h-5 text-primary-foreground" strokeWidth={2.25} />
        </div>
        <div>
          <h1 className="font-display text-lg text-foreground tracking-tight leading-none">
            Telco Agent Assist
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">Wireless Care Workspace</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />
      </div>
    </motion.header>
  );
}
