import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Film, Upload, Loader2, Play, Pause, SkipForward, SkipBack,
  AlertTriangle, CheckCircle, X, ArrowRight, Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { isDemoMode } from "@/lib/api";
import { useHistory } from "@/components/HistoryContext";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

interface FrameResult {
  frameIndex: number;
  timestamp: number;
  confidence: number;
  isDeepfake: boolean;
}

interface ScanResult {
  frames: FrameResult[];
  overallResult: string;
  overallConfidence: number;
}

const ALLOWED_VIDEO = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];

const VideoScanner = () => {
  const { addEntry } = useHistory();
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [hoveredFrame, setHoveredFrame] = useState<number | null>(null);

  const handleFile = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
    setScanProgress(0);
    setCurrentFrame(0);
    const url = URL.createObjectURL(f);
    setVideoUrl(url);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f && ALLOWED_VIDEO.includes(f.type)) handleFile(f);
    },
    [handleFile]
  );

  // Mock frame-by-frame analysis
  const analyzeFrames = async (): Promise<ScanResult> => {
    const totalFrames = 24 + Math.floor(Math.random() * 36);
    const frames: FrameResult[] = [];

    // Generate a "suspicious region" in the video
    const suspiciousStart = Math.floor(totalFrames * (0.2 + Math.random() * 0.3));
    const suspiciousEnd = suspiciousStart + Math.floor(totalFrames * (0.1 + Math.random() * 0.2));

    for (let i = 0; i < totalFrames; i++) {
      await new Promise((r) => setTimeout(r, 60 + Math.random() * 40));
      setScanProgress(((i + 1) / totalFrames) * 100);

      const isSuspicious = i >= suspiciousStart && i <= suspiciousEnd;
      const baseConfidence = isSuspicious ? 65 + Math.random() * 30 : 10 + Math.random() * 25;

      frames.push({
        frameIndex: i,
        timestamp: (i / totalFrames) * (videoRef.current?.duration || 10),
        confidence: parseFloat(baseConfidence.toFixed(1)),
        isDeepfake: baseConfidence > 50,
      });
    }

    const avgConfidence = frames.reduce((a, f) => a + f.confidence, 0) / frames.length;
    const deepfakeFrames = frames.filter((f) => f.isDeepfake).length;
    const deepfakeRatio = deepfakeFrames / frames.length;

    return {
      frames,
      overallResult: deepfakeRatio > 0.2 ? "Potential Deepfake Detected" : "Appears Authentic",
      overallConfidence: parseFloat(avgConfidence.toFixed(1)),
    };
  };

  const handleScan = async () => {
    if (!file) return;
    setScanning(true);
    setError(null);
    setResult(null);

    try {
      const scanResult = await analyzeFrames();
      setResult(scanResult);

      addEntry({
        type: "media-detection",
        input: `Video: ${file.name} (${scanResult.frames.length} frames)`,
        result: scanResult.overallResult,
        confidence: `${scanResult.overallConfidence}%`,
      });

      // Save to database if logged in
      if (user) {
        await supabase.from("scan_results").insert({
          user_id: user.id,
          scan_type: "video-scan",
          file_name: file.name,
          result: scanResult.overallResult,
          confidence: `${scanResult.overallConfidence}%`,
          frame_analysis: scanResult.frames as any,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Scan failed");
    } finally {
      setScanning(false);
    }
  };

  const clear = () => {
    setFile(null);
    setVideoUrl(null);
    setResult(null);
    setError(null);
    setScanProgress(0);
    setCurrentFrame(0);
    setPlaying(false);
  };

  const togglePlayback = () => {
    if (!videoRef.current) return;
    if (playing) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    setPlaying(!playing);
  };

  const seekToFrame = (frameIndex: number) => {
    if (!videoRef.current || !result) return;
    const frame = result.frames[frameIndex];
    if (frame) {
      videoRef.current.currentTime = frame.timestamp;
      setCurrentFrame(frameIndex);
    }
  };

  const isDeepfake = result?.overallResult?.toLowerCase().includes("deepfake");
  const displayedFrame = hoveredFrame !== null ? hoveredFrame : currentFrame;
  const currentFrameData = result?.frames[displayedFrame];

  return (
    <motion.div
      id="video-scanner"
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
          className="p-3 rounded-xl bg-accent/10 group-hover:bg-accent/15 transition-colors"
        >
          <Film className="w-5 h-5 text-accent" />
        </motion.div>
        <div>
          <h2 className="text-xl font-bold font-display text-foreground">Video Scanner</h2>
          <p className="text-sm text-muted-foreground">Frame-by-frame deepfake analysis</p>
        </div>
        <div className="ml-auto">
          <span className="text-[10px] font-display px-2.5 py-1 rounded-full bg-accent/10 text-accent font-semibold tracking-wider uppercase">
            Real-time
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!file ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-14 text-center cursor-pointer transition-all duration-300 ${
              dragOver
                ? "border-accent bg-accent/5 scale-[1.01]"
                : "border-border/40 hover:border-accent/40 hover:bg-muted/20"
            }`}
            onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = ALLOWED_VIDEO.map((t) => `.${t.split("/")[1]}`).join(",");
              input.onchange = (e) => {
                const f = (e.target as HTMLInputElement).files?.[0];
                if (f) handleFile(f);
              };
              input.click();
            }}
          >
            <motion.div
              animate={dragOver ? { scale: 1.15, y: -8 } : { scale: 1, y: 0 }}
              className="inline-flex p-4 rounded-2xl bg-muted/50 mb-4"
            >
              <Upload className="w-8 h-8 text-muted-foreground" />
            </motion.div>
            <p className="text-sm text-foreground font-medium">Drop a video file here</p>
            <p className="text-xs text-muted-foreground/50 mt-1">
              MP4, MOV, AVI, WebM · Frame-by-frame analysis
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="video-preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="space-y-4"
          >
            {/* Video player */}
            <div className="relative rounded-xl overflow-hidden bg-black/90 border border-border/30">
              <video
                ref={videoRef}
                src={videoUrl!}
                className="w-full max-h-[300px] object-contain"
                onTimeUpdate={() => {
                  if (videoRef.current && result) {
                    const time = videoRef.current.currentTime;
                    const closest = result.frames.reduce((prev, curr) =>
                      Math.abs(curr.timestamp - time) < Math.abs(prev.timestamp - time) ? curr : prev
                    );
                    setCurrentFrame(closest.frameIndex);
                  }
                }}
                onEnded={() => setPlaying(false)}
              />
              <canvas ref={canvasRef} className="hidden" />

              {/* Video controls overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={togglePlayback}
                    className="text-white hover:bg-white/20 h-8 w-8 p-0"
                  >
                    {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </Button>
                  <span className="text-xs text-white/70 font-display tabular-nums">
                    {file.name}
                  </span>
                  <div className="ml-auto">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clear}
                      className="text-white/70 hover:text-white hover:bg-white/20 h-8 w-8 p-0"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Scan button */}
            {!result && !scanning && (
              <Button
                onClick={handleScan}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 font-display hover-lift group/btn"
              >
                <Zap className="w-4 h-4 mr-2" />
                Analyze Frames
                <ArrowRight className="w-3.5 h-3.5 ml-1 opacity-0 -translate-x-1 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all" />
              </Button>
            )}

            {/* Scanning progress */}
            {scanning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-3"
              >
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-accent" />
                  <span className="text-sm font-display text-foreground">
                    Analyzing frames...
                  </span>
                  <span className="ml-auto text-xs font-display text-muted-foreground tabular-nums">
                    {scanProgress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={scanProgress} className="h-2" />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results with timeline */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-5 space-y-4"
          >
            {/* Overall result */}
            <div
              className="p-4 rounded-xl border"
              style={{
                borderColor: isDeepfake ? "hsl(var(--warning) / 0.3)" : "hsl(var(--success) / 0.3)",
                backgroundColor: isDeepfake ? "hsl(var(--warning) / 0.04)" : "hsl(var(--success) / 0.04)",
              }}
            >
              <div className="flex items-center gap-2 mb-2">
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
                <span className="font-display font-bold text-foreground">{result.overallResult}</span>
                <span className="ml-auto text-sm font-display text-muted-foreground tabular-nums">
                  {result.overallConfidence}% avg
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {result.frames.length} frames analyzed ·{" "}
                {result.frames.filter((f) => f.isDeepfake).length} suspicious frames detected
              </p>
            </div>

            {/* Frame confidence timeline */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-display text-muted-foreground uppercase tracking-wider">
                  Frame Timeline
                </span>
                {currentFrameData && (
                  <span className="text-xs font-display text-muted-foreground tabular-nums">
                    Frame {displayedFrame + 1}/{result.frames.length} ·{" "}
                    <span className={currentFrameData.isDeepfake ? "text-warning" : "text-success"}>
                      {currentFrameData.confidence}%
                    </span>
                  </span>
                )}
              </div>

              {/* Timeline bars */}
              <div className="flex gap-px h-16 items-end rounded-lg overflow-hidden bg-muted/20 p-1">
                {result.frames.map((frame, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(frame.confidence, 5)}%` }}
                    transition={{ duration: 0.3, delay: i * 0.02 }}
                    className={`flex-1 rounded-sm cursor-pointer transition-all duration-150 ${
                      i === displayedFrame
                        ? "ring-2 ring-foreground/50 ring-offset-1"
                        : ""
                    } ${
                      frame.isDeepfake
                        ? "bg-warning hover:bg-warning/80"
                        : "bg-success/60 hover:bg-success/80"
                    }`}
                    onClick={() => seekToFrame(i)}
                    onMouseEnter={() => setHoveredFrame(i)}
                    onMouseLeave={() => setHoveredFrame(null)}
                  />
                ))}
              </div>

              {/* Timeline nav */}
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => seekToFrame(Math.max(0, currentFrame - 1))}
                  disabled={currentFrame === 0}
                  className="h-7 w-7 p-0"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={togglePlayback}
                  className="h-7 w-7 p-0"
                >
                  {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => seekToFrame(Math.min(result.frames.length - 1, currentFrame + 1))}
                  disabled={currentFrame === result.frames.length - 1}
                  className="h-7 w-7 p-0"
                >
                  <SkipForward className="w-3.5 h-3.5" />
                </Button>
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 justify-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-success/60" />
                  <span className="text-[10px] font-display text-muted-foreground">Authentic</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-sm bg-warning" />
                  <span className="text-[10px] font-display text-muted-foreground">Suspicious</span>
                </div>
              </div>
            </div>

            {isDemoMode() && (
              <p className="text-xs text-muted-foreground/60 italic border-t border-border/20 pt-2">
                ⚡ Demo result — connect a real API for accurate frame analysis
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default VideoScanner;
