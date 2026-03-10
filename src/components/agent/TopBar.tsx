import { motion } from "framer-motion";
import { Sparkles, Globe } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function TopBar() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-16 border-b border-border/50 bg-card/60 backdrop-blur-xl flex items-center justify-between px-6"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/15 flex items-center justify-center ring-2 ring-primary/20">
          <Globe className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="font-bold text-base text-foreground tracking-tight">AT&T Agent Assist</h1>
          <p className="text-xs text-muted-foreground">Agentic Enterprise Platform</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-success">AI Active</span>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Sparkles className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-primary">Enterprise</span>
        </div>
        <ThemeToggle />
      </div>
    </motion.header>
  );
}
