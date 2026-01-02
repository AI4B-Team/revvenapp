import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { webhookUrl, payload } = await req.json();

    if (!webhookUrl) {
      return new Response(
        JSON.stringify({ error: 'Webhook URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Forwarding to webhook:', webhookUrl);
    console.log('Payload:', JSON.stringify(payload));

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const contentType = response.headers.get('content-type') || '';
    console.log('Webhook response content-type:', contentType);
    console.log('Webhook response status:', response.status);

    // Check if response is a binary file (xlsx, csv, etc.)
    if (contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
        contentType.includes('application/octet-stream') ||
        contentType.includes('application/vnd.ms-excel') ||
        contentType.includes('text/csv')) {
      
      // Get the file as array buffer
      const fileBuffer = await response.arrayBuffer();
      const fileBytes = new Uint8Array(fileBuffer);
      
      // Determine file extension
      let extension = 'xlsx';
      if (contentType.includes('text/csv')) {
        extension = 'csv';
      } else if (contentType.includes('application/vnd.ms-excel')) {
        extension = 'xls';
      }
      
      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `leads-${payload.location || 'export'}-${timestamp}.${extension}`;
      
      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lead-files')
        .upload(fileName, fileBytes, {
          contentType: contentType,
          upsert: true
        });
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw new Error(`Failed to upload file: ${uploadError.message}`);
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('lead-files')
        .getPublicUrl(fileName);
      
      const fileUrl = urlData.publicUrl;
      
      // Save to history table
      const { error: insertError } = await supabase
        .from('lead_generation_history')
        .insert({
          location: payload.location || '',
          platform: payload.platform || '',
          keywords: payload.keywords || '',
          num_leads: payload.numLeads || 0,
          file_name: fileName,
          file_url: fileUrl,
          file_size: fileBytes.length
        });
      
      if (insertError) {
        console.error('Insert error:', insertError);
      }
      
      console.log('File uploaded successfully:', fileUrl);
      
      return new Response(
        JSON.stringify({ 
          success: true, 
          status: response.status,
          fileUrl: fileUrl,
          fileName: fileName,
          fileSize: fileBytes.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle regular JSON/text response
    const responseText = await response.text();
    console.log('Webhook response:', response.status, responseText);

    return new Response(
      JSON.stringify({ success: true, status: response.status, response: responseText }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    console.error('Error forwarding to webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
