import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

interface Body { token: string }

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
    const ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
    const SERVICE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const userClient = createClient(SUPABASE_URL, ANON, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { token } = (await req.json()) as Body;
    if (!token || typeof token !== 'string') {
      return new Response(JSON.stringify({ error: 'Missing token' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const admin = createClient(SUPABASE_URL, SERVICE);

    const { data: invite, error: invErr } = await admin
      .from('friend_invitations')
      .select('id, sender_id, recipient_email, status')
      .eq('token', token)
      .maybeSingle();

    if (invErr || !invite) {
      return new Response(JSON.stringify({ error: 'Invitation not found' }), {
        status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userEmail = (user.email ?? '').toLowerCase();
    if (invite.recipient_email.toLowerCase() !== userEmail) {
      return new Response(JSON.stringify({
        error: 'Email mismatch',
        message: `Tato pozvánka byla odeslána na ${invite.recipient_email}. Přihlas se prosím tímto emailem.`,
      }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (invite.sender_id === user.id) {
      return new Response(JSON.stringify({ error: 'Cannot accept own invite' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (invite.status === 'accepted') {
      return new Response(JSON.stringify({ success: true, alreadyAccepted: true }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Mark accepted
    await admin
      .from('friend_invitations')
      .update({ status: 'accepted', updated_at: new Date().toISOString() })
      .eq('id', invite.id);

    // Create friendship (sorted user ids, ignore if already exists)
    const [a, b] = invite.sender_id < user.id
      ? [invite.sender_id, user.id]
      : [user.id, invite.sender_id];

    const { data: existing } = await admin
      .from('friendships')
      .select('id')
      .eq('user_a', a)
      .eq('user_b', b)
      .maybeSingle();

    if (!existing) {
      await admin.from('friendships').insert({ user_a: a, user_b: b, status: 'active' });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('accept-friend-invite error', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
