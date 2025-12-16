import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Normalize text for comparison (remove punctuation, lowercase, trim)
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// Find the best matching timestamp for a lyrics line in the transcription
function findTimestampForLine(line: string, words: any[], usedIndices: Set<number>): number | null {
  const normalizedLine = normalizeText(line);
  const lineWords = normalizedLine.split(' ').filter(w => w.length > 2); // Skip short words
  
  if (lineWords.length === 0) return null;
  
  // Take first 2-4 significant words from the line
  const searchWords = lineWords.slice(0, Math.min(4, lineWords.length));
  
  let bestMatch = { index: -1, score: 0, timestamp: null as number | null };
  
  // Slide through transcript words looking for matches
  for (let i = 0; i < words.length - searchWords.length; i++) {
    if (usedIndices.has(i)) continue;
    
    let matchScore = 0;
    for (let j = 0; j < searchWords.length; j++) {
      const transcriptWord = normalizeText(words[i + j]?.text || '');
      if (transcriptWord === searchWords[j]) {
        matchScore++;
      } else if (transcriptWord.includes(searchWords[j]) || searchWords[j].includes(transcriptWord)) {
        matchScore += 0.5;
      }
    }
    
    const scorePercent = matchScore / searchWords.length;
    if (scorePercent > bestMatch.score && scorePercent >= 0.5) {
      bestMatch = {
        index: i,
        score: scorePercent,
        timestamp: words[i]?.start || null
      };
    }
  }
  
  if (bestMatch.index >= 0) {
    // Mark these indices as used to maintain order
    for (let k = bestMatch.index; k < bestMatch.index + searchWords.length; k++) {
      usedIndices.add(k);
    }
  }
  
  return bestMatch.timestamp;
}

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
    const words = sttResult.words || [];
    const audioDuration = sttResult.audio?.duration || 180;
    
    console.log('STT result received, words:', words.length, 'duration:', audioDuration);

    // Parse lyrics sections
    const sectionHeaders = [
      '🎵 Song Title:', 'Song Title:',
      'Verse 1', 'Verse 2', 'Verse 3', 'Verse 4',
      'Pre-Chorus', 'Chorus', 'Bridge',
      'Final Chorus', 'Outro', 'Intro'
    ];

    const sections: { type: string; lines: string[]; timestamp?: number | null }[] = [];
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

    // Track used word indices to maintain temporal order
    const usedIndices = new Set<number>();
    
    // Match each section to timestamps
    const timestampedSections = sections.map((section, index) => {
      let timestamp: number | null = null;
      
      // Skip title section, start from 0
      if (section.type.includes('Song Title') || section.type.includes('🎵')) {
        return { ...section, timestamp: 0 };
      }
      
      // Try to find timestamp from first few lines of the section
      for (const line of section.lines.slice(0, 3)) {
        timestamp = findTimestampForLine(line, words, usedIndices);
        if (timestamp !== null) {
          console.log(`Found timestamp for "${section.type}": ${timestamp}s from line "${line.substring(0, 30)}..."`);
          break;
        }
      }
      
      return { ...section, timestamp };
    });

    // Fill in missing timestamps by interpolation
    let lastKnownTimestamp = 0;
    let lastKnownIndex = 0;
    
    for (let i = 0; i < timestampedSections.length; i++) {
      if (timestampedSections[i].timestamp !== null) {
        // Fill gaps between last known and current
        if (i > lastKnownIndex + 1) {
          const gap = timestampedSections[i].timestamp! - lastKnownTimestamp;
          const steps = i - lastKnownIndex;
          for (let j = lastKnownIndex + 1; j < i; j++) {
            const interpolated = lastKnownTimestamp + (gap * (j - lastKnownIndex) / steps);
            timestampedSections[j].timestamp = Math.round(interpolated * 10) / 10;
            console.log(`Interpolated timestamp for "${timestampedSections[j].type}": ${timestampedSections[j].timestamp}s`);
          }
        }
        lastKnownTimestamp = timestampedSections[i].timestamp!;
        lastKnownIndex = i;
      }
    }
    
    // Fill remaining sections after last known timestamp
    if (lastKnownIndex < timestampedSections.length - 1) {
      const remainingGap = audioDuration - lastKnownTimestamp;
      const remainingSteps = timestampedSections.length - lastKnownIndex;
      for (let j = lastKnownIndex + 1; j < timestampedSections.length; j++) {
        const interpolated = lastKnownTimestamp + (remainingGap * (j - lastKnownIndex) / remainingSteps);
        timestampedSections[j].timestamp = Math.round(interpolated * 10) / 10;
        console.log(`Extrapolated timestamp for "${timestampedSections[j].type}": ${timestampedSections[j].timestamp}s`);
      }
    }

    console.log('Sections with timestamps:', timestampedSections.length);

    return new Response(JSON.stringify({ 
      success: true,
      sections: timestampedSections,
      transcript: sttResult.text,
      duration: audioDuration
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
