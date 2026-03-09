import { motion } from "framer-motion";

interface ConfidenceBarProps {
  confidence: string;
  isWarning: boolean;
}

const ConfidenceBar = ({ confidence, isWarning }: ConfidenceBarProps) => {
  const value = parseFloat(confidence);

  return (
    <div className="mt-3 space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-display text-muted-foreground uppercase tracking-wider">Confidence</span>
        <span className="text-sm font-display font-bold tabular-nums text-foreground">{confidence}</span>
      </div>
      <div className="h-2 rounded-full bg-muted/80 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="h-full rounded-full relative"
          style={{
            background: isWarning
              ? `linear-gradient(90deg, hsl(var(--warning)), hsl(var(--warning) / 0.7))`
              : `linear-gradient(90deg, hsl(var(--success)), hsl(var(--success) / 0.7))`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)",
              backgroundSize: "200% 100%",
              animation: "shimmer 2s ease-in-out infinite",
            }}
          />
        </motion.div>
      </div>
    </div>
  );
};

export default ConfidenceBar;
