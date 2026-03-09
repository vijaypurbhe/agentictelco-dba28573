import { motion } from "framer-motion";
import { Sparkles, Globe } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-14 border-b border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between px-5"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/20">
          <Globe className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-sm text-foreground tracking-tight">AT&T Agent Assist</h1>
          <p className="text-[10px] text-muted-foreground">Agentic Enterprise Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20">
          <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
          <span className="text-[10px] font-medium text-success">AI Active</span>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-3 h-3 text-primary" />
          <span className="text-[10px] font-medium text-primary">Enterprise</span>
        </div>
        <ThemeToggle />
      </div>
    </motion.header>
  );
}
