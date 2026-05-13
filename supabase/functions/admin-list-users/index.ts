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

    // Verify admin
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

    // List users (admin API)
    const { data: usersList, error: listError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 200,
    });
    if (listError) throw listError;

    const userIds = usersList.users.map((u) => u.id);

    const [{ data: profiles }, { data: grants }, { data: roles }] = await Promise.all([
      supabaseAdmin.from("profiles").select("user_id, display_name").in("user_id", userIds),
      supabaseAdmin.from("premium_grants").select("user_id, expires_at, reason").in("user_id", userIds),
      supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", userIds),
    ]);

    const profileMap = new Map((profiles || []).map((p) => [p.user_id, p]));
    const grantMap = new Map((grants || []).map((g) => [g.user_id, g]));
    const rolesMap = new Map<string, string[]>();
    (roles || []).forEach((r) => {
      const arr = rolesMap.get(r.user_id) || [];
      arr.push(r.role);
      rolesMap.set(r.user_id, arr);
    });

    const enriched = usersList.users.map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
      display_name: profileMap.get(u.id)?.display_name || null,
      roles: rolesMap.get(u.id) || [],
      grant: grantMap.get(u.id) || null,
    }));

    return new Response(JSON.stringify({ users: enriched }), {
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
