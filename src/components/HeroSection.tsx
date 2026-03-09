import { motion } from "framer-motion";
import { Shield, ScanSearch, Wand2, ChevronDown } from "lucide-react";

const features = [
  { icon: ScanSearch, label: "Text Detection", desc: "AI vs Human" },
  { icon: Shield, label: "Deepfake Scanner", desc: "Image & Video" },
  { icon: Wand2, label: "Humanizer", desc: "Rewrite AI text" },
];

const HeroSection = () => {
  return (
    <section className="relative min-h-[80vh] flex items-center justify-center overflow-hidden px-6">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 rounded-full opacity-[0.07] blur-[100px]"
          style={{ background: "hsl(var(--primary))", animation: "float 8s ease-in-out infinite" }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 rounded-full opacity-[0.05] blur-[100px]"
          style={{ background: "hsl(var(--primary))", animation: "float 8s ease-in-out infinite 4s" }}
        />
      </div>

      {/* Scan line effect */}
      <div className="absolute inset-0 scan-line pointer-events-none" />

      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mb-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass glow-border mb-8 hover-lift"
          >
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary font-display">AI Content Detection Suite</span>
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold font-display tracking-tight mb-6">
            <span className="text-gradient-animated">Truth</span>
            <span className="text-foreground">Guard</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Detect AI-generated text, deepfake images & videos, and humanize content —
            all from one powerful interface.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-4 md:gap-6 mt-10"
        >
          {features.map((item, i) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.12, type: "spring", stiffness: 200, damping: 20 }}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              className="glass-hover glow-border rounded-lg px-6 py-4 flex items-center gap-3 min-w-[200px] cursor-default"
            >
              <div className="p-2 rounded-md bg-primary/10">
                <item.icon className="w-5 h-5 text-primary" />
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
          transition={{ delay: 1.2 }}
          className="mt-16"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="inline-flex flex-col items-center gap-1 text-muted-foreground/40"
          >
            <span className="text-xs font-display tracking-widest uppercase">Explore</span>
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
