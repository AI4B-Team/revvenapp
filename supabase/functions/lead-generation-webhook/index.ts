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
    const url = new URL(req.url);
    const contentType = req.headers.get('content-type') || '';
    
    console.log('Request method:', req.method);
    console.log('Content-Type:', contentType);
    console.log('Query params:', Object.fromEntries(url.searchParams));

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this is a file upload from n8n (binary data)
    if (contentType.includes('application/octet-stream') ||
        contentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
        contentType.includes('application/vnd.ms-excel') ||
        contentType.includes('multipart/form-data')) {
      
      console.log('Receiving file from n8n...');
      
      // Get metadata from query params
      const location = url.searchParams.get('location') || 'unknown';
      const platform = url.searchParams.get('platform') || 'unknown';
      const keywords = url.searchParams.get('keywords') || '';
      const numLeads = parseInt(url.searchParams.get('numLeads') || '0');
      const jobId = url.searchParams.get('job_id') || '';
      
      console.log('Metadata:', { location, platform, keywords, numLeads, jobId });

      let fileBytes: Uint8Array;
      let extension = 'xlsx';

      // Handle multipart form data
      if (contentType.includes('multipart/form-data')) {
        const formData = await req.formData();
        const file = formData.get('file') || formData.get('data');
        if (file && file instanceof File) {
          const arrayBuffer = await file.arrayBuffer();
          fileBytes = new Uint8Array(arrayBuffer);
          // Get extension from filename if available
          if (file.name) {
            const ext = file.name.split('.').pop();
            if (ext) extension = ext;
          }
        } else {
          throw new Error('No file found in form data');
        }
      } else {
        // Handle raw binary data
        const arrayBuffer = await req.arrayBuffer();
        fileBytes = new Uint8Array(arrayBuffer);
      }

      if (fileBytes.length === 0) {
        throw new Error('Empty file received');
      }

      console.log('File size:', fileBytes.length, 'bytes');

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `leads-${platform}-${location.replace(/\s+/g, '-')}-${timestamp}.${extension}`;

      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('lead-files')
        .upload(fileName, fileBytes, {
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
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
      console.log('File uploaded:', fileUrl);

      // Save to history table
      const { error: insertError } = await supabase
        .from('lead_generation_history')
        .insert({
          location: location,
          platform: platform,
          keywords: keywords,
          num_leads: numLeads,
          file_name: fileName,
          file_url: fileUrl,
          file_size: fileBytes.length
        });

      if (insertError) {
        console.error('Insert error:', insertError);
      }

      return new Response(
        JSON.stringify({
          success: true,
          fileUrl: fileUrl,
          fileName: fileName,
          fileSize: fileBytes.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle JSON request (forward to external webhook or initial trigger)
    const body = await req.json();
    console.log('JSON body received:', JSON.stringify(body));

    // Check if this is a forward request (has webhookUrl)
    if (body.webhookUrl) {
      const { webhookUrl, payload } = body;

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

      const responseContentType = response.headers.get('content-type') || '';
      console.log('Webhook response content-type:', responseContentType);
      console.log('Webhook response status:', response.status);

      // Check if response is a binary file (xlsx, csv, etc.)
      if (responseContentType.includes('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
          responseContentType.includes('application/octet-stream') ||
          responseContentType.includes('application/vnd.ms-excel') ||
          responseContentType.includes('text/csv')) {
        
        // Get the file as array buffer
        const fileBuffer = await response.arrayBuffer();
        const fileBytes = new Uint8Array(fileBuffer);
        
        // Determine file extension
        let extension = 'xlsx';
        if (responseContentType.includes('text/csv')) {
          extension = 'csv';
        } else if (responseContentType.includes('application/vnd.ms-excel')) {
          extension = 'xls';
        }
        
        // Generate filename
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `leads-${payload.location || 'export'}-${timestamp}.${extension}`;
        
        // Upload to storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('lead-files')
          .upload(fileName, fileBytes, {
            contentType: responseContentType,
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
    }

    // If no webhookUrl, this might be direct file data in JSON
    return new Response(
      JSON.stringify({ error: 'Invalid request format. Expected webhookUrl or file upload.' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
