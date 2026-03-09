import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Upload, Loader2, AlertTriangle, CheckCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { detectMedia, isDemoMode, type DetectionResult } from "@/lib/api";
import { useHistory } from "@/components/HistoryContext";

const ALLOWED = ["image/png", "image/jpeg", "image/jpg", "video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];

const MediaDetector = () => {
  const { addEntry } = useHistory();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    if (f.type.startsWith("image/")) {
      const url = URL.createObjectURL(f);
      setPreview(url);
    } else {
      setPreview(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f && ALLOWED.includes(f.type)) handleFile(f);
    },
    [handleFile]
  );

  const handleDetect = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await detectMedia(file);
      setResult(res);
      addEntry({
        type: "media-detection",
        input: file.name,
        result: res.result,
        confidence: res.confidence,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Detection failed. Is the API running?");
    } finally {
      setLoading(false);
    }
  };

  const clear = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
  };

  const isDeepfake = result?.result?.toLowerCase().includes("deepfake") || result?.result?.toLowerCase().includes("ai");

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
          <Shield className="w-5 h-5 text-primary" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">Media Scanner</h2>
          <p className="text-sm text-muted-foreground">Detect deepfakes in images & videos</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
              dragOver
                ? "border-primary bg-primary/5 scale-[1.02]"
                : "border-border/50 hover:border-primary/50 hover:bg-muted/30"
            }`}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ALLOWED.map(t => `.${t.split("/")[1]}`).join(",");
              input.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) handleFile(f);
              };
              input.click();
            }}
          >
            <motion.div
              animate={dragOver ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            </motion.div>
            <p className="text-sm text-muted-foreground">Drop an image or video here, or click to browse</p>
            <p className="text-xs text-muted-foreground/60 mt-1">PNG, JPG, MP4, MOV, AVI, WebM · Max 50MB</p>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 border border-border/50">
              {preview && (
                <motion.img
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  src={preview}
                  alt="Preview"
                  className="w-16 h-16 object-cover rounded-md"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <Button variant="ghost" size="sm" onClick={clear} className="text-muted-foreground hover:text-foreground h-8 w-8 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <Button
              onClick={handleDetect}
              disabled={loading}
              className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display hover-lift"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
              Scan for Deepfakes
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

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
              borderColor: isDeepfake ? "hsl(var(--warning) / 0.4)" : "hsl(var(--success) / 0.4)",
              backgroundColor: isDeepfake ? "hsl(var(--warning) / 0.05)" : "hsl(var(--success) / 0.05)",
            }}
          >
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, delay: 0.1 }}
              >
                {isDeepfake ? (
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
                ⚡ Demo result — connect a real API for accurate deepfake detection
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MediaDetector;
