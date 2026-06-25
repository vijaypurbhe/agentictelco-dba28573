import { motion } from "framer-motion";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 border-b-2 border-border bg-card flex items-center justify-between px-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-2xl shadow-[0_3px_0_hsl(var(--primary)/0.5)]">
          <span aria-hidden>🍔</span>
        </div>
        <div>
          <h1 className="font-display text-lg text-foreground tracking-tight leading-none">Telco Agent Assist</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Easy-Order Workspace</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success text-success-foreground">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-display uppercase tracking-wider">AI On</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent text-accent-foreground">
          <span aria-hidden>⭐</span>
          <span className="text-xs font-display uppercase tracking-wider">Pro Crew</span>
        </div>
        <ThemeToggle />
      </div>
    </motion.header>
  );
}
