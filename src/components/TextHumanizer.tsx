import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { humanizeText, isDemoMode, type HumanizeResult } from "@/lib/api";

const TextHumanizer = () => {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<HumanizeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleHumanize = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await humanizeText(text);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Humanize failed. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.humanized) {
      navigator.clipboard.writeText(result.humanized);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="glass glow-border rounded-xl p-6 md:p-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-primary/10">
          <Wand2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">Text Humanizer</h2>
          <p className="text-sm text-muted-foreground">Rewrite AI text to sound more natural</p>
        </div>
      </div>

      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste AI-generated text to humanize..."
        className="min-h-[160px] bg-muted/50 border-border/50 text-foreground placeholder:text-muted-foreground resize-none mb-4 font-body"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {text.split(/\s+/).filter(Boolean).length} words
        </span>
        <Button
          onClick={handleHumanize}
          disabled={loading || !text.trim()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 font-display"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Wand2 className="w-4 h-4 mr-2" />}
          Humanize
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
            className="mt-4"
          >
            <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-display text-primary">Humanized Output</span>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="text-muted-foreground hover:text-foreground h-7 px-2">
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </Button>
              </div>
              <p className="text-sm text-foreground leading-relaxed">{result.humanized}</p>
              <div className="flex gap-4 mt-3 text-xs text-muted-foreground font-display">
                <span>Words used: {result.words_used}</span>
                <span>Remaining: {result.words_remaining}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TextHumanizer;
