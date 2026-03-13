
-- Devices table: core device registry
CREATE TABLE public.devices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  device_id TEXT NOT NULL,
  battery TEXT,
  charging TEXT,
  platform TEXT,
  model TEXT DEFAULT 'Unknown',
  network TEXT DEFAULT 'Unknown',
  lat DOUBLE PRECISION,
  lon DOUBLE PRECISION,
  status TEXT DEFAULT 'offline' CHECK (status IN ('online', 'offline')),
  last_seen TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, device_id)
);

-- Movement trails
CREATE TABLE public.trails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- SMS/Notification logs
CREATE TABLE public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT DEFAULT 'SMS/Notification',
  sender TEXT,
  message TEXT,
  recorded_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_trails_device_time ON public.trails(device_id, recorded_at);
CREATE INDEX idx_logs_device_time ON public.notification_logs(device_id, recorded_at);
CREATE INDEX idx_devices_user ON public.devices(user_id);

-- RLS
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trails ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;

-- Devices policies
CREATE POLICY "Users can view own devices" ON public.devices FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own devices" ON public.devices FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own devices" ON public.devices FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own devices" ON public.devices FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Trails policies
CREATE POLICY "Users can view own trails" ON public.trails FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trails" ON public.trails FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Notification logs policies
CREATE POLICY "Users can view own logs" ON public.notification_logs FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own logs" ON public.notification_logs FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Enable realtime for devices table
ALTER PUBLICATION supabase_realtime ADD TABLE public.devices;
