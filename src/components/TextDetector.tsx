import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScanSearch, Loader2, AlertTriangle, CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { detectText, isDemoMode, type DetectionResult } from "@/lib/api";
import { useHistory } from "@/components/HistoryContext";
import ConfidenceBar from "@/components/ConfidenceBar";

const TextDetector = () => {
  const { addEntry } = useHistory();
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
      addEntry({
        type: "text-detection",
        input: text.slice(0, 200),
        result: res.result,
        confidence: res.confidence,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Detection failed. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  const isAI = result?.result?.toLowerCase().includes("ai");
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  return (
    <motion.div
      id="detect"
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="glass-hover gradient-border rounded-2xl p-6 md:p-8 group noise-overlay"
    >
      <div className="flex items-center gap-3 mb-6">
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/15 transition-colors"
        >
          <ScanSearch className="w-5 h-5 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">Text Detection</h2>
          <p className="text-sm text-muted-foreground">Analyze text to determine if it's AI-generated</p>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste text here to analyze..."
          className="min-h-[180px] bg-muted/30 border-border/40 text-foreground placeholder:text-muted-foreground/50 resize-none mb-4 font-body focus:glow-border transition-shadow duration-300 rounded-xl"
        />
        {text.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute bottom-7 right-3 flex gap-2"
          >
            <span className="text-[10px] text-muted-foreground/40 font-display tabular-nums bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded">
              {charCount} chars
            </span>
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-display tabular-nums">
          {wordCount} word{wordCount !== 1 ? "s" : ""}
        </span>
        <Button
          onClick={handleDetect}
          disabled={loading || !text.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-display hover-lift group/btn"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <ScanSearch className="w-4 h-4 mr-2" />
          )}
          Analyze
          {!loading && <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-x-1 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />}
        </Button>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm"
          >
            {error}
          </motion.div>
        )}
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -5, height: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 p-5 rounded-xl border"
            style={{
              borderColor: isAI ? "hsl(var(--warning) / 0.3)" : "hsl(var(--success) / 0.3)",
              backgroundColor: isAI ? "hsl(var(--warning) / 0.04)" : "hsl(var(--success) / 0.04)",
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
            </div>
            <ConfidenceBar confidence={result.confidence} isWarning={!!isAI} />
            {isDemoMode() && (
              <p className="mt-3 text-xs text-muted-foreground/60 italic border-t border-border/20 pt-2">
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
