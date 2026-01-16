import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file, filename, mimeType } = await req.json();
    
    if (!file) {
      throw new Error('No file provided');
    }

    // Decode base64 file
    const binaryString = atob(file);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    let content = '';
    const ext = filename?.split('.').pop()?.toLowerCase() || '';

    if (ext === 'txt') {
      // Plain text - decode directly
      content = new TextDecoder().decode(bytes);
    } else if (ext === 'pdf') {
      // For PDF, use a simple text extraction approach
      // Convert bytes to string and look for text streams
      const pdfString = new TextDecoder('latin1').decode(bytes);
      
      // Extract text between BT and ET markers (basic PDF text extraction)
      const textMatches = pdfString.match(/\(([^)]+)\)/g) || [];
      content = textMatches
        .map(m => m.slice(1, -1))
        .filter(t => t.length > 2 && /[a-zA-Z]/.test(t))
        .join(' ')
        .replace(/\\n/g, '\n')
        .replace(/\s+/g, ' ')
        .trim();
      
      // If basic extraction fails, try to find readable text patterns
      if (content.length < 100) {
        const readableText = pdfString
          .replace(/[^\x20-\x7E\n]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        content = readableText.slice(0, 50000);
      }
    } else if (ext === 'docx' || ext === 'doc') {
      // For DOCX, it's a ZIP file with XML content
      // Try to extract text from the raw bytes
      const docString = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      
      // Look for text content in XML tags
      const textMatches = docString.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
      content = textMatches
        .map(m => m.replace(/<[^>]+>/g, ''))
        .join(' ')
        .trim();
      
      // Fallback: extract readable text
      if (content.length < 100) {
        content = docString
          .replace(/<[^>]+>/g, ' ')
          .replace(/[^\x20-\x7E\n]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 50000);
      }
    }

    if (!content || content.length < 10) {
      throw new Error('Could not extract meaningful content from the document');
    }

    return new Response(
      JSON.stringify({ success: true, content: content.slice(0, 50000) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error parsing document:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
