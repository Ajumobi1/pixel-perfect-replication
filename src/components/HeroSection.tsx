import { motion } from "framer-motion";
import { Shield, ScanSearch, Wand2, ChevronDown, Sparkles } from "lucide-react";

const features = [
  { icon: ScanSearch, label: "Text Detection", desc: "AI vs Human", color: "primary" },
  { icon: Shield, label: "Deepfake Scanner", desc: "Image & Video", color: "primary" },
  { icon: Wand2, label: "Humanizer", desc: "Rewrite AI text", color: "accent" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden px-6 pt-16">
      {/* Radial gradient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-[0.08] blur-[120px]"
          style={{ background: `radial-gradient(circle, hsl(var(--primary)), hsl(var(--accent)), transparent)` }}
        />
      </div>

      {/* Orbital rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] pointer-events-none">
        <div className="absolute inset-0 rounded-full border border-primary/5" style={{ animation: "pulse-ring 4s ease-out infinite" }} />
        <div className="absolute inset-[-40px] rounded-full border border-accent/5" style={{ animation: "pulse-ring 4s ease-out infinite 1s" }} />
        <div className="absolute inset-[-80px] rounded-full border border-primary/3" style={{ animation: "pulse-ring 4s ease-out infinite 2s" }} />
      </div>

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "80px 80px",
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-10"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass gradient-border mb-10 hover-lift"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-foreground/80 font-display tracking-wide">
              AI Content Detection Suite
            </span>
          </motion.div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold font-display tracking-tighter mb-8 leading-[0.9]">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-gradient-animated block"
            >
              Truth
            </motion.span>
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.8 }}
              className="text-foreground block"
            >
              Guard
            </motion.span>
          </h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Detect AI-generated text, deepfake images & videos, and humanize content —
            <span className="text-foreground font-medium"> all from one powerful interface.</span>
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="flex flex-wrap justify-center gap-4 md:gap-5 mt-12"
        >
          {features.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.85, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.8 + i * 0.12, type: "spring", stiffness: 180, damping: 18 }}
              whileHover={{ scale: 1.06, y: -4 }}
              whileTap={{ scale: 0.97 }}
              className="glass-hover gradient-border rounded-xl px-6 py-5 flex items-center gap-4 min-w-[220px] cursor-default noise-overlay"
            >
              <div className={`p-2.5 rounded-lg ${item.color === "accent" ? "bg-accent/10" : "bg-primary/10"}`}>
                <item.icon className={`w-5 h-5 ${item.color === "accent" ? "text-accent" : "text-primary"}`} />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground font-display">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="mt-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex flex-col items-center gap-1.5 text-muted-foreground/30"
          >
            <span className="text-[10px] font-display tracking-[0.2em] uppercase">Scroll to explore</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
