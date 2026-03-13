import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Smartphone, Battery, Wifi, MapPin, Signal, Clock, Trash2,
  Plus, ArrowLeft, Loader2, Radio, BatteryCharging
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import ParticleField from "@/components/ParticleField";
import DeviceDetail from "@/components/DeviceDetail";

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
  created_at: string;
}

const Devices = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newDeviceId, setNewDeviceId] = useState("");

  useEffect(() => {
    if (!user) return;
    fetchDevices();

    // Realtime subscription
    const channel = supabase
      .channel("devices-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "devices", filter: `user_id=eq.${user.id}` },
        () => fetchDevices()
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const fetchDevices = async () => {
    const { data } = await supabase
      .from("devices")
      .select("*")
      .order("last_seen", { ascending: false });
    setDevices((data as Device[]) || []);
    setLoading(false);
  };

  const addDevice = async () => {
    if (!newDeviceId.trim() || !user) return;
    await supabase.from("devices").upsert(
      {
        user_id: user.id,
        device_id: newDeviceId.trim(),
        status: "offline",
        model: "Manual Entry",
      },
      { onConflict: "user_id,device_id" }
    );
    setNewDeviceId("");
    setShowAdd(false);
    fetchDevices();
  };

  const deleteDevice = async (id: string) => {
    await supabase.from("devices").delete().eq("id", id);
    setDevices((prev) => prev.filter((d) => d.id !== id));
    if (selectedDevice?.id === id) setSelectedDevice(null);
  };

  const isOnline = (d: Device) => d.status === "online";
  const onlineCount = devices.filter(isOnline).length;

  if (selectedDevice) {
    return <DeviceDetail device={selectedDevice} onBack={() => setSelectedDevice(null)} />;
  }

  return (
    <div className="min-h-screen bg-background noise-overlay">
      <ParticleField />
      <Navbar />

      <main className="relative z-10 max-w-4xl mx-auto px-6 pt-24 pb-24">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold font-display text-foreground">Connected Devices</h1>
            <p className="text-sm text-muted-foreground">
              {onlineCount} online · {devices.length} total
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => setShowAdd(!showAdd)}
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-display"
          >
            <Plus className="w-4 h-4 mr-1" /> Add Device
          </Button>
        </div>

        <AnimatePresence>
          {showAdd && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="glass glow-border rounded-xl p-4 flex gap-3">
                <Input
                  placeholder="Enter device ID..."
                  value={newDeviceId}
                  onChange={(e) => setNewDeviceId(e.target.value)}
                  className="bg-muted/20 border-border/40 font-display"
                  onKeyDown={(e) => e.key === "Enter" && addDevice()}
                />
                <Button onClick={addDevice} className="bg-primary text-primary-foreground font-display shrink-0">
                  Register
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : devices.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <div className="inline-flex p-4 rounded-2xl bg-muted/30 mb-4">
              <Smartphone className="w-8 h-8 text-muted-foreground/50" />
            </div>
            <p className="text-muted-foreground font-display">No devices registered</p>
            <p className="text-sm text-muted-foreground/50 mt-1">Add a device to start tracking</p>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            <AnimatePresence>
              {devices.map((device, i) => (
                <motion.div
                  key={device.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => setSelectedDevice(device)}
                  className="glass rounded-xl border border-border/30 p-4 gradient-border cursor-pointer hover:bg-card/70 transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-lg shrink-0 ${isOnline(device) ? "bg-success/10" : "bg-muted/30"}`}>
                      <Smartphone className={`w-5 h-5 ${isOnline(device) ? "text-success" : "text-muted-foreground/50"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-display font-bold text-foreground truncate">
                          {device.device_id}
                        </span>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isOnline(device) ? "bg-success animate-pulse" : "bg-muted-foreground/30"}`} />
                      </div>
                      <p className="text-xs text-muted-foreground/70 font-display mt-0.5">
                        {device.model || "Unknown"} · {device.platform || "—"}
                      </p>

                      <div className="flex flex-wrap gap-2 mt-2">
                        {device.battery && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 font-display">
                            {device.charging === "true" ? (
                              <BatteryCharging className="w-3 h-3 text-success" />
                            ) : (
                              <Battery className="w-3 h-3" />
                            )}
                            {device.battery}%
                          </span>
                        )}
                        {device.network && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 font-display">
                            <Wifi className="w-3 h-3" /> {device.network}
                          </span>
                        )}
                        {device.lat != null && device.lon != null && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground/60 font-display">
                            <MapPin className="w-3 h-3" /> {device.lat.toFixed(3)}, {device.lon.toFixed(3)}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 mt-2">
                        <Clock className="w-2.5 h-2.5 text-muted-foreground/40" />
                        <span className="text-[10px] text-muted-foreground/50 font-display">
                          {new Date(device.last_seen).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); deleteDevice(device.id); }}
                      className="text-muted-foreground hover:text-destructive h-8 w-8 p-0 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
};

export default Devices;
