import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft, MapPin, Battery, BatteryCharging, Wifi, Smartphone,
  Clock, Radio, Bell, Navigation, Activity, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";

interface Device {
  id: string;
  device_id: string;
  battery: string | null;
  charging: string | null;
  platform: string | null;
  model: string | null;
  network: string | null;
  lat: number | null;
  lon: number | null;
  status: string | null;
  last_seen: string;
}

interface Trail {
  id: string;
  lat: number;
  lon: number;
  recorded_at: string;
}

interface NotificationLog {
  id: string;
  type: string | null;
  sender: string | null;
  message: string | null;
  recorded_at: string;
}

const DeviceDetail = ({ device, onBack }: { device: Device; onBack: () => void }) => {
  const [trails, setTrails] = useState<Trail[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loadingTrails, setLoadingTrails] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [pinging, setPinging] = useState(false);
  const [activeTab, setActiveTab] = useState<"trails" | "notifications">("trails");

  const isOnline = device.status === "online";

  useEffect(() => {
    fetchTrails();
    fetchLogs();
  }, [device.device_id]);

  const fetchTrails = async () => {
    const { data } = await supabase
      .from("trails")
      .select("*")
      .eq("device_id", device.device_id)
      .order("recorded_at", { ascending: false })
      .limit(100);
    setTrails((data as Trail[]) || []);
    setLoadingTrails(false);
  };

  const fetchLogs = async () => {
    const { data } = await supabase
      .from("notification_logs")
      .select("*")
      .eq("device_id", device.device_id)
      .order("recorded_at", { ascending: false })
      .limit(50);
    setLogs((data as NotificationLog[]) || []);
    setLoadingLogs(false);
  };

  const pingDevice = async () => {
    setPinging(true);
    // Simulate ping via edge function — in production this would signal the device
    await new Promise((r) => setTimeout(r, 1500));
    setPinging(false);
  };

  return (
    <div className="min-h-screen bg-background noise-overlay">
      <ParticleField />
      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-24">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold font-display text-foreground">{device.device_id}</h1>
              <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? "bg-success animate-pulse" : "bg-muted-foreground/30"}`} />
            </div>
            <p className="text-sm text-muted-foreground">{device.model} · {device.platform}</p>
          </div>
          <Button
            size="sm"
            onClick={pingDevice}
            disabled={pinging}
            className="bg-accent text-accent-foreground hover:bg-accent/90 font-display"
          >
            {pinging ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Radio className="w-4 h-4 mr-1" />}
            Ping
          </Button>
        </div>

        {/* Device info cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              icon: device.charging === "true" ? BatteryCharging : Battery,
              label: "Battery",
              value: device.battery ? `${device.battery}%` : "—",
              color: device.charging === "true" ? "text-success" : "text-foreground",
            },
            { icon: Wifi, label: "Network", value: device.network || "—", color: "text-foreground" },
            {
              icon: MapPin,
              label: "Location",
              value: device.lat != null ? `${device.lat.toFixed(4)}, ${device.lon?.toFixed(4)}` : "No GPS",
              color: device.lat != null ? "text-primary" : "text-muted-foreground",
            },
            {
              icon: Clock,
              label: "Last Seen",
              value: new Date(device.last_seen).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              color: "text-foreground",
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-3 glow-border"
            >
              <item.icon className={`w-4 h-4 mb-1 ${item.color}`} />
              <p className="text-[10px] text-muted-foreground/60 font-display">{item.label}</p>
              <p className={`text-xs font-display font-semibold mt-0.5 ${item.color} truncate`}>{item.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Map placeholder */}
        {device.lat != null && device.lon != null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="glass rounded-xl glow-border p-4 mb-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Navigation className="w-4 h-4 text-primary" />
              <span className="text-xs font-display font-semibold text-foreground">Live Location</span>
            </div>
            <div className="w-full h-48 rounded-lg bg-muted/30 flex items-center justify-center border border-border/20 overflow-hidden">
              <img
                src={`https://maps.googleapis.com/maps/api/staticmap?center=${device.lat},${device.lon}&zoom=15&size=600x300&markers=color:red%7C${device.lat},${device.lon}&style=feature:all%7Celement:geometry%7Ccolor:0x1a1a2e&style=feature:road%7Celement:geometry%7Ccolor:0x2d2d44&style=feature:water%7Celement:geometry%7Ccolor:0x0d1117&key=`}
                alt="Device location"
                className="w-full h-full object-cover opacity-50"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              <div className="absolute flex flex-col items-center gap-1">
                <MapPin className="w-6 h-6 text-primary" />
                <span className="text-[10px] font-display text-muted-foreground">
                  {device.lat.toFixed(5)}, {device.lon.toFixed(5)}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex rounded-xl bg-muted/30 p-1 mb-4">
          {(["trails", "notifications"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 rounded-lg text-xs font-display font-medium transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === tab
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "trails" ? <Navigation className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
              {tab === "trails" ? `Trail (${trails.length})` : `Notifications (${logs.length})`}
            </button>
          ))}
        </div>

        {/* Trail list */}
        {activeTab === "trails" && (
          <div className="space-y-2">
            {loadingTrails ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : trails.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground/50 py-10 font-display">No movement data</p>
            ) : (
              trails.map((trail, i) => (
                <motion.div
                  key={trail.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="flex items-center gap-3 glass rounded-lg p-3"
                >
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <div className="flex-1">
                    <span className="text-xs font-display font-semibold text-foreground">
                      {trail.lat.toFixed(5)}, {trail.lon.toFixed(5)}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground/50 font-display">
                    {new Date(trail.recorded_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        )}

        {/* Notification logs */}
        {activeTab === "notifications" && (
          <div className="space-y-2">
            {loadingLogs ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : logs.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground/50 py-10 font-display">No notifications captured</p>
            ) : (
              logs.map((log, i) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.02 }}
                  className="glass rounded-lg p-3"
                >
                  <div className="flex items-center gap-2">
                    <Bell className="w-3.5 h-3.5 text-accent shrink-0" />
                    <span className="text-xs font-display font-semibold text-foreground truncate">
                      {log.sender || "Unknown"}
                    </span>
                    <span className="text-[10px] text-muted-foreground/50 font-display ml-auto shrink-0">
                      {new Date(log.recorded_at).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                    </span>
                  </div>
                  {log.message && (
                    <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2 ml-5">{log.message}</p>
                  )}
                </motion.div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DeviceDetail;
