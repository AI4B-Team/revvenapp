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
  const [folderCounts, setFolderCounts] = useState<Record<string, number>>({});
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ id: string | null; name: string }[]>([{ id: null, name: 'My Drive' }]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const { toast } = useToast();

  const getDemoData = useCallback((parentId: string | null = null) => {
    // Root folders
    const rootFolders: DriveFolder[] = [
      { id: 'demo-1', user_id: 'demo', name: 'Marketing Assets', parent_folder_id: null, color: 'blue', is_favorite: true, created_at: '2026-04-10T10:00:00Z', updated_at: '2026-04-15T14:30:00Z' },
      { id: 'demo-2', user_id: 'demo', name: 'Client Projects', parent_folder_id: null, color: 'purple', is_favorite: false, created_at: '2026-04-08T09:00:00Z', updated_at: '2026-04-14T11:00:00Z' },
      { id: 'demo-3', user_id: 'demo', name: 'Brand Guidelines', parent_folder_id: null, color: 'green', is_favorite: false, created_at: '2026-03-20T08:00:00Z', updated_at: '2026-04-12T16:45:00Z' },
      { id: 'demo-4', user_id: 'demo', name: 'Video Content', parent_folder_id: null, color: 'red', is_favorite: true, created_at: '2026-04-01T12:00:00Z', updated_at: '2026-04-16T09:00:00Z' },
      { id: 'demo-5', user_id: 'demo', name: 'Templates', parent_folder_id: null, color: 'amber', is_favorite: false, created_at: '2026-03-15T10:00:00Z', updated_at: '2026-04-10T08:30:00Z' },
      { id: 'demo-6', user_id: 'demo', name: 'Archived', parent_folder_id: null, color: 'gray', is_favorite: false, created_at: '2026-02-10T10:00:00Z', updated_at: '2026-03-28T10:00:00Z' },
      { id: 'demo-7', user_id: 'demo', name: 'Social Media', parent_folder_id: null, color: 'pink', is_favorite: false, created_at: '2026-04-05T10:00:00Z', updated_at: '2026-04-15T17:00:00Z' },
      { id: 'demo-8', user_id: 'demo', name: 'Presentations', parent_folder_id: null, color: 'teal', is_favorite: false, created_at: '2026-04-02T10:00:00Z', updated_at: '2026-04-13T13:00:00Z' },
    ];
    const rootFiles: DriveFile[] = [
      { id: 'file-1', user_id: 'demo', folder_id: null, name: 'Q2 Strategy Deck.pdf', file_size: 4500000, mime_type: 'application/pdf', storage_path: '', file_url: '', color: null, is_favorite: true, created_at: '2026-04-14T10:00:00Z', updated_at: '2026-04-15T09:00:00Z' },
      { id: 'file-2', user_id: 'demo', folder_id: null, name: 'Hero Banner.png', file_size: 2300000, mime_type: 'image/png', storage_path: '', file_url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400', color: 'blue', is_favorite: false, created_at: '2026-04-12T14:00:00Z', updated_at: '2026-04-12T14:00:00Z' },
      { id: 'file-3', user_id: 'demo', folder_id: null, name: 'Product Demo.mp4', file_size: 85000000, mime_type: 'video/mp4', storage_path: '', file_url: '', color: null, is_favorite: false, created_at: '2026-04-11T16:00:00Z', updated_at: '2026-04-11T16:00:00Z' },
      { id: 'file-4', user_id: 'demo', folder_id: null, name: 'Podcast Episode 12.mp3', file_size: 35000000, mime_type: 'audio/mpeg', storage_path: '', file_url: '', color: 'orange', is_favorite: false, created_at: '2026-04-10T09:00:00Z', updated_at: '2026-04-10T09:00:00Z' },
      { id: 'file-5', user_id: 'demo', folder_id: null, name: 'Team Photo.jpg', file_size: 1800000, mime_type: 'image/jpeg', storage_path: '', file_url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400', color: null, is_favorite: true, created_at: '2026-04-09T11:00:00Z', updated_at: '2026-04-09T11:00:00Z' },
      { id: 'file-6', user_id: 'demo', folder_id: null, name: 'Budget Report.xlsx', file_size: 520000, mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', storage_path: '', file_url: '', color: 'green', is_favorite: false, created_at: '2026-04-08T15:00:00Z', updated_at: '2026-04-08T15:00:00Z' },
      { id: 'file-7', user_id: 'demo', folder_id: null, name: 'Meeting Notes.docx', file_size: 45000, mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', storage_path: '', file_url: '', color: null, is_favorite: false, created_at: '2026-04-07T10:00:00Z', updated_at: '2026-04-07T10:00:00Z' },
      { id: 'file-8', user_id: 'demo', folder_id: null, name: 'Logo Final.svg', file_size: 12000, mime_type: 'image/svg+xml', storage_path: '', file_url: '', color: 'purple', is_favorite: false, created_at: '2026-04-06T13:00:00Z', updated_at: '2026-04-06T13:00:00Z' },
    ];

    // Nested content per parent folder
    const nestedFoldersByParent: Record<string, DriveFolder[]> = {
      'demo-1': [
        { id: 'demo-1-a', user_id: 'demo', name: 'Email Campaigns', parent_folder_id: 'demo-1', color: 'blue', is_favorite: false, created_at: '2026-04-01T10:00:00Z', updated_at: '2026-04-12T10:00:00Z' },
        { id: 'demo-1-b', user_id: 'demo', name: 'Ad Creatives', parent_folder_id: 'demo-1', color: 'pink', is_favorite: true, created_at: '2026-04-02T10:00:00Z', updated_at: '2026-04-14T10:00:00Z' },
      ],
      'demo-2': [
        { id: 'demo-2-a', user_id: 'demo', name: 'Acme Corp', parent_folder_id: 'demo-2', color: 'purple', is_favorite: true, created_at: '2026-03-01T10:00:00Z', updated_at: '2026-04-10T10:00:00Z' },
        { id: 'demo-2-b', user_id: 'demo', name: 'Globex Inc', parent_folder_id: 'demo-2', color: 'teal', is_favorite: false, created_at: '2026-03-05T10:00:00Z', updated_at: '2026-04-09T10:00:00Z' },
        { id: 'demo-2-c', user_id: 'demo', name: 'Initech', parent_folder_id: 'demo-2', color: 'amber', is_favorite: false, created_at: '2026-03-10T10:00:00Z', updated_at: '2026-04-08T10:00:00Z' },
      ],
      'demo-4': [
        { id: 'demo-4-a', user_id: 'demo', name: 'Raw Footage', parent_folder_id: 'demo-4', color: 'red', is_favorite: false, created_at: '2026-03-15T10:00:00Z', updated_at: '2026-04-12T10:00:00Z' },
        { id: 'demo-4-b', user_id: 'demo', name: 'Final Edits', parent_folder_id: 'demo-4', color: 'green', is_favorite: true, created_at: '2026-03-20T10:00:00Z', updated_at: '2026-04-15T10:00:00Z' },
      ],
      'demo-7': [
        { id: 'demo-7-a', user_id: 'demo', name: 'Instagram', parent_folder_id: 'demo-7', color: 'pink', is_favorite: false, created_at: '2026-03-25T10:00:00Z', updated_at: '2026-04-14T10:00:00Z' },
        { id: 'demo-7-b', user_id: 'demo', name: 'TikTok', parent_folder_id: 'demo-7', color: 'gray', is_favorite: false, created_at: '2026-03-26T10:00:00Z', updated_at: '2026-04-13T10:00:00Z' },
        { id: 'demo-7-c', user_id: 'demo', name: 'LinkedIn', parent_folder_id: 'demo-7', color: 'blue', is_favorite: false, created_at: '2026-03-27T10:00:00Z', updated_at: '2026-04-12T10:00:00Z' },
      ],
    };

    const nestedFilesByParent: Record<string, DriveFile[]> = {
      'demo-1': [
        { id: 'f-m1', user_id: 'demo', folder_id: 'demo-1', name: 'Brand Pitch.pdf', file_size: 3200000, mime_type: 'application/pdf', storage_path: '', file_url: '', color: null, is_favorite: false, created_at: '2026-04-10T10:00:00Z', updated_at: '2026-04-12T10:00:00Z' },
        { id: 'f-m2', user_id: 'demo', folder_id: 'demo-1', name: 'Spring Banner.png', file_size: 1900000, mime_type: 'image/png', storage_path: '', file_url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=400', color: 'blue', is_favorite: true, created_at: '2026-04-09T10:00:00Z', updated_at: '2026-04-09T10:00:00Z' },
        { id: 'f-m3', user_id: 'demo', folder_id: 'demo-1', name: 'Promo Reel.mp4', file_size: 42000000, mime_type: 'video/mp4', storage_path: '', file_url: '', color: null, is_favorite: false, created_at: '2026-04-08T10:00:00Z', updated_at: '2026-04-08T10:00:00Z' },
      ],
      'demo-2': [
        { id: 'f-c1', user_id: 'demo', folder_id: 'demo-2', name: 'Project Brief.docx', file_size: 65000, mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', storage_path: '', file_url: '', color: null, is_favorite: false, created_at: '2026-04-05T10:00:00Z', updated_at: '2026-04-05T10:00:00Z' },
        { id: 'f-c2', user_id: 'demo', folder_id: 'demo-2', name: 'Contract.pdf', file_size: 850000, mime_type: 'application/pdf', storage_path: '', file_url: '', color: 'purple', is_favorite: true, created_at: '2026-04-03T10:00:00Z', updated_at: '2026-04-03T10:00:00Z' },
      ],
      'demo-3': [
        { id: 'f-b1', user_id: 'demo', folder_id: 'demo-3', name: 'Logo Pack.zip', file_size: 5500000, mime_type: 'application/zip', storage_path: '', file_url: '', color: null, is_favorite: false, created_at: '2026-03-22T10:00:00Z', updated_at: '2026-03-22T10:00:00Z' },
        { id: 'f-b2', user_id: 'demo', folder_id: 'demo-3', name: 'Color Palette.png', file_size: 320000, mime_type: 'image/png', storage_path: '', file_url: 'https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=400', color: 'green', is_favorite: false, created_at: '2026-03-21T10:00:00Z', updated_at: '2026-03-21T10:00:00Z' },
        { id: 'f-b3', user_id: 'demo', folder_id: 'demo-3', name: 'Brand Guide.pdf', file_size: 8200000, mime_type: 'application/pdf', storage_path: '', file_url: '', color: null, is_favorite: true, created_at: '2026-03-20T10:00:00Z', updated_at: '2026-03-20T10:00:00Z' },
      ],
      'demo-4': [
        { id: 'f-v1', user_id: 'demo', folder_id: 'demo-4', name: 'Intro Sequence.mp4', file_size: 120000000, mime_type: 'video/mp4', storage_path: '', file_url: '', color: null, is_favorite: false, created_at: '2026-04-01T10:00:00Z', updated_at: '2026-04-01T10:00:00Z' },
        { id: 'f-v2', user_id: 'demo', folder_id: 'demo-4', name: 'Tutorial Cut.mp4', file_size: 95000000, mime_type: 'video/mp4', storage_path: '', file_url: '', color: 'red', is_favorite: false, created_at: '2026-04-02T10:00:00Z', updated_at: '2026-04-02T10:00:00Z' },
      ],
      'demo-5': [
        { id: 'f-t1', user_id: 'demo', folder_id: 'demo-5', name: 'Invoice Template.xlsx', file_size: 45000, mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', storage_path: '', file_url: '', color: 'green', is_favorite: false, created_at: '2026-03-18T10:00:00Z', updated_at: '2026-03-18T10:00:00Z' },
        { id: 'f-t2', user_id: 'demo', folder_id: 'demo-5', name: 'Proposal Template.docx', file_size: 78000, mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', storage_path: '', file_url: '', color: null, is_favorite: true, created_at: '2026-03-17T10:00:00Z', updated_at: '2026-03-17T10:00:00Z' },
      ],
      'demo-6': [
        { id: 'f-a1', user_id: 'demo', folder_id: 'demo-6', name: '2024 Recap.pdf', file_size: 2100000, mime_type: 'application/pdf', storage_path: '', file_url: '', color: 'gray', is_favorite: false, created_at: '2026-02-15T10:00:00Z', updated_at: '2026-02-15T10:00:00Z' },
      ],
      'demo-7': [
        { id: 'f-s1', user_id: 'demo', folder_id: 'demo-7', name: 'IG Post 1.jpg', file_size: 1200000, mime_type: 'image/jpeg', storage_path: '', file_url: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400', color: 'pink', is_favorite: true, created_at: '2026-04-10T10:00:00Z', updated_at: '2026-04-10T10:00:00Z' },
        { id: 'f-s2', user_id: 'demo', folder_id: 'demo-7', name: 'Reel Script.docx', file_size: 28000, mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', storage_path: '', file_url: '', color: null, is_favorite: false, created_at: '2026-04-09T10:00:00Z', updated_at: '2026-04-09T10:00:00Z' },
      ],
      'demo-8': [
        { id: 'f-p1', user_id: 'demo', folder_id: 'demo-8', name: 'Sales Deck.pptx', file_size: 6800000, mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', storage_path: '', file_url: '', color: 'teal', is_favorite: false, created_at: '2026-04-04T10:00:00Z', updated_at: '2026-04-04T10:00:00Z' },
        { id: 'f-p2', user_id: 'demo', folder_id: 'demo-8', name: 'Investor Pitch.pdf', file_size: 4200000, mime_type: 'application/pdf', storage_path: '', file_url: '', color: null, is_favorite: true, created_at: '2026-04-03T10:00:00Z', updated_at: '2026-04-03T10:00:00Z' },
      ],
    };

    if (parentId === null) {
      return { demoFolders: rootFolders, demoFiles: rootFiles };
    }
    return {
      demoFolders: nestedFoldersByParent[parentId] || [],
      demoFiles: nestedFilesByParent[parentId] || [],
    };
  }, []);

  const fetchContents = useCallback(async (showLoading: boolean = false) => {
    if (showLoading) setLoading(true);
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      // Show demo data when not authenticated
      const { demoFolders, demoFiles } = getDemoData(currentFolderId);
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
    let activeFolders: DriveFolder[];
    let activeFiles: DriveFile[];
    if (dbFolders.length === 0 && dbFiles.length === 0) {
      const { demoFolders, demoFiles } = getDemoData(currentFolderId);
      activeFolders = demoFolders;
      activeFiles = demoFiles;
    } else {
      activeFolders = dbFolders;
      activeFiles = dbFiles;
    }
    setFolders(activeFolders);
    setFiles(activeFiles);

    // Compute child counts (folders + files) per visible folder
    const counts: Record<string, number> = {};
    await Promise.all(activeFolders.map(async (f) => {
      if (f.id.startsWith('demo')) {
        const { demoFolders: cf, demoFiles: cfi } = getDemoData(f.id);
        counts[f.id] = cf.length + cfi.length;
      } else {
        const [{ count: fc }, { count: fic }] = await Promise.all([
          supabase.from('drive_folders').select('id', { count: 'exact', head: true }).eq('parent_folder_id', f.id),
          supabase.from('drive_files').select('id', { count: 'exact', head: true }).eq('folder_id', f.id),
        ]);
        counts[f.id] = (fc || 0) + (fic || 0);
      }
    }));
    setFolderCounts(counts);
    setLoading(false);
  }, [currentFolderId, getDemoData]);

  useEffect(() => { fetchContents(true); }, [fetchContents]);

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

  const createFolder = useCallback(async (name: string = 'New Folder'): Promise<string | null> => {
    const { data: session } = await supabase.auth.getSession();
    const now = new Date().toISOString();
    if (!session?.session?.user) {
      // Demo mode: add a local folder
      const newId = `demo-new-${Date.now()}`;
      setFolders((prev) => [
        { id: newId, user_id: 'demo', name, parent_folder_id: currentFolderId, color: 'blue', is_favorite: false, created_at: now, updated_at: now },
        ...prev,
      ]);
      return newId;
    }

    const { data, error } = await supabase.from('drive_folders').insert({
      user_id: session.session.user.id,
      name,
      parent_folder_id: currentFolderId,
    }).select('*').single();

    if (error || !data) {
      toast({ title: 'Error', description: 'Failed to create folder', variant: 'destructive' });
      return null;
    }
    // Optimistic insert — no full refetch
    setFolders((prev) => [data as DriveFolder, ...prev]);
    setFolderCounts((prev) => ({ ...prev, [data.id]: 0 }));
    toast({ title: 'Folder created' });
    return data.id;
  }, [currentFolderId, toast]);

  const renameFolder = useCallback(async (folderId: string, newName: string) => {
    setFolders((prev) => prev.map((f) => f.id === folderId ? { ...f, name: newName, updated_at: new Date().toISOString() } : f));
    if (folderId.startsWith('demo')) return;
    await supabase.from('drive_folders').update({ name: newName }).eq('id', folderId);
  }, []);

  const renameFile = useCallback(async (fileId: string, newName: string) => {
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, name: newName, updated_at: new Date().toISOString() } : f));
    if (fileId.startsWith('file-') || fileId.startsWith('f-')) return;
    await supabase.from('drive_files').update({ name: newName }).eq('id', fileId);
  }, []);

  const deleteFolder = useCallback(async (folderId: string) => {
    setFolders((prev) => prev.filter((f) => f.id !== folderId));
    toast({ title: 'Folder deleted' });
    if (folderId.startsWith('demo')) return;
    await supabase.from('drive_folders').delete().eq('id', folderId);
  }, [toast]);

  const deleteFile = useCallback(async (file: DriveFile) => {
    setFiles((prev) => prev.filter((f) => f.id !== file.id));
    toast({ title: 'File deleted' });
    if (file.id.startsWith('file-') || file.id.startsWith('f-')) return;
    await supabase.storage.from('drive-files').remove([file.storage_path]);
    await supabase.from('drive_files').delete().eq('id', file.id);
  }, [toast]);

  const toggleFavoriteFolder = useCallback(async (folderId: string, current: boolean) => {
    setFolders((prev) => prev.map((f) => f.id === folderId ? { ...f, is_favorite: !current } : f));
    if (folderId.startsWith('demo')) return;
    await supabase.from('drive_folders').update({ is_favorite: !current }).eq('id', folderId);
  }, []);

  const toggleFavoriteFile = useCallback(async (fileId: string, current: boolean) => {
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, is_favorite: !current } : f));
    if (fileId.startsWith('file-') || fileId.startsWith('f-')) return;
    await supabase.from('drive_files').update({ is_favorite: !current }).eq('id', fileId);
  }, []);

  const setFolderColor = useCallback(async (folderId: string, color: string) => {
    setFolders((prev) => prev.map((f) => f.id === folderId ? { ...f, color } : f));
    if (folderId.startsWith('demo')) return;
    await supabase.from('drive_folders').update({ color }).eq('id', folderId);
  }, []);

  const setFileColor = useCallback(async (fileId: string, color: string) => {
    setFiles((prev) => prev.map((f) => f.id === fileId ? { ...f, color } : f));
    if (fileId.startsWith('file-') || fileId.startsWith('f-')) return;
    await supabase.from('drive_files').update({ color }).eq('id', fileId);
  }, []);

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

  // Fetch contents of an arbitrary folder (used by columns view)
  const fetchFolderContents = useCallback(async (parentId: string | null): Promise<{ folders: DriveFolder[]; files: DriveFile[] }> => {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user) {
      const { demoFolders, demoFiles } = getDemoData(parentId);
      return { folders: demoFolders, files: demoFiles };
    }
    const folderQuery = supabase.from('drive_folders').select('*').eq('user_id', session.session.user.id);
    const fileQuery = supabase.from('drive_files').select('*').eq('user_id', session.session.user.id);
    if (parentId) { folderQuery.eq('parent_folder_id', parentId); fileQuery.eq('folder_id', parentId); }
    else { folderQuery.is('parent_folder_id', null); fileQuery.is('folder_id', null); }
    const [fr, fi] = await Promise.all([folderQuery, fileQuery]);
    const dbFolders = (fr.data as DriveFolder[]) || [];
    const dbFiles = (fi.data as DriveFile[]) || [];
    if (dbFolders.length === 0 && dbFiles.length === 0) {
      const { demoFolders, demoFiles } = getDemoData(parentId);
      return { folders: demoFolders, files: demoFiles };
    }
    return { folders: dbFolders, files: dbFiles };
  }, [getDemoData]);

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
    folderCounts,
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
    fetchFolderContents,
  };
};
