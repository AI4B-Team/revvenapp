import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [channelName, setChannelName] = useState('');

  useEffect(() => {
    const success = searchParams.get('success');
    const error = searchParams.get('error');
    const channel = searchParams.get('channel');
    const provider = searchParams.get('provider') || 'YouTube';

    if (success === 'true') {
      setStatus('success');
      setChannelName(channel || '');
      setMessage(`Your ${provider} account has been linked successfully.`);
      
      // Notify opener window
      if (window.opener) {
        window.opener.postMessage({ 
          type: provider === 'Facebook' ? 'FACEBOOK_AUTH_SUCCESS' : 'youtube_oauth_success' 
        }, '*');
      }
      
      // Auto-close after 2 seconds
      setTimeout(() => {
        window.close();
      }, 2000);
    } else if (error) {
      setStatus('error');
      setMessage(decodeURIComponent(error));
      
      // Notify opener window
      if (window.opener) {
        window.opener.postMessage({ 
          type: provider === 'Facebook' ? 'FACEBOOK_AUTH_ERROR' : 'youtube_oauth_error',
          error: decodeURIComponent(error)
        }, '*');
      }
      
      // Auto-close after 3 seconds
      setTimeout(() => {
        window.close();
      }, 3000);
    } else {
      setStatus('error');
      setMessage('Unknown error occurred');
    }
  }, [searchParams]);

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
      <div className="text-center p-8 bg-card/50 backdrop-blur-lg rounded-2xl border border-border max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
        {status === 'loading' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-primary/20 rounded-full flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Processing...</h1>
            <p className="text-muted-foreground">Please wait while we complete the connection.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500/20 rounded-full flex items-center justify-center animate-pulse">
              <CheckCircle className="w-10 h-10 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-green-500">Successfully Connected!</h1>
            {channelName && (
              <div className="inline-block bg-destructive/20 text-destructive px-4 py-2 rounded-lg font-semibold mb-4">
                {channelName}
              </div>
            )}
            <p className="text-muted-foreground mb-4">{message}</p>
            <p className="text-sm text-muted-foreground/60 mb-4">This window will close automatically...</p>
            <Button onClick={handleClose} className="bg-green-500 hover:bg-green-600">
              Close Window
            </Button>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-20 h-20 mx-auto mb-6 bg-destructive/20 rounded-full flex items-center justify-center">
              <XCircle className="w-10 h-10 text-destructive" />
            </div>
            <h1 className="text-2xl font-bold mb-2 text-destructive">Connection Failed</h1>
            <p className="text-muted-foreground mb-4">{message}</p>
            <p className="text-sm text-muted-foreground/60 mb-4">This window will close automatically...</p>
            <Button onClick={handleClose} variant="destructive">
              Close Window
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default OAuthCallback;
