import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import TextDetector from "@/components/TextDetector";
import TextHumanizer from "@/components/TextHumanizer";
import MediaDetector from "@/components/MediaDetector";
import VideoScanner from "@/components/VideoScanner";
import SessionHistory from "@/components/SessionHistory";
import StatsCounter from "@/components/StatsCounter";
import ApiConfig from "@/components/ApiConfig";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import { HistoryProvider } from "@/components/HistoryContext";
import { Shield } from "lucide-react";

const Index = () => {
  return (
    <HistoryProvider>
      <div className="min-h-screen bg-background noise-overlay">
        <ParticleField />
        <Navbar />
        <ApiConfig />
        <HeroSection />

        <main className="relative z-10 max-w-6xl mx-auto px-6 pb-24 space-y-10">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <span className="text-[10px] font-display tracking-[0.3em] uppercase text-muted-foreground/40">
              ── Tools ──
            </span>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <TextDetector />
            <TextHumanizer />
          </div>

          <MediaDetector />

          {/* Stats section */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mt-4"
          >
            <span className="text-[10px] font-display tracking-[0.3em] uppercase text-muted-foreground/40">
              ── Stats ──
            </span>
          </motion.div>
          <StatsCounter />

          <SessionHistory />
        </main>

        <footer className="relative z-10 border-t border-border/20 py-12 text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex items-center gap-2 text-muted-foreground/40">
              <Shield className="w-3.5 h-3.5" />
              <p className="text-xs font-display tracking-[0.15em] uppercase">
                TruthGuard
              </p>
            </div>
            <p className="text-[11px] text-muted-foreground/30">
              AI Content Detection Suite · Built for truth · {new Date().getFullYear()}
            </p>
          </motion.div>
        </footer>
      </div>
    </HistoryProvider>
  );
};

export default Index;
