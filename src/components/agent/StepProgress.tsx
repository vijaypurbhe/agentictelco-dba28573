import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface StepProgressProps {
  steps: string[];
  currentStep: number;
}

export function StepProgress({ steps, currentStep }: StepProgressProps) {
  return (
    <div className="flex items-center gap-1.5 w-full">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <div key={step} className="flex items-center gap-1.5 flex-1">
            <div className="flex flex-col items-center gap-1 shrink-0">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors
                  ${isCompleted ? "bg-success text-success-foreground" : ""}
                  ${isCurrent ? "bg-primary text-primary-foreground glow-border" : ""}
                  ${!isCompleted && !isCurrent ? "bg-muted text-muted-foreground" : ""}
                `}
              >
                {isCompleted ? <Check className="w-4 h-4" /> : i + 1}
              </motion.div>
              <span className={`text-[10px] font-medium leading-none ${isCurrent ? "text-primary" : isCompleted ? "text-success" : "text-muted-foreground"}`}>
                {step}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-success rounded-full"
                  initial={{ width: "0%" }}
                  animate={{ width: isCompleted ? "100%" : "0%" }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
