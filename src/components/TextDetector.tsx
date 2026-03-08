import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanSearch, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { detectText, isDemoMode, type DetectionResult } from "@/lib/api";

const TextDetector = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDetect = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await detectText(text);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Detection failed. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  const isAI = result?.result?.toLowerCase().includes("ai");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass glow-border rounded-xl p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <ScanSearch className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">Text Detection</h2>
          <p className="text-sm text-muted-foreground">Analyze text to determine if it's AI-generated</p>
        </div>
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text here to analyze..."
        className="min-h-[160px] bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground resize-none mb-4 font-body"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {text.split(/\s+/).filter(Boolean).length} words
        </span>
        <Button
          onClick={handleDetect}
          disabled={loading || !text.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-display"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ScanSearch className="w-4 h-4 mr-2" />}
          Analyze
        </Button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-4 rounded-lg border"
            style={{
              borderColor: isAI ? "hsl(var(--warning) / 0.4)" : "hsl(var(--success) / 0.4)",
              backgroundColor: isAI ? "hsl(var(--warning) / 0.05)" : "hsl(var(--success) / 0.05)",
            }}
          >
            <div className="flex items-center gap-2">
              {isAI ? (
                <AlertTriangle className="w-5 h-5 text-warning" />
              ) : (
                <CheckCircle className="w-5 h-5 text-success" />
              )}
              <span className="font-display font-bold text-foreground">{result.result}</span>
              <span className="ml-auto text-sm text-muted-foreground font-display">
                {result.confidence} confidence
              </span>
            </div>
            {isDemoMode() && (
              <p className="mt-2 text-xs text-muted-foreground/70 italic border-t border-border/30 pt-2">
                ⚡ Demo result — connect a real API for accurate detection
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TextDetector;
