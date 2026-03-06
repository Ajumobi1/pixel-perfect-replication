import HeroSection from "@/components/HeroSection";
import TextDetector from "@/components/TextDetector";
import TextHumanizer from "@/components/TextHumanizer";
import MediaDetector from "@/components/MediaDetector";
import ApiConfig from "@/components/ApiConfig";

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

      <footer className="border-t border-border/30 py-8 text-center">
        <p className="text-xs text-muted-foreground font-display">
          TruthGuard · AI Content Detection Suite
        </p>
      </footer>
    </div>
  );
};

export default Index;
