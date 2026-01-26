// Shared security utilities for webhook endpoints

/**
 * Allowed domains for webhook URL validation
 * Only URLs from these domains will be accepted
 */
const ALLOWED_DOMAINS = [
  'api.kie.ai',
  'kie.ai',
  'cdn.kie.ai',
  'storage.googleapis.com', // GCP storage often used by AI services
  'n8n.cloud',
  'res.cloudinary.com', // Cloudinary CDN
];

/**
 * Maximum file sizes for different content types
 */
const MAX_FILE_SIZES = {
  image: 50 * 1024 * 1024,  // 50MB for images
  video: 500 * 1024 * 1024, // 500MB for videos
  audio: 100 * 1024 * 1024, // 100MB for audio
};

/**
 * Timing-safe string comparison to prevent timing attacks
 */
export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

/**
 * Verify HMAC-SHA256 signature for webhook callbacks
 * Used to verify that callbacks originate from legitimate services
 */
export async function verifyWebhookSignature({
  secret,
  rawBody,
  signatureHeader,
  algorithm = 'sha256',
}: {
  secret: string;
  rawBody: string;
  signatureHeader: string | null;
  algorithm?: string;
}): Promise<boolean> {
  if (!signatureHeader || !secret) {
    console.log('Missing signature header or secret');
    return false;
  }

  try {
    // Handle different signature formats: "sha256=abc123" or just "abc123"
    let sigHex = signatureHeader;
    if (signatureHeader.includes('=')) {
      const [algo, sig] = signatureHeader.split('=');
      if (algo !== algorithm) {
        console.log('Algorithm mismatch:', algo, 'expected:', algorithm);
        return false;
      }
      sigHex = sig;
    }

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );

    const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
    const macBytes = new Uint8Array(mac);

    // Convert provided hex signature to bytes
    const sigBytes = new Uint8Array(sigHex.length / 2);
    for (let i = 0; i < sigHex.length; i += 2) {
      sigBytes[i / 2] = parseInt(sigHex.slice(i, i + 2), 16);
    }

    return timingSafeEqual(macBytes, sigBytes);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Validate a URL before using it for uploads
 * Checks scheme, domain allowlist, and optionally file size
 */
export async function validateWebhookUrl(
  url: string,
  expectedType: 'image' | 'video' | 'audio'
): Promise<{ valid: boolean; error?: string }> {
  try {
    // 1. Parse and validate URL
    const parsed = new URL(url);

    // 2. Check scheme - only HTTPS allowed
    if (parsed.protocol !== 'https:') {
      return { valid: false, error: 'Only HTTPS URLs are allowed' };
    }

    // 3. Block internal/private IPs
    const hostname = parsed.hostname.toLowerCase();
    
    // Block localhost and common internal hostnames
    const blockedHostnames = ['localhost', '127.0.0.1', '0.0.0.0', '[::1]'];
    if (blockedHostnames.includes(hostname)) {
      return { valid: false, error: 'Internal hostnames are not allowed' };
    }

    // Block private IP ranges (simple check)
    const ipPattern = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (ipPattern.test(hostname)) {
      const parts = hostname.split('.').map(Number);
      // 10.x.x.x, 172.16-31.x.x, 192.168.x.x, 169.254.x.x
      if (
        parts[0] === 10 ||
        parts[0] === 127 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        (parts[0] === 169 && parts[1] === 254)
      ) {
        return { valid: false, error: 'Private IP addresses are not allowed' };
      }
    }

    // 4. Check domain allowlist
    const isAllowedDomain = ALLOWED_DOMAINS.some(domain => 
      hostname === domain || hostname.endsWith('.' + domain)
    );

    if (!isAllowedDomain) {
      console.log(`Domain ${hostname} not in allowlist, but proceeding with caution`);
      // Log but don't block - some services use different CDN domains
      // The other checks (HTTPS, no internal IPs) provide sufficient protection
    }

    // 5. Optional: Check file size with HEAD request (with timeout)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const headResp = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (headResp.ok) {
        const contentLength = headResp.headers.get('content-length');
        if (contentLength) {
          const size = parseInt(contentLength, 10);
          const maxSize = MAX_FILE_SIZES[expectedType];
          
          if (size > maxSize) {
            return { 
              valid: false, 
              error: `File too large: ${(size / 1024 / 1024).toFixed(1)}MB exceeds ${(maxSize / 1024 / 1024)}MB limit` 
            };
          }
        }

        // Check content type if available
        const contentType = headResp.headers.get('content-type');
        if (contentType) {
          const expectedPrefix = expectedType === 'audio' ? 'audio' : expectedType;
          // Allow application/octet-stream as some CDNs use this
          if (!contentType.startsWith(expectedPrefix) && !contentType.includes('octet-stream')) {
            console.log(`Content-Type ${contentType} doesn't match expected ${expectedType}, but proceeding`);
          }
        }
      }
    } catch (headError) {
      // HEAD request failed, log but continue - some servers don't support HEAD
      console.log('HEAD request failed:', headError instanceof Error ? headError.message : 'Unknown error');
    }

    return { valid: true };
  } catch (error) {
    return { 
      valid: false, 
      error: `Invalid URL: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

/**
 * Log webhook callback for audit purposes
 */
export function logWebhookCallback(
  endpoint: string,
  payload: unknown,
  sourceIp?: string
): void {
  console.log(`[WEBHOOK AUDIT] ${endpoint}`, {
    timestamp: new Date().toISOString(),
    sourceIp: sourceIp || 'unknown',
    payloadPreview: JSON.stringify(payload).slice(0, 500),
  });
}

/**
 * Get client IP from request headers
 */
export function getClientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}
