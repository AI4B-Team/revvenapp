import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface DriveFolder {
  id: string;
  user_id: string;
  name: string;
  parent_folder_id: string | null;
  color: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface DriveFile {
  id: string;
  user_id: string;
  folder_id: string | null;
  name: string;
  file_size: number;
  mime_type: string | null;
  storage_path: string;
  file_url: string;
  color: string | null;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export type SortField = 'name' | 'created_at' | 'updated_at' | 'file_size' | 'mime_type';
export type SortDirection = 'asc' | 'desc';
export type ViewMode = 'grid' | 'list' | 'columns';

export const useDrive = () => {
  const [folders, setFolders] = useState<DriveFolder[]>([]);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'My Drive' }]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { toast } = useToast();

  const fetchContents = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) { setLoading(false); return; }

    const folderQuery = supabase.from('drive_folders').select('*')
      .eq('user_id', session.session.user.id);
    if (currentFolderId) {
      folderQuery.eq('parent_folder_id', currentFolderId);
    } else {
      folderQuery.is('parent_folder_id', null);
    }

    const fileQuery = supabase.from('drive_files').select('*')
      .eq('user_id', session.session.user.id);
    if (currentFolderId) {
      fileQuery.eq('folder_id', currentFolderId);
    } else {
      fileQuery.is('folder_id', null);
    }

    const [foldersRes, filesRes] = await Promise.all([folderQuery, fileQuery]);
    setFolders((foldersRes.data as DriveFolder[]) || []);
    setFiles((filesRes.data as DriveFile[]) || []);
    setLoading(false);
  }, [currentFolderId]);

  useEffect(() => { fetchContents(); }, [fetchContents]);

  const navigateToFolder = useCallback(async (folderId: string | null, folderName?: string) => {
    if (folderId === null) {
      setBreadcrumbs([{ id: null, name: 'My Drive' }]);
    } else {
      const existing = breadcrumbs.findIndex(b => b.id === folderId);
      if (existing >= 0) {
        setBreadcrumbs(breadcrumbs.slice(0, existing + 1));
      } else {
        setBreadcrumbs([...breadcrumbs, { id: folderId, name: folderName || 'Folder' }]);
      }
    }
    setCurrentFolderId(folderId);
  }, [breadcrumbs]);

  const createFolder = useCallback(async (name: string = 'New Folder') => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;

    const { error } = await supabase.from('drive_folders').insert({
      user_id: session.session.user.id,
      name,
      parent_folder_id: currentFolderId,
    });

    if (error) {
      toast({ title: 'Error', description: 'Failed to create folder', variant: 'destructive' });
    } else {
      toast({ title: 'Folder created' });
      fetchContents();
    }
  }, [currentFolderId, fetchContents, toast]);

  const renameFolder = useCallback(async (folderId: string, newName: string) => {
    const { error } = await supabase.from('drive_folders').update({ name: newName }).eq('id', folderId);
    if (!error) fetchContents();
  }, [fetchContents]);

  const renameFile = useCallback(async (fileId: string, newName: string) => {
    const { error } = await supabase.from('drive_files').update({ name: newName }).eq('id', fileId);
    if (!error) fetchContents();
  }, [fetchContents]);

  const deleteFolder = useCallback(async (folderId: string) => {
    const { error } = await supabase.from('drive_folders').delete().eq('id', folderId);
    if (!error) {
      toast({ title: 'Folder deleted' });
      fetchContents();
    }
  }, [fetchContents, toast]);

  const deleteFile = useCallback(async (file: DriveFile) => {
    await supabase.storage.from('drive-files').remove([file.storage_path]);
    const { error } = await supabase.from('drive_files').delete().eq('id', file.id);
    if (!error) {
      toast({ title: 'File deleted' });
      fetchContents();
    }
  }, [fetchContents, toast]);

  const toggleFavoriteFolder = useCallback(async (folderId: string, current: boolean) => {
    await supabase.from('drive_folders').update({ is_favorite: !current }).eq('id', folderId);
    fetchContents();
  }, [fetchContents]);

  const toggleFavoriteFile = useCallback(async (fileId: string, current: boolean) => {
    await supabase.from('drive_files').update({ is_favorite: !current }).eq('id', fileId);
    fetchContents();
  }, [fetchContents]);

  const setFolderColor = useCallback(async (folderId: string, color: string) => {
    await supabase.from('drive_folders').update({ color }).eq('id', folderId);
    fetchContents();
  }, [fetchContents]);

  const setFileColor = useCallback(async (fileId: string, color: string) => {
    await supabase.from('drive_files').update({ color }).eq('id', fileId);
    fetchContents();
  }, [fetchContents]);

  const uploadFiles = useCallback(async (fileList: FileList) => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) return;
    setUploading(true);

    const userId = session.session.user.id;
    for (const file of Array.from(fileList)) {
      const storagePath = `${userId}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('drive-files')
        .upload(storagePath, file);

      if (uploadError) {
        toast({ title: 'Upload failed', description: file.name, variant: 'destructive' });
        continue;
      }

      const { data: urlData } = supabase.storage.from('drive-files').getPublicUrl(storagePath);

      await supabase.from('drive_files').insert({
        user_id: userId,
        folder_id: currentFolderId,
        name: file.name,
        file_size: file.size,
        mime_type: file.type,
        storage_path: storagePath,
        file_url: urlData.publicUrl,
      });
    }

    toast({ title: `${fileList.length} file(s) uploaded` });
    setUploading(false);
    fetchContents();
  }, [currentFolderId, fetchContents, toast]);

  const downloadFile = useCallback(async (file: DriveFile) => {
    const { data, error } = await supabase.storage.from('drive-files').download(file.storage_path);
    if (error || !data) {
      toast({ title: 'Download failed', variant: 'destructive' });
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  }, [toast]);

  // Sort & filter
  const sortedFolders = [...folders]
    .filter(f => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortField === 'created_at') return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      if (sortField === 'updated_at') return (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * dir;
      return 0;
    });

  const sortedFiles = [...files]
    .filter(f => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dir = sortDirection === 'asc' ? 1 : -1;
      if (sortField === 'name') return a.name.localeCompare(b.name) * dir;
      if (sortField === 'created_at') return (new Date(a.created_at).getTime() - new Date(b.created_at).getTime()) * dir;
      if (sortField === 'updated_at') return (new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()) * dir;
      if (sortField === 'file_size') return ((a.file_size || 0) - (b.file_size || 0)) * dir;
      if (sortField === 'mime_type') return (a.mime_type || '').localeCompare(b.mime_type || '') * dir;
      return 0;
    });

  return {
    folders: sortedFolders,
    files: sortedFiles,
    currentFolderId,
    breadcrumbs,
    loading,
    uploading,
    sortField,
    sortDirection,
    searchQuery,
    viewMode,
    setSortField,
    setSortDirection,
    setSearchQuery,
    setViewMode,
    navigateToFolder,
    createFolder,
    renameFolder,
    renameFile,
    deleteFolder,
    deleteFile,
    toggleFavoriteFolder,
    toggleFavoriteFile,
    setFolderColor,
    setFileColor,
    uploadFiles,
    downloadFile,
    fetchContents,
  };
};
