import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use AI to extract and summarize document content
async function extractWithAI(rawText: string, filename: string): Promise<string> {
  const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
  
  if (!OPENROUTER_API_KEY) {
    console.log('OPENROUTER_API_KEY not available, returning raw text');
    return rawText;
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://lovable.dev',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a document content extractor. Your task is to extract and organize the meaningful text content from a document.
            
INSTRUCTIONS:
1. Extract all meaningful text content from the document
2. Remove any binary garbage, special characters, or formatting artifacts
3. Preserve the original structure and meaning
4. If the content appears to be about a specific topic, clearly identify it
5. Organize the content into clear sections if applicable
6. Return ONLY the extracted text content, no commentary

If the document appears corrupted or unreadable, still try to extract any meaningful text you can find.`
          },
          {
            role: 'user',
            content: `Extract the meaningful content from this document (${filename}):\n\n${rawText.slice(0, 30000)}`
          }
        ],
        temperature: 0.1,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      console.error('AI extraction failed:', response.status);
      return rawText;
    }

    const data = await response.json();
    const extractedContent = data.choices?.[0]?.message?.content;
    
    if (extractedContent && extractedContent.length > 50) {
      console.log(`AI extracted ${extractedContent.length} chars from ${rawText.length} raw chars`);
      return extractedContent;
    }
    
    return rawText;
  } catch (error) {
    console.error('AI extraction error:', error);
    return rawText;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { file, filename, mimeType } = await req.json();
    
    if (!file) {
      throw new Error('No file provided');
    }

    console.log(`Parsing document: ${filename}, mimeType: ${mimeType}`);

    // Decode base64 file
    const binaryString = atob(file);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    let rawContent = '';
    const ext = filename?.split('.').pop()?.toLowerCase() || '';

    if (ext === 'txt') {
      // Plain text - decode directly
      rawContent = new TextDecoder().decode(bytes);
      console.log(`TXT file: ${rawContent.length} chars`);
    } else if (ext === 'pdf') {
      // For PDF, use multiple extraction strategies
      const pdfString = new TextDecoder('latin1').decode(bytes);
      
      // Strategy 1: Extract text between parentheses (PDF text objects)
      const parenMatches = pdfString.match(/\(([^)]{3,})\)/g) || [];
      const parenText = parenMatches
        .map(m => m.slice(1, -1))
        .filter(t => /[a-zA-Z]{2,}/.test(t) && !/^[0-9.]+$/.test(t))
        .join(' ');
      
      // Strategy 2: Extract text between Tj and TJ operators
      const tjMatches = pdfString.match(/\[(.*?)\]\s*TJ/g) || [];
      const tjText = tjMatches
        .map(m => {
          const innerMatches = m.match(/\(([^)]+)\)/g) || [];
          return innerMatches.map(im => im.slice(1, -1)).join('');
        })
        .join(' ');
      
      // Strategy 3: Look for stream content
      const streamMatches = pdfString.match(/stream\s*([\s\S]*?)\s*endstream/g) || [];
      const streamText = streamMatches
        .map(s => s.replace(/stream|endstream/g, ''))
        .join(' ')
        .replace(/[^\x20-\x7E\n]/g, ' ')
        .replace(/\s+/g, ' ');
      
      // Combine all extracted text
      rawContent = [parenText, tjText, streamText]
        .join(' ')
        .replace(/\\n/g, '\n')
        .replace(/\\r/g, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      console.log(`PDF extraction: ${rawContent.length} chars from strategies`);
      
      // If still too short, try extracting readable ASCII
      if (rawContent.length < 200) {
        rawContent = pdfString
          .replace(/[^\x20-\x7E\n]/g, ' ')
          .replace(/\s+/g, ' ')
          .split(' ')
          .filter(word => word.length >= 3 && /^[a-zA-Z]/.test(word))
          .join(' ')
          .trim();
        console.log(`PDF fallback extraction: ${rawContent.length} chars`);
      }
    } else if (ext === 'docx' || ext === 'doc') {
      // For DOCX, it's a ZIP file with XML content
      const docString = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
      
      // Extract text from Word XML tags
      const textMatches = docString.match(/<w:t[^>]*>([^<]+)<\/w:t>/g) || [];
      rawContent = textMatches
        .map(m => m.replace(/<[^>]+>/g, ''))
        .join(' ')
        .trim();
      
      console.log(`DOCX XML extraction: ${rawContent.length} chars`);
      
      // Fallback: extract readable text
      if (rawContent.length < 100) {
        rawContent = docString
          .replace(/<[^>]+>/g, ' ')
          .replace(/[^\x20-\x7E\n]/g, ' ')
          .replace(/\s+/g, ' ')
          .split(' ')
          .filter(word => word.length >= 3 && /^[a-zA-Z]/.test(word))
          .join(' ')
          .trim();
        console.log(`DOCX fallback extraction: ${rawContent.length} chars`);
      }
    }

    if (!rawContent || rawContent.length < 10) {
      throw new Error('Could not extract meaningful content from the document. The file may be encrypted, image-based, or in an unsupported format.');
    }

    // Use AI to clean up and extract meaningful content
    const content = await extractWithAI(rawContent, filename);

    console.log(`Final content length: ${content.length} chars`);
    console.log(`Content preview: ${content.slice(0, 200)}...`);

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
