import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScanSearch, Wand2, Shield, Zap } from "lucide-react";

const stats = [
  { icon: ScanSearch, label: "Texts Analyzed", end: 12847, suffix: "+" },
  { icon: Shield, label: "Media Scanned", end: 8432, suffix: "+" },
  { icon: Wand2, label: "Texts Humanized", end: 5291, suffix: "+" },
  { icon: Zap, label: "Accuracy Rate", end: 98.7, suffix: "%", decimals: 1 },
];

function AnimatedNumber({ end, decimals = 0, suffix = "" }: { end: number; decimals?: number; suffix?: string }) {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const startTime = Date.now();
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(eased * end);
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [started, end]);

  return (
    <motion.span
      onViewportEnter={() => setStarted(true)}
      viewport={{ once: true }}
      className="text-2xl md:text-3xl font-bold font-display text-foreground tabular-nums"
    >
      {decimals > 0 ? value.toFixed(decimals) : Math.floor(value).toLocaleString()}{suffix}
    </motion.span>
  );
}

const StatsCounter = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.1, duration: 0.5 }}
          className="glass glow-border rounded-xl p-5 text-center group hover-lift noise-overlay"
        >
          <div className="inline-flex p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors mb-3">
            <stat.icon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <AnimatedNumber end={stat.end} decimals={stat.decimals} suffix={stat.suffix} />
          </div>
          <p className="text-xs text-muted-foreground mt-1 font-display tracking-wider uppercase">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default StatsCounter;
