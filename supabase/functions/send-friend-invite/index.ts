import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2.45.0';

const GATEWAY_URL = 'https://connector-gateway.lovable.dev/resend';
const FROM = 'MyAddiction <hello@myaddiction.space>';
const APP_URL = 'https://myaddiction.space/app';

interface InviteBody {
  recipientEmail: string;
  invitationId?: string;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderEmail(senderName: string): { html: string; text: string; subject: string } {
  const safeName = escapeHtml(senderName);
  const subject = `${senderName} tě zve do svého kruhu na MyAddiction`;
  const html = `<!DOCTYPE html>
<html lang="cs">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f5f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#0f2a2e;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7f7;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 12px rgba(15,42,46,0.06);">
        <tr><td style="background:#0f4f54;padding:32px 32px 24px;text-align:center;">
          <div style="color:#ffffff;font-size:14px;letter-spacing:2px;text-transform:uppercase;opacity:0.7;">MyAddiction</div>
          <h1 style="color:#ffffff;font-size:24px;font-weight:600;margin:12px 0 0;line-height:1.3;">Tvůj kruh tě zve</h1>
        </td></tr>
        <tr><td style="padding:32px;">
          <p style="font-size:16px;line-height:1.6;margin:0 0 16px;color:#0f2a2e;">
            <strong>${safeName}</strong> tě zve, aby ses připojil/a do jejich soukromého kruhu podpory na MyAddiction.
          </p>
          <p style="font-size:15px;line-height:1.6;margin:0 0 24px;color:#4a6568;">
            MyAddiction je aplikace, která pomáhá zvládat závislosti — den po dni. Kruh slouží jako tichá podpora od lidí, kterým věříš.
          </p>
          <div style="text-align:center;margin:32px 0 16px;">
            <a href="${APP_URL}" style="display:inline-block;background:#0f4f54;color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:10px;font-weight:600;font-size:15px;">Otevřít MyAddiction</a>
          </div>
          <p style="font-size:12px;line-height:1.5;margin:0 0 16px;color:#8a9a9c;text-align:center;">
            nebo zkopíruj odkaz: <a href="${APP_URL}" style="color:#0f4f54;text-decoration:underline;">${APP_URL}</a>
          </p>
          <div style="background:#f0f5f5;border-radius:10px;padding:16px 18px;margin:24px 0 0;">
            <div style="font-size:13px;font-weight:600;color:#0f4f54;margin:0 0 6px;">Tvé soukromí je chráněno</div>
            <div style="font-size:13px;line-height:1.5;color:#4a6568;">Uvidíš jen to, co se ${safeName} rozhodne sdílet — typ závislosti a počet dní bez. Žádné citlivé detaily.</div>
          </div>
          <p style="font-size:13px;line-height:1.5;margin:24px 0 0;color:#8a9a9c;">
            Pokud aplikaci ještě nemáš, stačí se přihlásit stejným emailem (${escapeHtml(FROM)}) — pozvánka tě bude čekat.
          </p>
        </td></tr>
        <tr><td style="background:#fafbfb;padding:20px 32px;text-align:center;font-size:12px;color:#8a9a9c;border-top:1px solid #eef2f2;">
          Tento email ti přišel, protože tě někdo pozval do MyAddiction.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
  const text = `${senderName} tě zve do svého kruhu na MyAddiction.\n\nOtevři aplikaci: ${APP_URL}\n\nUvidíš jen to, co se ${senderName} rozhodne sdílet — typ závislosti a počet dní bez.`;
  return { html, text, subject };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');
    if (!RESEND_API_KEY) throw new Error('RESEND_API_KEY not configured');

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = (await req.json()) as InviteBody;
    const recipient = (body.recipientEmail ?? '').trim().toLowerCase();
    if (!recipient || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient) || recipient.length > 255) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: profile } = await supabase
      .from('profiles').select('display_name').eq('user_id', user.id).maybeSingle();
    const senderName = profile?.display_name?.trim() || user.email?.split('@')[0] || 'Někdo';

    const { html, text, subject } = renderEmail(senderName);

    const resp = await fetch(`${GATEWAY_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'X-Connection-Api-Key': RESEND_API_KEY,
      },
      body: JSON.stringify({ from: FROM, to: [recipient], subject, html, text }),
    });

    const data = await resp.json();
    if (!resp.ok) {
      console.error('Resend error', resp.status, data);
      return new Response(JSON.stringify({ error: 'Send failed', details: data }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('send-friend-invite error', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
