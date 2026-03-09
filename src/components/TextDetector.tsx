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
  const wordCount = text.split(/\s+/).filter(Boolean).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="glass-hover glow-border rounded-xl p-6 md:p-8 group"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/15 transition-colors"
        >
          <ScanSearch className="w-5 h-5 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">Text Detection</h2>
          <p className="text-sm text-muted-foreground">Analyze text to determine if it's AI-generated</p>
        </div>
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste text here to analyze..."
        className="min-h-[160px] bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground resize-none mb-4 font-body focus:glow-border transition-shadow duration-300"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-display tabular-nums">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </span>
        <Button
          onClick={handleDetect}
          disabled={loading || !text.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-display hover-lift"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <ScanSearch className="w-4 h-4 mr-2" />
          )}
          Analyze
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 p-4 rounded-lg border"
            style={{
              borderColor: isAI ? "hsl(var(--warning) / 0.4)" : "hsl(var(--success) / 0.4)",
              backgroundColor: isAI ? "hsl(var(--warning) / 0.05)" : "hsl(var(--success) / 0.05)",
            }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              >
                {isAI ? (
                  <AlertTriangle className="w-5 h-5 text-warning" />
                ) : (
                  <CheckCircle className="w-5 h-5 text-success" />
                )}
              </motion.div>
              <span className="font-display font-bold text-foreground">{result.result}</span>
              <motion.span
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="ml-auto text-sm text-muted-foreground font-display tabular-nums"
              >
                {result.confidence} confidence
              </motion.span>
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
