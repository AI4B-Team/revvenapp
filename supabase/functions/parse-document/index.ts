import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use Lovable AI Gateway to extract document content with multimodal capability
async function extractWithAI(fileBase64: string, filename: string, mimeType: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY not available');
    throw new Error('AI service not configured');
  }

  try {
    console.log(`Using Lovable AI to extract content from ${filename}`);
    
    // Use multimodal model to directly understand the document
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `You are a document content extractor. Extract ALL the meaningful text content from this document (${filename}).

INSTRUCTIONS:
1. Extract ALL text content from the document - do not skip anything
2. Preserve the document structure (headings, sections, lists, etc.)
3. Include ALL details: names, dates, contact information, job titles, skills, education, experience, etc.
4. If it's a resume/CV, extract: full name, contact info, summary, work experience with dates and descriptions, education, skills, certifications, etc.
5. If it's a business document, extract: title, sections, key points, data, conclusions
6. Return ONLY the extracted text content formatted clearly, no commentary about the extraction process
7. Be thorough - the user needs this content to create social media posts about it

Return the complete extracted content:`
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:${mimeType};base64,${fileBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Lovable AI extraction failed:', response.status, errorText);
      
      // Fall back to text extraction for PDFs
      if (mimeType === 'application/pdf') {
        console.log('Falling back to text extraction for PDF');
        return await extractTextFromPDF(fileBase64);
      }
      
      throw new Error(`AI extraction failed: ${response.status}`);
    }

    const data = await response.json();
    const extractedContent = data.choices?.[0]?.message?.content;
    
    if (extractedContent && extractedContent.length > 50) {
      console.log(`AI extracted ${extractedContent.length} chars from document`);
      return extractedContent;
    }
    
    throw new Error('AI extraction returned insufficient content');
  } catch (error) {
    console.error('AI extraction error:', error);
    
    // Fall back to text extraction for PDFs
    if (mimeType === 'application/pdf') {
      console.log('Falling back to text extraction for PDF due to error');
      return await extractTextFromPDF(fileBase64);
    }
    
    throw error;
  }
}

// Fallback: Extract text from PDF using multiple strategies
async function extractTextFromPDF(fileBase64: string): Promise<string> {
  const binaryString = atob(fileBase64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const pdfString = new TextDecoder('latin1').decode(bytes);
  
  // Strategy 1: Extract text between parentheses (PDF text objects)
  const parenMatches = pdfString.match(/\(([^)]{2,})\)/g) || [];
  const parenText = parenMatches
    .map(m => m.slice(1, -1))
    .filter(t => /[a-zA-Z]{2,}/.test(t) && !/^[0-9.]+$/.test(t))
    .map(t => t.replace(/\\([0-9]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8))))
    .join(' ');
  
  // Strategy 2: Extract text between Tj and TJ operators
  const tjMatches = pdfString.match(/\[(.*?)\]\s*TJ/g) || [];
  const tjText = tjMatches
    .map(m => {
      const innerMatches = m.match(/\(([^)]+)\)/g) || [];
      return innerMatches.map(im => im.slice(1, -1)).join('');
    })
    .join(' ');
  
  // Strategy 3: Look for BT/ET text blocks
  const btMatches = pdfString.match(/BT[\s\S]*?ET/g) || [];
  const btText = btMatches
    .map(block => {
      const textParts = block.match(/\(([^)]+)\)/g) || [];
      return textParts.map(p => p.slice(1, -1)).join(' ');
    })
    .join(' ');
  
  // Combine all extracted text
  let rawContent = [parenText, tjText, btText]
    .join(' ')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\t/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  console.log(`PDF text extraction: ${rawContent.length} chars`);
  
  if (rawContent.length < 100) {
    // Last resort: extract any readable ASCII
    rawContent = pdfString
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter(word => word.length >= 3 && /^[a-zA-Z]/.test(word))
      .join(' ')
      .trim();
    console.log(`PDF fallback extraction: ${rawContent.length} chars`);
  }
  
  return rawContent;
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

    const ext = filename?.split('.').pop()?.toLowerCase() || '';
    let content = '';

    if (ext === 'txt' || ext === 'md') {
      // Plain text - decode directly
      const binaryString = atob(file);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      content = new TextDecoder().decode(bytes);
      console.log(`TXT file: ${content.length} chars`);
    } else if (ext === 'pdf' || ext === 'docx' || ext === 'doc') {
      // Use AI for document understanding
      content = await extractWithAI(file, filename, mimeType);
    } else {
      // Try AI extraction for other formats
      try {
        content = await extractWithAI(file, filename, mimeType);
      } catch {
        throw new Error(`Unsupported file format: ${ext}`);
      }
    }

    if (!content || content.length < 10) {
      throw new Error('Could not extract meaningful content from the document. The file may be encrypted, image-based, or in an unsupported format.');
    }

    console.log(`Final content length: ${content.length} chars`);
    console.log(`Content preview: ${content.slice(0, 500)}...`);

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
