
-- Create drive_folders table
CREATE TABLE public.drive_folders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL DEFAULT 'New Folder',
  parent_folder_id UUID REFERENCES public.drive_folders(id) ON DELETE CASCADE,
  color TEXT DEFAULT 'blue',
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.drive_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own drive folders" ON public.drive_folders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own drive folders" ON public.drive_folders FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own drive folders" ON public.drive_folders FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own drive folders" ON public.drive_folders FOR DELETE USING (auth.uid() = user_id);

-- Create drive_files table
CREATE TABLE public.drive_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  folder_id UUID REFERENCES public.drive_folders(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  file_size BIGINT DEFAULT 0,
  mime_type TEXT,
  storage_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  color TEXT,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.drive_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own drive files" ON public.drive_files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own drive files" ON public.drive_files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own drive files" ON public.drive_files FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own drive files" ON public.drive_files FOR DELETE USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_drive_folders_user ON public.drive_folders(user_id);
CREATE INDEX idx_drive_folders_parent ON public.drive_folders(parent_folder_id);
CREATE INDEX idx_drive_files_user ON public.drive_files(user_id);
CREATE INDEX idx_drive_files_folder ON public.drive_files(folder_id);

-- Updated_at triggers
CREATE TRIGGER update_drive_folders_updated_at BEFORE UPDATE ON public.drive_folders FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_drive_files_updated_at BEFORE UPDATE ON public.drive_files FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('drive-files', 'drive-files', false);

CREATE POLICY "Users can upload drive files" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'drive-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can view their drive files" ON storage.objects FOR SELECT USING (bucket_id = 'drive-files' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their drive files" ON storage.objects FOR DELETE USING (bucket_id = 'drive-files' AND auth.uid()::text = (storage.foldername(name))[1]);
