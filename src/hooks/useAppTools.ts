import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AppTool {
  id: string;
  name: string;
  description: string;
  category: string;
  icon_url: string | null;
  bg_color: string;
  route: string | null;
  is_active: boolean;
  sort_order: number;
  is_new: boolean;
}

export const useAppTools = (category?: string) => {
  return useQuery({
    queryKey: ['app-tools', category],
    queryFn: async () => {
      let query = supabase
        .from('app_tools')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (category) {
        query = query.eq('category', category);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('Error fetching app tools:', error);
        throw error;
      }
      
      return data as AppTool[];
    },
  });
};

export const useAppToolsByCategories = () => {
  return useQuery({
    queryKey: ['app-tools-all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('app_tools')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) {
        console.error('Error fetching app tools:', error);
        throw error;
      }
      
      const tools = data as AppTool[];
      
      // Group by category
      return {
        Apps: tools.filter(t => t.category === 'Apps'),
        Image: tools.filter(t => t.category === 'Image'),
        Video: tools.filter(t => t.category === 'Video'),
        Audio: tools.filter(t => t.category === 'Audio'),
        Design: tools.filter(t => t.category === 'Design'),
        Content: tools.filter(t => t.category === 'Content'),
      };
    },
  });
};
