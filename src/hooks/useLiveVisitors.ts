import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { isStorageAccessible } from '@/utils/isStorageAccessible';

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
    if (!isStorageAccessible()) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;

    try {
      channel = supabase.channel('live-visitors', {
        config: {
          presence: {
            key: 'visitors',
          },
        },
      });

      channel
        .on('presence', { event: 'sync' }, () => {
          const newState = channel?.presenceState() as PresenceState | undefined;
          if (!newState) return;

          // Flatten all visitors from all keys
          const allVisitors = Object.values(newState).flat();

          // Remove duplicates by user_id
          const uniqueVisitors = allVisitors.reduce((acc: VisitorInfo[], curr) => {
            if (!acc.find((v) => v.user_id === curr.user_id)) {
              acc.push(curr);
            }
            return acc;
          }, []);

          setVisitors(uniqueVisitors);
          setVisitorCount(uniqueVisitors.length);
        })
        .on('presence', { event: 'join' }, () => {
          // no-op (avoid noisy logs)
        })
        .on('presence', { event: 'leave' }, () => {
          // no-op (avoid noisy logs)
        })
        .subscribe();
    } catch (e) {
      console.warn('Live visitors disabled:', e);
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  return { visitorCount, visitors };
};

export const useTrackVisitor = () => {
  useEffect(() => {
    if (!isStorageAccessible()) return;

    let channel: ReturnType<typeof supabase.channel> | null = null;
    let isMounted = true;

    const trackPresence = async () => {
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!isMounted) return;

        let userInfo: VisitorInfo = {
          user_id: user?.id || `anonymous-${Math.random().toString(36).slice(2, 11)}`,
          online_at: new Date().toISOString(),
        };

        // If user is logged in, fetch their profile
        if (user) {
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email, avatar_url')
              .eq('id', user.id)
              .maybeSingle();

            if (profile && isMounted) {
              userInfo = {
                ...userInfo,
                email: profile.email || user.email,
                full_name: profile.full_name || undefined,
                avatar_url: profile.avatar_url || undefined,
              };
            }
          } catch {
            // ignore profile fetch failures
          }
        }

        if (!isMounted) return;

        channel = supabase.channel('live-visitors', {
          config: {
            presence: {
              key: 'visitors',
            },
          },
        });

        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED' && isMounted) {
            channel?.track(userInfo).catch(() => {
              /* ignore */
            });
          }
        });
      } catch (e) {
        console.warn('Visitor presence disabled:', e);
      }
    };

    trackPresence();

    return () => {
      isMounted = false;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);
};
