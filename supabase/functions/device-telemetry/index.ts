import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Authenticate the user from the Authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "No authorization header" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (req.method === "POST" && action === "telemetry") {
      const data = await req.json();
      const deviceId = data.device_id;
      if (!deviceId) {
        return new Response(JSON.stringify({ error: "device_id required" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Upsert device
      const { error: deviceError } = await supabase
        .from("devices")
        .upsert(
          {
            user_id: user.id,
            device_id: deviceId,
            battery: data.battery || null,
            charging: data.charging || null,
            platform: data.platform || null,
            model: data.model || "Unknown",
            network: data.network || "Unknown",
            lat: data.lat || null,
            lon: data.lon || null,
            status: "online",
            last_seen: new Date().toISOString(),
          },
          { onConflict: "user_id,device_id" }
        );

      if (deviceError) throw deviceError;

      // Log trail if coordinates present
      if (data.lat != null && data.lon != null) {
        await supabase.from("trails").insert({
          device_id: deviceId,
          user_id: user.id,
          lat: data.lat,
          lon: data.lon,
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "notification") {
      const data = await req.json();
      const { error } = await supabase.from("notification_logs").insert({
        device_id: data.device_id,
        user_id: user.id,
        type: data.type || "SMS/Notification",
        sender: data.sender || data.title,
        message: data.message || data.body,
      });
      if (error) throw error;

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && action === "snapshot") {
      const data = await req.json();
      const deviceId = data.device_id || "unknown";
      const imageData = data.image;

      if (!imageData) {
        return new Response(JSON.stringify({ error: "No image data" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Store snapshot in storage bucket
      const base64Data = imageData.includes(",") ? imageData.split(",")[1] : imageData;
      const binaryData = Uint8Array.from(atob(base64Data), (c) => c.charCodeAt(0));
      const filename = `${user.id}/${deviceId}/snap_${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("media-scans")
        .upload(filename, binaryData, { contentType: "image/jpeg" });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from("media-scans").getPublicUrl(filename);

      return new Response(
        JSON.stringify({ success: true, url: urlData.publicUrl }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
