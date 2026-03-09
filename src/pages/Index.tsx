import { motion } from "framer-motion";
import HeroSection from "@/components/HeroSection";
import TextDetector from "@/components/TextDetector";
import TextHumanizer from "@/components/TextHumanizer";
import MediaDetector from "@/components/MediaDetector";
import ApiConfig from "@/components/ApiConfig";
import { Shield } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <ApiConfig />
      <HeroSection />

      <main className="max-w-6xl mx-auto px-6 pb-20 space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          <TextDetector />
          <TextHumanizer />
        </div>
        <MediaDetector />
      </main>

      <footer className="border-t border-border/30 py-10 text-center">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="flex flex-col items-center gap-2"
        >
          <div className="flex items-center gap-2 text-muted-foreground/60">
            <Shield className="w-3.5 h-3.5" />
            <p className="text-xs font-display tracking-wider uppercase">
              TruthGuard
            </p>
          </div>
          <p className="text-xs text-muted-foreground/40">
            AI Content Detection Suite · Built for truth
          </p>
        </motion.div>
      </footer>
    </div>
  );
};

export default Index;
