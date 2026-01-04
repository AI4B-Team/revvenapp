import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VisitorInfo {
  user_id: string;
  email?: string;
  full_name?: string;
  avatar_url?: string;
  online_at: string;
}

interface PresenceState {
  [key: string]: VisitorInfo[];
}

export const useLiveVisitors = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [visitors, setVisitors] = useState<VisitorInfo[]>([]);

  useEffect(() => {
    const channel = supabase.channel('live-visitors', {
      config: {
        presence: {
          key: 'visitors',
        },
      },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const newState = channel.presenceState() as PresenceState;
        
        // Flatten all visitors from all keys
        const allVisitors = Object.values(newState).flat();
        
        // Remove duplicates by user_id
        const uniqueVisitors = allVisitors.reduce((acc: VisitorInfo[], curr) => {
          if (!acc.find(v => v.user_id === curr.user_id)) {
            acc.push(curr);
          }
          return acc;
        }, []);
        
        setVisitors(uniqueVisitors);
        setVisitorCount(uniqueVisitors.length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return { visitorCount, visitors };
};

export const useTrackVisitor = () => {
  useEffect(() => {
    const channel = supabase.channel('live-visitors', {
      config: {
        presence: {
          key: 'visitors',
        },
      },
    });

    const trackPresence = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      let userInfo: VisitorInfo = {
        user_id: user?.id || `anonymous-${Math.random().toString(36).substr(2, 9)}`,
        online_at: new Date().toISOString(),
      };

      // If user is logged in, fetch their profile
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email, avatar_url')
          .eq('id', user.id)
          .single();

        if (profile) {
          userInfo = {
            ...userInfo,
            email: profile.email || user.email,
            full_name: profile.full_name || undefined,
            avatar_url: profile.avatar_url || undefined,
          };
        }
      }
      
      await channel.subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        await channel.track(userInfo);
      });
    };

    trackPresence();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
