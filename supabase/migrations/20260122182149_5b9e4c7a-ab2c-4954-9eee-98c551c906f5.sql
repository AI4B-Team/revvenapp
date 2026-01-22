-- Create preset_voices table for system-wide voice presets
CREATE TABLE public.preset_voices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  elevenlabs_voice_id TEXT NOT NULL UNIQUE,
  gender TEXT NOT NULL,
  age TEXT NOT NULL,
  accent TEXT NOT NULL,
  preview_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.preset_voices ENABLE ROW LEVEL SECURITY;

-- Everyone can read preset voices (public access)
CREATE POLICY "Anyone can view preset voices" 
ON public.preset_voices 
FOR SELECT 
USING (true);

-- Insert all 21 ElevenLabs voices
INSERT INTO public.preset_voices (name, elevenlabs_voice_id, gender, age, accent, sort_order) VALUES
('Rachel', '21m00Tcm4TlvDq8ikWAM', 'Female', 'Adult', 'American English', 1),
('Aria', '9BWtsMINqrJLrRacOk9x', 'Female', 'Adult', 'American English', 2),
('Roger', 'CwhRBWXzGAHq8TQ4Fs17', 'Male', 'Adult', 'American English', 3),
('Sarah', 'EXAVITQu4vr4xnSDxMaL', 'Female', 'Adult', 'American English', 4),
('Laura', 'FGY2WhTYpPnrIDTdsKH5', 'Female', 'Adult', 'American English', 5),
('Charlie', 'IKne3meq5aSn9XLyUdCD', 'Male', 'Adult', 'British English', 6),
('George', 'JBFqnCBsd6RMkjVDRZzb', 'Male', 'Adult', 'British English', 7),
('Callum', 'N2lVS1w4EtoT3dr4eOWO', 'Male', 'Adult', 'British English', 8),
('River', 'SAz9YHcvj6GT2YYXdXww', 'Female', 'Young', 'American English', 9),
('Liam', 'TX3LPaxmHKxFdv7VOQHJ', 'Male', 'Adult', 'American English', 10),
('Charlotte', 'XB0fDUnXU5powFXDhCwa', 'Female', 'Adult', 'British English', 11),
('Alice', 'Xb7hH8MSUJpSbSDYk0k2', 'Female', 'Adult', 'British English', 12),
('Matilda', 'XrExE9yKIg1WjnnlVkGX', 'Female', 'Adult', 'Australian English', 13),
('Will', 'bIHbv24MWmeRgasZH58o', 'Male', 'Adult', 'American English', 14),
('Jessica', 'cgSgspJ2msm6clMCkdW9', 'Female', 'Adult', 'American English', 15),
('Eric', 'cjVigY5qzO86Huf0OWal', 'Male', 'Adult', 'American English', 16),
('Chris', 'iP95p4xoKVk53GoZ742B', 'Male', 'Adult', 'American English', 17),
('Brian', 'nPczCjzI2devNBz1zQrb', 'Male', 'Adult', 'American English', 18),
('Daniel', 'onwK4e9ZLuTAKqWW03F9', 'Male', 'Adult', 'British English', 19),
('Lily', 'pFZP5JQG7iQjIQuC4Bku', 'Female', 'Adult', 'British English', 20),
('Bill', 'pqHfZKP75CvOlQylNhV4', 'Male', 'Adult', 'American English', 21);