import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { pdfBase64, fileName } = await req.json();

    if (!pdfBase64) {
      return new Response(
        JSON.stringify({ error: 'No PDF data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Parsing PDF: ${fileName}`);

    // Decode base64 to binary
    const binaryString = atob(pdfBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Extract text from PDF using basic parsing
    // PDFs store text in streams between BT (begin text) and ET (end text) markers
    const pdfText = new TextDecoder('utf-8', { fatal: false }).decode(bytes);
    
    let extractedText = '';
    
    // Method 1: Extract text from PDF streams
    // Look for text between parentheses in Tj/TJ operators
    const textPatterns = [
      /\(([^)]+)\)\s*Tj/g,  // Single text strings
      /\[([^\]]+)\]\s*TJ/g, // Text arrays
    ];
    
    for (const pattern of textPatterns) {
      let match;
      while ((match = pattern.exec(pdfText)) !== null) {
        let text = match[1];
        // Clean up escape sequences
        text = text.replace(/\\n/g, '\n')
                   .replace(/\\r/g, '')
                   .replace(/\\t/g, ' ')
                   .replace(/\\\(/g, '(')
                   .replace(/\\\)/g, ')')
                   .replace(/\\\\/g, '\\');
        extractedText += text + ' ';
      }
    }

    // Method 2: Look for readable ASCII text sequences
    if (extractedText.trim().length < 100) {
      const lines: string[] = [];
      let currentLine = '';
      
      for (let i = 0; i < bytes.length; i++) {
        const byte = bytes[i];
        // Check for printable ASCII characters
        if (byte >= 32 && byte <= 126) {
          currentLine += String.fromCharCode(byte);
        } else if (byte === 10 || byte === 13) {
          if (currentLine.trim().length > 3) {
            lines.push(currentLine.trim());
          }
          currentLine = '';
        } else {
          if (currentLine.trim().length > 3) {
            lines.push(currentLine.trim());
          }
          currentLine = '';
        }
      }
      
      // Filter out PDF structure commands and keep actual content
      const filteredLines = lines.filter(line => {
        // Skip PDF internal commands and binary artifacts
        const skipPatterns = [
          /^%PDF/,
          /^%%EOF/,
          /^\d+\s+\d+\s+obj/,
          /^endobj/,
          /^endstream/,
          /^stream$/,
          /^xref$/,
          /^trailer$/,
          /^startxref$/,
          /^\/\w+/,
          /^\[.*\]$/,
          /^<<.*>>$/,
          /^\d+$/,
          /^[A-Za-z]{1,2}$/,
        ];
        
        return !skipPatterns.some(p => p.test(line)) && 
               line.length > 2 &&
               !/^[\W\d\s]+$/.test(line); // Skip lines with only symbols/numbers
      });
      
      if (filteredLines.length > 0) {
        extractedText = filteredLines.join('\n');
      }
    }

    // Clean up the extracted text
    extractedText = extractedText
      .replace(/\s+/g, ' ')
      .replace(/\n\s*\n/g, '\n\n')
      .trim();

    // If extraction is minimal, provide a fallback message
    if (extractedText.length < 50) {
      console.log('Basic extraction yielded limited text, PDF may need OCR or is image-based');
      extractedText = `[Content from ${fileName}]\n\nNote: This PDF appears to be image-based or has complex formatting. The extracted text may be limited. For best results, consider converting to a text file or copying the content manually.\n\nExtracted content:\n${extractedText || '(No extractable text found)'}`;
    }

    console.log(`Extracted ${extractedText.length} characters from PDF`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        text: extractedText,
        charCount: extractedText.length,
        fileName 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error parsing PDF:', errorMessage);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to parse PDF', 
        details: errorMessage 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
