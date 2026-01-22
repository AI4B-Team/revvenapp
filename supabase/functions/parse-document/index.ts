import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Use Lovable AI Gateway with multimodal capability for document extraction
async function extractWithAI(fileBase64: string, filename: string, mimeType: string): Promise<string> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY not available');
    throw new Error('AI service not configured');
  }

  // Try with the best model first for complex documents
  const models = ['google/gemini-2.5-pro', 'google/gemini-2.5-flash'];
  
  for (const model of models) {
    try {
      console.log(`Attempting extraction with ${model} for ${filename}`);
      
      const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `You are an expert document content extractor. Your task is to extract ALL text content from this document (${filename}).

CRITICAL INSTRUCTIONS:
1. Extract EVERY piece of readable text from the document
2. For CVs/Resumes, extract:
   - Full name and contact details (email, phone, LinkedIn, address)
   - Professional summary/objective
   - Work experience with company names, job titles, dates, and bullet points
   - Education with degrees, institutions, and dates
   - Skills (technical and soft skills)
   - Certifications, languages, projects, achievements
3. For other documents, preserve:
   - All headings and subheadings
   - Body text and paragraphs
   - Lists and bullet points
   - Tables (format as readable text)
   - Key data, dates, names, figures
4. Maintain logical structure and reading order
5. Do NOT include:
   - PDF metadata or technical artifacts
   - Binary/encoded content
   - Page numbers or headers/footers unless meaningful
6. Return ONLY the extracted text content, clean and well-formatted
7. If you cannot read certain parts, skip them silently

Extract the complete document content now:`
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
        console.error(`${model} extraction failed:`, response.status, errorText);
        
        // If rate limited or payment required, don't retry with other models
        if (response.status === 429 || response.status === 402) {
          throw new Error(response.status === 429 ? 'Rate limit exceeded' : 'Payment required');
        }
        continue; // Try next model
      }

      const data = await response.json();
      const extractedContent = data.choices?.[0]?.message?.content;
      
      if (extractedContent && extractedContent.length > 100) {
        // Clean the output - remove any PDF artifacts that might have slipped through
        const cleanedContent = cleanExtractedContent(extractedContent);
        if (cleanedContent.length > 50) {
          console.log(`Successfully extracted ${cleanedContent.length} chars with ${model}`);
          return cleanedContent;
        }
      }
      
      console.log(`${model} returned insufficient content, trying next model`);
    } catch (error) {
      console.error(`Error with ${model}:`, error);
      if (error instanceof Error && (error.message.includes('Rate limit') || error.message.includes('Payment'))) {
        throw error;
      }
    }
  }
  
  throw new Error('AI extraction failed with all models');
}

// Clean extracted content - remove PDF artifacts and structure noise
function cleanExtractedContent(content: string): string {
  // Remove common PDF internal structure patterns
  const pdfPatterns = [
    /<<\s*\/[^>]+>>/g,                    // PDF dictionaries
    /\/[A-Z][a-zA-Z]+\s+\d+\s+\d+\s+R/g,  // PDF references
    /\d+\s+\d+\s+obj[\s\S]*?endobj/g,     // PDF objects
    /stream[\s\S]*?endstream/g,            // PDF streams
    /xref[\s\S]*?startxref/g,              // PDF cross-reference
    /%%EOF/g,                              // PDF end marker
    /\/Type\s*\/[A-Za-z]+/g,              // PDF type declarations
    /\/Font\s*<<[^>]*>>/g,                // Font definitions
    /\/Encoding\s*\/[A-Za-z]+/g,          // Encoding declarations
    /\/BaseFont\s*\/[A-Za-z+\-]+/g,       // BaseFont declarations
    /\/FontDescriptor\s*\d+\s*\d+\s*R/g,  // Font descriptors
    /\[\s*\d+\s+\d+\s+R\s*\]/g,           // Reference arrays
    /\/Resources\s*\d+\s*\d+\s*R/g,       // Resource references
    /\/MediaBox\s*\[[^\]]+\]/g,           // MediaBox definitions
    /\/Contents\s*\d+\s*\d+\s*R/g,        // Content references
    /trailer[\s\S]*$/g,                    // PDF trailer
  ];
  
  let cleaned = content;
  for (const pattern of pdfPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }
  
  // Remove lines that look like binary/encoded data
  cleaned = cleaned.split('\n')
    .filter(line => {
      const trimmed = line.trim();
      // Skip lines that are mostly non-alphabetic characters
      const alphaRatio = (trimmed.match(/[a-zA-Z]/g) || []).length / Math.max(trimmed.length, 1);
      // Skip very short random character sequences
      if (trimmed.length < 20 && alphaRatio < 0.5) return false;
      // Skip lines that look like hex/binary
      if (/^[0-9a-fA-F\s]+$/.test(trimmed) && trimmed.length > 10) return false;
      // Skip PDF operators
      if (/^(BT|ET|Tj|TJ|Tm|Td|TD|Tf|cm|q|Q|re|f|S|W|n)\s*$/.test(trimmed)) return false;
      return true;
    })
    .join('\n');
  
  // Clean up excessive whitespace
  cleaned = cleaned
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .trim();
  
  return cleaned;
}

// Legacy fallback - only used if AI completely fails
function extractTextFromPDFFallback(fileBase64: string): string {
  try {
    const binaryString = atob(fileBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const pdfString = new TextDecoder('latin1').decode(bytes);
    
    // Extract text between parentheses (PDF text objects)
    const textParts: string[] = [];
    const parenMatches = pdfString.match(/\(([^)]{3,})\)/g) || [];
    
    for (const match of parenMatches) {
      let text = match.slice(1, -1);
      // Decode PDF escape sequences
      text = text.replace(/\\([0-9]{3})/g, (_, oct) => String.fromCharCode(parseInt(oct, 8)));
      text = text.replace(/\\n/g, '\n').replace(/\\r/g, '').replace(/\\t/g, ' ');
      
      // Only keep if it looks like real text (has letters, not just symbols)
      if (/[a-zA-Z]{2,}/.test(text) && !/^[0-9.]+$/.test(text)) {
        textParts.push(text);
      }
    }
    
    const result = textParts.join(' ').replace(/\s+/g, ' ').trim();
    
    if (result.length < 50) {
      return 'Unable to extract text from this PDF. The document may be image-based or encrypted.';
    }
    
    return cleanExtractedContent(result);
  } catch (error) {
    console.error('Fallback extraction failed:', error);
    return 'Unable to extract text from this PDF.';
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
      // Use AI for document understanding (multimodal - can "see" the document)
      try {
        content = await extractWithAI(file, filename, mimeType);
      } catch (aiError) {
        console.error('AI extraction failed:', aiError);
        
        // For PDFs, try legacy fallback
        if (ext === 'pdf') {
          console.log('Attempting legacy PDF text extraction');
          content = extractTextFromPDFFallback(file);
        } else {
          throw new Error(`Could not extract content from ${ext.toUpperCase()} file. Please try a PDF or TXT file.`);
        }
      }
    } else {
      // Try AI extraction for other formats
      try {
        content = await extractWithAI(file, filename, mimeType);
      } catch {
        throw new Error(`Unsupported file format: ${ext}. Supported formats: PDF, DOCX, TXT, MD`);
      }
    }

    if (!content || content.length < 10) {
      throw new Error('Could not extract meaningful content. The file may be encrypted, image-based without OCR text, or in an unsupported format.');
    }

    console.log(`Final content length: ${content.length} chars`);
    console.log(`Content preview: ${content.slice(0, 300)}...`);

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
