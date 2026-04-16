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

  const getDemoData = useCallback(() => {
    const demoFolders: DriveFolder[] = [
      { id: 'demo-1', user_id: 'demo', name: 'Marketing Assets', parent_folder_id: null, color: 'blue', is_favorite: true, created_at: '2026-04-10T10:00:00Z', updated_at: '2026-04-15T14:30:00Z' },
      { id: 'demo-2', user_id: 'demo', name: 'Client Projects', parent_folder_id: null, color: 'purple', is_favorite: false, created_at: '2026-04-08T09:00:00Z', updated_at: '2026-04-14T11:00:00Z' },
      { id: 'demo-3', user_id: 'demo', name: 'Brand Guidelines', parent_folder_id: null, color: 'green', is_favorite: false, created_at: '2026-03-20T08:00:00Z', updated_at: '2026-04-12T16:45:00Z' },
      { id: 'demo-4', user_id: 'demo', name: 'Video Content', parent_folder_id: null, color: 'red', is_favorite: true, created_at: '2026-04-01T12:00:00Z', updated_at: '2026-04-16T09:00:00Z' },
      { id: 'demo-5', user_id: 'demo', name: 'Templates', parent_folder_id: null, color: 'amber', is_favorite: false, created_at: '2026-03-15T10:00:00Z', updated_at: '2026-04-10T08:30:00Z' },
      { id: 'demo-6', user_id: 'demo', name: 'Archived', parent_folder_id: null, color: 'gray', is_favorite: false, created_at: '2026-02-10T10:00:00Z', updated_at: '2026-03-28T10:00:00Z' },
      { id: 'demo-7', user_id: 'demo', name: 'Social Media', parent_folder_id: null, color: 'pink', is_favorite: false, created_at: '2026-04-05T10:00:00Z', updated_at: '2026-04-15T17:00:00Z' },
      { id: 'demo-8', user_id: 'demo', name: 'Presentations', parent_folder_id: null, color: 'teal', is_favorite: false, created_at: '2026-04-02T10:00:00Z', updated_at: '2026-04-13T13:00:00Z' },
    ];
    const demoFiles: DriveFile[] = [
      { id: 'file-1', user_id: 'demo', folder_id: null, name: 'Q2 Strategy Deck.pdf', file_size: 4500000, mime_type: 'application/pdf', storage_path: '', file_url: '', color: null, is_favorite: true, created_at: '2026-04-14T10:00:00Z', updated_at: '2026-04-15T09:00:00Z' },
      { id: 'file-2', user_id: 'demo', folder_id: null, name: 'Hero Banner.png', file_size: 2300000, mime_type: 'image/png', storage_path: '', file_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', color: 'blue', is_favorite: false, created_at: '2026-04-12T14:00:00Z', updated_at: '2026-04-12T14:00:00Z' },
      { id: 'file-3', user_id: 'demo', folder_id: null, name: 'Product Demo.mp4', file_size: 85000000, mime_type: 'video/mp4', storage_path: '', file_url: '', color: null, is_favorite: false, created_at: '2026-04-11T16:00:00Z', updated_at: '2026-04-11T16:00:00Z' },
      { id: 'file-4', user_id: 'demo', folder_id: null, name: 'Podcast Episode 12.mp3', file_size: 35000000, mime_type: 'audio/mpeg', storage_path: '', file_url: '', color: 'orange', is_favorite: false, created_at: '2026-04-10T09:00:00Z', updated_at: '2026-04-10T09:00:00Z' },
      { id: 'file-5', user_id: 'demo', folder_id: null, name: 'Team Photo.jpg', file_size: 1800000, mime_type: 'image/jpeg', storage_path: '', file_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', color: null, is_favorite: true, created_at: '2026-04-09T11:00:00Z', updated_at: '2026-04-09T11:00:00Z' },
      { id: 'file-6', user_id: 'demo', folder_id: null, name: 'Budget Report.xlsx', file_size: 520000, mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', storage_path: '', file_url: '', color: 'green', is_favorite: false, created_at: '2026-04-08T15:00:00Z', updated_at: '2026-04-08T15:00:00Z' },
      { id: 'file-7', user_id: 'demo', folder_id: null, name: 'Meeting Notes.docx', file_size: 45000, mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', storage_path: '', file_url: '', color: null, is_favorite: false, created_at: '2026-04-07T10:00:00Z', updated_at: '2026-04-07T10:00:00Z' },
      { id: 'file-8', user_id: 'demo', folder_id: null, name: 'Logo Final.svg', file_size: 12000, mime_type: 'image/svg+xml', storage_path: '', file_url: '', color: 'purple', is_favorite: false, created_at: '2026-04-06T13:00:00Z', updated_at: '2026-04-06T13:00:00Z' },
    ];
    return { demoFolders, demoFiles };
  }, []);

  const fetchContents = useCallback(async () => {
    setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      // Show demo data when not authenticated
      const { demoFolders, demoFiles } = getDemoData();
      setFolders(demoFolders);
      setFiles(demoFiles);
      setLoading(false);
      return;
    }

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
    const dbFolders = (foldersRes.data as DriveFolder[]) || [];
    const dbFiles = (filesRes.data as DriveFile[]) || [];
    if (dbFolders.length === 0 && dbFiles.length === 0 && !currentFolderId) {
      const { demoFolders, demoFiles } = getDemoData();
      setFolders(demoFolders);
      setFiles(demoFiles);
    } else {
      setFolders(dbFolders);
      setFiles(dbFiles);
    }
    setLoading(false);
  }, [currentFolderId, getDemoData]);

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
