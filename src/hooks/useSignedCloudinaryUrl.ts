import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SignedUrlCache {
  [key: string]: string;
}

const urlCache: SignedUrlCache = {};

export const useSignedCloudinaryUrl = (url: string | null | undefined) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!url) {
      setSignedUrl(null);
      return;
    }

    // Check cache first
    if (urlCache[url]) {
      setSignedUrl(urlCache[url]);
      return;
    }

    // Non-Cloudinary URLs don't need signing
    if (!url.includes('res.cloudinary.com') && !url.includes('cloudinary')) {
      setSignedUrl(url);
      return;
    }

    const fetchSignedUrl = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase.functions.invoke('get-signed-cloudinary-url', {
          body: { urls: [url] }
        });

        if (error) throw error;

        const signed = data?.signedUrls?.[url] || url;
        urlCache[url] = signed;
        setSignedUrl(signed);
      } catch (err) {
        console.error('Error fetching signed URL:', err);
        setSignedUrl(url); // Fallback to original URL
      } finally {
        setIsLoading(false);
      }
    };

    fetchSignedUrl();
  }, [url]);

  return { signedUrl, isLoading };
};

// Batch function to sign multiple URLs at once
export const getSignedCloudinaryUrls = async (urls: string[]): Promise<Record<string, string>> => {
  if (!urls.length) return {};

  // Filter out cached URLs
  const uncachedUrls = urls.filter(url => !urlCache[url]);
  
  if (uncachedUrls.length === 0) {
    // All URLs are cached
    return urls.reduce((acc, url) => {
      acc[url] = urlCache[url] || url;
      return acc;
    }, {} as Record<string, string>);
  }

  try {
    const { data, error } = await supabase.functions.invoke('get-signed-cloudinary-url', {
      body: { urls: uncachedUrls }
    });

    if (error) throw error;

    // Cache the new signed URLs
    if (data?.signedUrls) {
      Object.entries(data.signedUrls).forEach(([original, signed]) => {
        urlCache[original] = signed as string;
      });
    }

    // Return all URLs (cached + newly signed)
    return urls.reduce((acc, url) => {
      acc[url] = urlCache[url] || url;
      return acc;
    }, {} as Record<string, string>);
  } catch (err) {
    console.error('Error fetching signed URLs:', err);
    // Return original URLs on error
    return urls.reduce((acc, url) => {
      acc[url] = url;
      return acc;
    }, {} as Record<string, string>);
  }
};
