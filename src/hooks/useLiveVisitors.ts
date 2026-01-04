import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PresenceState {
  [key: string]: {
    user_id?: string;
    online_at: string;
  }[];
}

export const useLiveVisitors = () => {
  const [visitorCount, setVisitorCount] = useState(0);
  const [visitors, setVisitors] = useState<PresenceState>({});

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
        setVisitors(newState);
        
        // Count unique visitors
        const allVisitors = Object.values(newState).flat();
        setVisitorCount(allVisitors.length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        console.log('User joined:', newPresences);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        console.log('User left:', leftPresences);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
      });

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
      
      await channel.subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;
        
        await channel.track({
          user_id: user?.id || 'anonymous',
          online_at: new Date().toISOString(),
        });
      });
    };

    trackPresence();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
};
