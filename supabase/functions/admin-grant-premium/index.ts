import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseAdmin = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");
    const token = authHeader.replace("Bearer ", "");

    const { data: userData, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError) throw new Error(`Auth error: ${userError.message}`);
    const callerId = userData.user?.id;
    if (!callerId) throw new Error("No user");

    const { data: isAdmin } = await supabaseAdmin.rpc("has_role", {
      _user_id: callerId,
      _role: "admin",
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 403,
      });
    }

    const body = await req.json();
    const { action, user_id, expires_at, reason, role } = body as {
      action: "grant" | "revoke" | "addAdmin" | "removeAdmin";
      user_id: string;
      expires_at?: string | null;
      reason?: string;
      role?: "admin" | "user";
    };

    if (!user_id || typeof user_id !== "string") {
      return new Response(JSON.stringify({ error: "user_id required" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    if (action === "grant") {
      const { error } = await supabaseAdmin
        .from("premium_grants")
        .upsert({
          user_id,
          granted_by: callerId,
          expires_at: expires_at || null,
          reason: reason || null,
        }, { onConflict: "user_id" });
      if (error) throw error;
    } else if (action === "revoke") {
      const { error } = await supabaseAdmin
        .from("premium_grants")
        .delete()
        .eq("user_id", user_id);
      if (error) throw error;
    } else if (action === "addAdmin") {
      const { error } = await supabaseAdmin
        .from("user_roles")
        .insert({ user_id, role: "admin" });
      if (error && !error.message.includes("duplicate")) throw error;
    } else if (action === "removeAdmin") {
      // Prevent removing yourself
      if (user_id === callerId) {
        return new Response(JSON.stringify({ error: "Cannot remove yourself" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
      }
      const { error } = await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", user_id)
        .eq("role", "admin");
      if (error) throw error;
    } else {
      return new Response(JSON.stringify({ error: "Invalid action" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      });
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
