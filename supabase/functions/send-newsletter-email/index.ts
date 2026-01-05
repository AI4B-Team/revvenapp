import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUBSCRIBE_WEBHOOK_URL = "https://realcreator.app.n8n.cloud/webhook-test/5ec8dcf6-b2ba-4fb3-bf62-d253d2f39f02";
const UNSUBSCRIBE_WEBHOOK_URL = "https://realcreator.app.n8n.cloud/webhook-test/709bb303-2c56-456a-b039-db5254c14328";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, type } = await req.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: 'Email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Choose webhook based on type
    const webhookUrl = type === 'unsubscribe' ? UNSUBSCRIBE_WEBHOOK_URL : SUBSCRIBE_WEBHOOK_URL;
    
    console.log(`Sending ${type || 'subscribe'} request for ${email} via n8n webhook`);

    // Send to n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        name: name || '',
        type: type || 'subscribe',
        timestamp: new Date().toISOString(),
        source: 'revven-newsletter',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('n8n webhook error:', errorText);
      throw new Error(`n8n webhook failed: ${response.status}`);
    }

    const result = await response.text();
    console.log('n8n webhook response:', result);

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error sending newsletter email:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to send email';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
