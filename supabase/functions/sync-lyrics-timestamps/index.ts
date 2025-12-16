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
    const { audioUrl, lyrics } = await req.json();
    
    if (!audioUrl) {
      throw new Error('Audio URL is required');
    }

    const ELEVENLABS_API_KEY = Deno.env.get('ELEVENLABS_API_KEY');
    if (!ELEVENLABS_API_KEY) {
      throw new Error('ELEVENLABS_API_KEY is not configured');
    }

    console.log('Fetching audio from URL:', audioUrl);

    // Fetch the audio file
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio: ${audioResponse.status}`);
    }
    
    const audioBlob = await audioResponse.blob();
    console.log('Audio fetched, size:', audioBlob.size);

    // Create form data for ElevenLabs STT
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.mp3');
    formData.append('model_id', 'scribe_v1');
    formData.append('timestamps_granularity', 'word');

    console.log('Sending to ElevenLabs STT...');

    // Call ElevenLabs Speech-to-Text API
    const sttResponse = await fetch('https://api.elevenlabs.io/v1/speech-to-text', {
      method: 'POST',
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!sttResponse.ok) {
      const errorText = await sttResponse.text();
      console.error('ElevenLabs STT error:', errorText);
      throw new Error(`ElevenLabs STT failed: ${sttResponse.status}`);
    }

    const sttResult = await sttResponse.json();
    console.log('STT result received, words:', sttResult.words?.length || 0);

    // Parse lyrics sections
    const sectionHeaders = [
      '🎵 Song Title:', 'Song Title:',
      'Verse 1', 'Verse 2', 'Verse 3',
      'Pre-Chorus', 'Chorus', 'Bridge',
      'Final Chorus', 'Outro', 'Intro'
    ];

    const sections: { type: string; lines: string[]; timestamp?: number }[] = [];
    let currentSection = { type: '', lines: [] as string[] };
    
    if (lyrics) {
      const lines = lyrics.split('\n');
      lines.forEach((line: string) => {
        const trimmedLine = line.trim();
        const isHeader = sectionHeaders.some(header => 
          trimmedLine.toLowerCase().startsWith(header.toLowerCase())
        );
        
        if (isHeader) {
          if (currentSection.type || currentSection.lines.length > 0) {
            sections.push({ ...currentSection });
          }
          currentSection = { type: trimmedLine, lines: [] };
        } else if (trimmedLine) {
          currentSection.lines.push(trimmedLine);
        }
      });
      
      if (currentSection.type || currentSection.lines.length > 0) {
        sections.push(currentSection);
      }
    }

    // Match transcribed words to lyrics sections to get timestamps
    const words = sttResult.words || [];
    const timestampedSections = sections.map((section, index) => {
      // Try to find the first word of this section's first line in the transcription
      const firstLine = section.lines[0]?.toLowerCase() || '';
      const firstWords = firstLine.split(' ').slice(0, 3).join(' ');
      
      let timestamp = null;
      
      // Search through transcribed words to find a match
      for (let i = 0; i < words.length - 2; i++) {
        const transcriptSegment = words.slice(i, i + 3)
          .map((w: any) => w.text?.toLowerCase() || '')
          .join(' ');
        
        if (firstWords && transcriptSegment.includes(firstWords.slice(0, 10))) {
          timestamp = words[i].start || null;
          break;
        }
      }
      
      // If no match found, estimate based on position
      if (timestamp === null && sttResult.audio?.duration) {
        const duration = sttResult.audio.duration;
        const sectionCount = sections.filter(s => s.type).length || 1;
        const sectionIndex = sections.slice(0, index).filter(s => s.type).length;
        timestamp = sectionCount > 1 
          ? (sectionIndex / (sectionCount - 1)) * duration 
          : 0;
      }
      
      return {
        ...section,
        timestamp: timestamp !== null ? Math.round(timestamp * 10) / 10 : null
      };
    });

    console.log('Sections with timestamps:', timestampedSections.length);

    return new Response(JSON.stringify({ 
      success: true,
      sections: timestampedSections,
      transcript: sttResult.text,
      duration: sttResult.audio?.duration
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Lyrics sync error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
