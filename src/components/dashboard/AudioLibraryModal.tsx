import React, { useState, useEffect, useRef } from 'react';
import { Search, Play, Pause, Clock, Calendar, X, Mic, Loader2, Pencil, Trash2, Square, Check, FileAudio } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Social Media Brand Icons as SVG components
const YouTubeIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF0000">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1877F2">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000000">
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <defs>
      <radialGradient id="ig-gradient" cx="30%" cy="107%" r="150%">
        <stop offset="0%" stopColor="#fdf497"/>
        <stop offset="5%" stopColor="#fdf497"/>
        <stop offset="45%" stopColor="#fd5949"/>
        <stop offset="60%" stopColor="#d6249f"/>
        <stop offset="90%" stopColor="#285AEB"/>
      </radialGradient>
    </defs>
    <path fill="url(#ig-gradient)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const ThreadsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000000">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.96-.065-1.182.408-2.256 1.332-3.022.855-.71 2.024-1.146 3.39-1.264.944-.082 1.894-.048 2.821.1.007-.378.009-.753-.009-1.119-.064-1.318-.282-2.276-1.03-2.883-.587-.476-1.47-.678-2.79-.64-1.2.035-2.126.337-2.756.9-.547.49-.871 1.126-.986 2.008l-2.063-.292c.165-1.294.698-2.332 1.584-3.089 1.054-.9 2.49-1.374 4.271-1.413h.09c1.77.03 3.134.488 4.054 1.362 1.19 1.128 1.47 2.671 1.548 4.27.018.375.016.795.003 1.235.756.376 1.412.858 1.947 1.432 1.062 1.142 1.59 2.6 1.535 4.23-.055 1.64-.681 3.096-1.812 4.212-1.733 1.708-4.096 2.58-7.027 2.595z"/>
    <path d="M13.893 13.99c-.834-.086-1.623-.053-2.344.027-.952.106-1.724.369-2.232.762-.455.352-.665.777-.625 1.264.04.486.317.9.782 1.17.542.315 1.278.472 2.066.43 1.054-.057 1.876-.454 2.447-1.182.387-.494.657-1.165.791-1.984-.295-.165-.58-.325-.885-.487z"/>
  </svg>
);

const XTwitterIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#000000">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
  </svg>
);

const RedditIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF4500">
    <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
  </svg>
);

const VimeoIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#1AB7EA">
    <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197a315.065 315.065 0 003.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
  </svg>
);

const SoundCloudIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FF5500">
    <path d="M1.175 12.225c-.051 0-.094.046-.101.1l-.233 2.154.233 2.105c.007.058.05.098.101.098.05 0 .09-.04.099-.098l.255-2.105-.27-2.154c-.009-.06-.052-.1-.084-.1zm-.899 1.05c-.05 0-.09.04-.098.1l-.2 1.18.2 1.15c.008.06.049.1.098.1.05 0 .091-.04.101-.1l.235-1.15-.235-1.18c-.01-.06-.051-.1-.101-.1zm1.8-.725c-.061 0-.101.039-.111.1l-.21 1.875.21 1.825c.01.061.05.101.111.101.061 0 .111-.04.12-.101l.244-1.825-.244-1.875c-.01-.061-.059-.1-.12-.1zm.899-.39c-.051 0-.111.04-.111.11l-.21 2.265.21 2.205c0 .07.06.11.111.11.061 0 .111-.04.121-.11l.241-2.205-.241-2.265c-.01-.07-.06-.11-.121-.11zm.9-.39c-.051 0-.111.04-.121.11l-.211 2.655.211 2.595c.01.07.07.12.121.12.05 0 .111-.05.121-.12l.232-2.595-.232-2.655c-.01-.07-.071-.11-.121-.11zm.899-.221c-.061 0-.121.05-.131.12l-.2 2.875.2 2.805c.01.07.07.121.131.121.059 0 .121-.051.129-.121l.232-2.805-.232-2.875c-.008-.07-.069-.12-.129-.12zm.9-.06c-.071 0-.131.05-.141.12l-.19 2.935.19 2.865c.01.08.07.131.141.131.07 0 .131-.051.139-.131l.221-2.865-.221-2.935c-.008-.07-.069-.12-.139-.12zm.899.03c-.07 0-.141.05-.149.13l-.18 2.905.18 2.845c.008.08.079.14.149.14.08 0 .141-.06.149-.14l.201-2.845-.201-2.905c-.008-.08-.069-.13-.149-.13zm.9.13c-.08 0-.141.06-.151.14l-.169 2.775.169 2.695c.01.09.071.15.151.15.079 0 .14-.06.15-.15l.19-2.695-.19-2.775c-.01-.08-.071-.14-.15-.14zm.898.3c-.08 0-.149.07-.159.15l-.15 2.475.15 2.395c.01.09.079.16.159.16.081 0 .15-.07.16-.16l.17-2.395-.17-2.475c-.01-.08-.079-.15-.16-.15zm.9.27c-.08 0-.159.07-.169.16l-.14 2.205.14 2.125c.01.09.089.16.169.16.09 0 .16-.07.17-.16l.16-2.125-.16-2.205c-.01-.09-.08-.16-.17-.16zm.898.51c-.089 0-.159.07-.169.16l-.13 1.695.13 1.635c.01.1.08.17.169.17.09 0 .16-.07.17-.17l.149-1.635-.149-1.695c-.01-.09-.08-.16-.17-.16zm5.009-1.18c-.479 0-.94.09-1.37.27-.28-3.16-2.94-5.64-6.19-5.64-1.3 0-2.53.4-3.54 1.14-.42.31-.53.75-.54 1.18v10.95c.01.45.37.82.821.85h10.82c2.04 0 3.69-1.65 3.69-3.69 0-2.04-1.65-3.69-3.69-3.69z"/>
  </svg>
);

const TwitchIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#9146FF">
    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/>
  </svg>
);

const PinterestIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#E60023">
    <path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738.098.119.112.224.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12 0-6.628-5.373-12-12-12z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const SnapchatIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#FFFC00">
    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301a.904.904 0 01.388-.093c.18 0 .36.053.509.18.198.153.29.374.289.619-.009.245-.105.464-.299.619-.221.165-.572.271-.918.377-.27.084-.536.164-.767.262a.84.84 0 00-.326.209c-.097.128-.133.285-.108.485.082.586.186 1.28.31 1.905.126.639.263 1.271.4 1.634.07.206.18.52.313.652.12.124.418.208.696.208h.002c.21 0 .476-.045.727-.202.244-.162.513-.461.793-.93.16-.29.336-.519.527-.674.295-.232.663-.313 1.066-.268.436.052.842.24 1.102.513.244.262.358.595.358.962 0 .407-.151.773-.45 1.084-.358.37-.884.649-1.563.832-.586.172-1.218.275-1.778.335-.04.162-.078.299-.128.389-.068.145-.165.236-.3.266-.165.044-.376.071-.564.071-.177 0-.347-.022-.489-.069-.262-.08-.528-.156-.79-.225a6.68 6.68 0 00-.817-.175c-.37-.051-.673-.063-.842-.063-.15 0-.341.01-.565.043-.321.046-.644.115-.958.196-.345.092-.676.193-.997.304-.163.056-.348.084-.543.084-.171 0-.358-.025-.555-.077-.137-.027-.233-.12-.302-.264-.051-.094-.09-.233-.127-.39-.56-.06-1.193-.163-1.779-.335-.678-.183-1.206-.462-1.563-.832-.299-.31-.45-.677-.45-1.084 0-.367.114-.7.358-.962.26-.273.666-.461 1.102-.513.403-.046.772.036 1.066.268.191.155.368.385.528.674.279.469.548.768.792.93.251.157.518.202.727.202h.002c.278 0 .576-.084.696-.208.134-.132.243-.446.314-.652.137-.363.274-.995.4-1.634.124-.625.228-1.319.31-1.905.025-.2-.01-.357-.108-.485a.84.84 0 00-.325-.209c-.232-.098-.498-.178-.768-.262-.346-.106-.696-.212-.918-.377-.195-.155-.291-.374-.299-.619a.755.755 0 01.289-.619.906.906 0 01.509-.18c.14 0 .27.031.388.093.374.181.733.285 1.033.301.198 0 .326-.045.401-.09a7.05 7.05 0 01-.033-.57c-.105-1.628-.23-3.654.299-4.848 1.58-3.544 4.937-3.82 5.928-3.82l.244-.002z"/>
  </svg>
);

const DailymotionIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0066DC">
    <path d="M14.775 10.8c-1.32 0-2.28.96-2.28 2.4s.96 2.4 2.28 2.4c1.32 0 2.28-.96 2.28-2.4s-.96-2.4-2.28-2.4zM24 18V6c0-3.36-2.64-6-6-6H6C2.64 0 0 2.64 0 6v12c0 3.36 2.64 6 6 6h12c3.36 0 6-2.64 6-6zm-4.8-2.4c0 2.88-2.28 5.28-5.28 5.28-2.88 0-5.28-2.4-5.28-5.28V7.2c0-.48.36-.84.84-.84.48 0 .84.36.84.84v4.56c.72-.84 1.8-1.32 3.12-1.32 2.64 0 4.8 2.16 4.8 4.8v.36h-.04z"/>
  </svg>
);

const BlueskyIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#0085FF">
    <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 01-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z"/>
  </svg>
);

// Tab icons
const CreationsIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 8v4l3 3" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="9"/>
  </svg>
);

const StockIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="3" width="18" height="18" rx="2"/>
    <path d="M9 3v18M3 9h18" strokeLinecap="round"/>
  </svg>
);

const CommunityIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);

// Upload icon (waveform style) - GREEN
const UploadAudioIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 12h2M7 8v8M11 5v14M15 8v8M19 10v4M21 12h2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Cloud download icon for Online File - BLUE (darker pastel)
const OnlineFileIcon = () => (
  <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="#5B8DEF" strokeWidth="1.5">
    <path d="M12 16V8M12 16l-3-3M12 16l3-3" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 16.7428C21.2215 15.734 22 14.2079 22 12.5C22 9.46243 19.5376 7 16.5 7C16.2815 7 16.0771 6.886 15.9661 6.69774C14.6621 4.48484 12.2544 3 9.5 3C5.35786 3 2 6.35786 2 10.5C2 12.5661 2.83545 14.4371 4.18695 15.7935" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

interface AudioFile {
  id: string;
  name: string;
  duration: number;
  url: string;
  created_at: string;
  type: string;
}

type TabType = 'creations' | 'stock' | 'community';

interface AudioLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (audio: { name: string; duration: number; url: string; base64?: string }) => void;
}

interface SelectedFile {
  name: string;
  duration: number;
  url: string;
  source: 'upload' | 'record' | 'media' | 'library';
  id?: string;
}

const AudioLibraryModal: React.FC<AudioLibraryModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<TabType>('creations');
  const [searchQuery, setSearchQuery] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioHistory, setAudioHistory] = useState<AudioFile[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hoveredAudioId, setHoveredAudioId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  
  // Selected file state for right panel display
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null);
  const [isEditingFileName, setIsEditingFileName] = useState(false);
  const [editedFileName, setEditedFileName] = useState('');
  const [isPlayingSelected, setIsPlayingSelected] = useState(false);
  const [hoveredSelectedFile, setHoveredSelectedFile] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const selectedAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recordedBlobRef = useRef<Blob | null>(null);
  const recordingTimeRef = useRef<number>(0);

  // Supported platforms for media extraction
  const socialPlatforms = [
    { icon: YouTubeIcon, name: 'YouTube' },
    { icon: TikTokIcon, name: 'TikTok' },
    { icon: InstagramIcon, name: 'Instagram' },
    { icon: FacebookIcon, name: 'Facebook' },
    { icon: XTwitterIcon, name: 'X' },
    { icon: VimeoIcon, name: 'Vimeo' },
    { icon: SoundCloudIcon, name: 'SoundCloud' },
    { icon: TwitchIcon, name: 'Twitch' },
    { icon: RedditIcon, name: 'Reddit' },
    { icon: PinterestIcon, name: 'Pinterest' },
    { icon: LinkedInIcon, name: 'LinkedIn' },
    { icon: ThreadsIcon, name: 'Threads' },
  ];

  const tabs = [
    { id: 'creations' as TabType, label: 'Creations', icon: CreationsIcon },
    { id: 'stock' as TabType, label: 'Stock', icon: StockIcon },
    { id: 'community' as TabType, label: 'Community', icon: CommunityIcon },
  ];

  // Cleanup function to stop all audio
  const stopAllAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingId(null);
    }
    if (selectedAudioRef.current) {
      selectedAudioRef.current.pause();
      selectedAudioRef.current = null;
      setIsPlayingSelected(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAudioHistory();
      // Reset state
      setSelectedFile(null);
      setMediaUrl('');
      setIsEditingFileName(false);
      setEditedFileName('');
    } else {
      // Stop all audio when modal closes
      stopAllAudio();
    }
    
    // Cleanup on unmount
    return () => {
      stopAllAudio();
    };
  }, [isOpen]);

  const loadAudioHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_voices')
        .select('*')
        .eq('user_id', user.id)
        .in('type', ['uploaded', 'recorded', 'voiceover', 'transcription'])
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAudioHistory(data || []);
    } catch (error) {
      console.error('Error loading audio history:', error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const filteredAudioFiles = audioHistory.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handlePlayPause = (audio: AudioFile, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playingId === audio.id) {
      audioRef.current?.pause();
      setPlayingId(null);
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(audio.url);
      audioRef.current.onended = () => setPlayingId(null);
      audioRef.current.play();
      setPlayingId(audio.id);
    }
  };

  const handleSelectAudio = (audio: AudioFile) => {
    setSelectedFile({
      name: audio.name,
      duration: audio.duration,
      url: audio.url,
      source: 'library',
      id: audio.id,
    });
    setEditedFileName(audio.name);
    setMediaUrl('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/mp3', 'audio/mpeg', 'audio/wav', 'audio/webm', 'audio/ogg', 'audio/m4a', 'audio/mp4'];
    if (!validTypes.some(type => file.type.includes(type.split('/')[1]))) {
      toast({
        title: "Invalid file type",
        description: "Please upload MP3, WAV, or similar audio files",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (20MB max)
    if (file.size > 20 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload files smaller than 20MB",
        variant: "destructive",
      });
      return;
    }

    // Get duration
    const audioUrl = URL.createObjectURL(file);
    const audio = new Audio(audioUrl);
    
    audio.onloadedmetadata = async () => {
      const duration = Math.round(audio.duration);
      
      // Upload immediately and add to history
      setIsUploading(true);
      try {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
        });

        const { data, error } = await supabase.functions.invoke('upload-audio', {
          body: {
            audioData: base64,
            filename: file.name,
            contentType: file.type,
          }
        });

        if (error) throw error;

        // Save to database
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: insertedData } = await supabase.from('user_voices').insert({
            user_id: user.id,
            name: file.name,
            duration: duration,
            url: data.url,
            type: 'uploaded',
          }).select().single();

          // Refresh history to show new file
          await loadAudioHistory();

          // Set as selected file
          setSelectedFile({
            name: file.name,
            duration: duration,
            url: data.url,
            source: 'upload',
            id: insertedData?.id,
          });
          setEditedFileName(file.name);
        }

        toast({
          title: "Upload successful",
          description: "Audio file has been added to your library",
        });
      } catch (error) {
        console.error('Error uploading audio:', error);
        toast({
          title: "Upload failed",
          description: "Failed to upload audio file",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
      }
    };

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredMimeType =
        MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : MediaRecorder.isTypeSupported('audio/ogg')
            ? 'audio/ogg'
            : 'audio/webm';

      const mediaRecorder = new MediaRecorder(stream, { mimeType: preferredMimeType });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const mimeType = mediaRecorder.mimeType || preferredMimeType;
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        recordedBlobRef.current = audioBlob;
        const audioUrl = URL.createObjectURL(audioBlob);
        
        stream.getTracks().forEach(track => track.stop());
        
        // Upload immediately
        setIsUploading(true);
        try {
          const reader = new FileReader();
          reader.readAsDataURL(audioBlob);
          
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
          });

          const filename = `Recording_${new Date().toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          }).replace(/[,:\s]/g, '_')}.webm`;

          const { data, error } = await supabase.functions.invoke('upload-audio', {
            body: {
              audioData: base64,
              filename,
              contentType: audioBlob.type,
            }
          });

          if (error) throw error;

          // Save to database - use ref for accurate duration
          const { data: { user } } = await supabase.auth.getUser();
          const finalDuration = recordingTimeRef.current;
          
          if (user) {
            const { data: insertedData } = await supabase.from('user_voices').insert({
              user_id: user.id,
              name: filename,
              duration: finalDuration,
              url: data.url,
              type: 'recorded',
            }).select().single();

            // Refresh history to show new file
            await loadAudioHistory();

            // Set as selected file
            setSelectedFile({
              name: filename,
              duration: finalDuration,
              url: data.url,
              source: 'record',
              id: insertedData?.id,
            });
            setEditedFileName(filename);
          }

          toast({
            title: "Recording saved",
            description: "Your recording has been added to your library",
          });
        } catch (error) {
          console.error('Error uploading recording:', error);
          toast({
            title: "Upload failed",
            description: "Failed to save recording",
            variant: "destructive",
          });
        } finally {
          setIsUploading(false);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;

      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          recordingTimeRef.current = newTime;
          return newTime;
        });
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to record audio",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const handleRecordClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Check if URL is from a supported platform for extraction
  const isSupportedPlatformUrl = (url: string) => {
    const supportedPlatforms = [
      '9gag', 'akillitv', 'bandcamp', 'bilibili', 'bitchute', 'blogger', 'blogspot',
      'buzzfeed', 'capcut', 'chingari', 'dailymotion', 'douyin', 'espn', 'facebook',
      'fb.watch', 'febspot', 'flickr', 'gaana', 'ifunny', 'imdb', 'imgur', 'instagram',
      'izlesene', 'kickstarter', 'kinemaster', 'kuaishou', 'kwai', 'likee', 'linkedin',
      'mashable', 'mixcloud', 'mxtakatak', 'ok.ru', 'odnoklassniki', 'periscope',
      'pinterest', 'puhutv', 'reddit', 'rumble', 'snapchat', 'soundcloud', 'streamable',
      'ted.com', 'threads', 'tiktok', 'tumblr', 'twitch', 'twitter', 'x.com', 'vimeo',
      'vk', 'weibo', 'xiaohongshu', 'youtube', 'youtu.be', 'zingmp3'
    ];
    const urlLower = url.toLowerCase();
    return supportedPlatforms.some(platform => urlLower.includes(platform));
  };

  const [isExtractingYouTube, setIsExtractingYouTube] = useState(false);

  // Handle URL input change - just validate, don't process yet
  const handleMediaUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setMediaUrl(url);
  };

  // Start background processing for URL transcription
  const handleUrlBackgroundProcess = async () => {
    if (!mediaUrl) return;
    
    // Validate URL
    if (!isSupportedPlatformUrl(mediaUrl)) {
      if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
        toast({
          title: "Unsupported platform",
          description: "This URL is not from a supported platform. Try YouTube, TikTok, Instagram, Facebook, etc.",
          variant: "destructive",
        });
      }
      return;
    }

    setIsExtractingYouTube(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Get auth token for edge function
      const { data: { session } } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      // Step 1: Create a "processing" record immediately
      const { data: insertedData, error: insertError } = await supabase.from('user_voices').insert({
        user_id: user.id,
        name: 'Processing media...',
        duration: 0,
        url: '',
        type: 'transcription',
        status: 'processing',
      }).select().single();

      if (insertError) throw insertError;

      toast({
        title: "Processing started",
        description: "Your audio is being extracted and transcribed in the background. Check creations for progress.",
      });

      // Step 2: Start background processing (fire and forget)
      supabase.functions.invoke('process-url-transcription', {
        body: {
          url: mediaUrl,
          recordId: insertedData.id,
          userId: user.id,
        },
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : undefined,
      }).catch(error => {
        console.error('Background processing error:', error);
      });

      // Step 3: Close modal immediately - processing happens in background
      stopAllAudio();
      setMediaUrl('');
      onClose();

    } catch (error) {
      console.error('Error starting background process:', error);
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Failed to start processing",
        variant: "destructive",
      });
    } finally {
      setIsExtractingYouTube(false);
    }
  };

  const handleDeleteAudio = async (audioId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const { error } = await supabase
        .from('user_voices')
        .delete()
        .eq('id', audioId);

      if (error) throw error;

      setAudioHistory(prev => prev.filter(a => a.id !== audioId));
      
      if (selectedFile?.id === audioId) {
        setSelectedFile(null);
      }

      toast({
        title: "Deleted",
        description: "Audio file removed from library",
      });
    } catch (error) {
      console.error('Error deleting audio:', error);
      toast({
        title: "Delete failed",
        description: "Could not delete audio file",
        variant: "destructive",
      });
    }
  };

  const handleEditAudio = async (audioId: string, newName: string) => {
    try {
      const { error } = await supabase
        .from('user_voices')
        .update({ name: newName })
        .eq('id', audioId);

      if (error) throw error;

      setAudioHistory(prev => prev.map(a => 
        a.id === audioId ? { ...a, name: newName } : a
      ));
      
      if (selectedFile?.id === audioId) {
        setSelectedFile(prev => prev ? { ...prev, name: newName } : null);
      }

      setEditingId(null);
      toast({
        title: "Updated",
        description: "Audio name updated",
      });
    } catch (error) {
      console.error('Error updating audio:', error);
      toast({
        title: "Update failed",
        description: "Could not update audio name",
        variant: "destructive",
      });
    }
  };

  const handlePlaySelectedFile = () => {
    if (!selectedFile) return;
    
    if (isPlayingSelected) {
      selectedAudioRef.current?.pause();
      setIsPlayingSelected(false);
    } else {
      if (selectedAudioRef.current) {
        selectedAudioRef.current.pause();
      }
      selectedAudioRef.current = new Audio(selectedFile.url);
      selectedAudioRef.current.onended = () => setIsPlayingSelected(false);
      selectedAudioRef.current.play();
      setIsPlayingSelected(true);
    }
  };

  const handleClearSelectedFile = () => {
    setSelectedFile(null);
    setEditedFileName('');
    setIsEditingFileName(false);
    if (selectedAudioRef.current) {
      selectedAudioRef.current.pause();
      setIsPlayingSelected(false);
    }
  };

  const handleSaveFileName = async () => {
    if (selectedFile?.id && editedFileName !== selectedFile.name) {
      await handleEditAudio(selectedFile.id, editedFileName);
      setSelectedFile(prev => prev ? { ...prev, name: editedFileName } : null);
    }
    setIsEditingFileName(false);
  };

  const handleUse = async () => {
    // If there's a media URL entered, use background processing
    if (mediaUrl && isSupportedPlatformUrl(mediaUrl)) {
      await handleUrlBackgroundProcess();
      return;
    }

    // Otherwise use the selected file
    if (selectedFile) {
      // Stop any playing audio before closing
      stopAllAudio();
      onSelect({
        name: selectedFile.name,
        duration: selectedFile.duration,
        url: selectedFile.url,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-8 pl-[calc(var(--app-sidebar-width,16rem)+2rem)]">
      {/* Close Button - EXTERIOR of modal */}
      <button
        onClick={onClose}
        className="absolute top-8 right-8 z-[70] p-2 rounded-full bg-white/90 hover:bg-white shadow-lg transition-colors"
      >
        <X className="w-5 h-5 text-gray-600" />
      </button>

      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[1500px] max-h-[92vh] overflow-hidden flex relative">
        {/* Left Panel - Audio Library */}
        <div className="flex-1 border-r border-gray-100 flex flex-col">
          {/* Header */}
          <div className="p-6 pb-0">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Audio Library</h2>
                <p className="text-sm text-gray-500">Upload or Select Audio</p>
              </div>
              
              {/* Search */}
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Audio"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-10 border-b border-gray-100">
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`
                    flex items-center gap-2.5 pb-4 text-sm font-medium transition-colors relative
                    ${activeTab === id 
                      ? 'text-gray-900' 
                      : 'text-gray-500 hover:text-gray-700'
                    }
                  `}
                >
                  <Icon />
                  {label}
                  {activeTab === id && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Audio List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {isLoadingHistory ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : filteredAudioFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <p className="text-sm">No audio files found</p>
              </div>
            ) : (
              filteredAudioFiles.map((audio) => (
                <div
                  key={audio.id}
                  onClick={() => handleSelectAudio(audio)}
                  onMouseEnter={() => setHoveredAudioId(audio.id)}
                  onMouseLeave={() => setHoveredAudioId(null)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer
                    ${selectedFile?.id === audio.id 
                      ? 'bg-emerald-50 border border-emerald-200' 
                      : 'hover:bg-gray-50 border border-transparent'
                    }
                  `}
                >
                  {/* Play Button */}
                  <button
                    onClick={(e) => handlePlayPause(audio, e)}
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                      transition-colors
                      ${playingId === audio.id 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200'
                      }
                    `}
                  >
                    {playingId === audio.id ? (
                      <Pause className="w-4 h-4" fill="currentColor" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                    )}
                  </button>

                  {/* Audio Info */}
                  <div className="flex-1 text-left min-w-0">
                    {editingId === audio.id ? (
                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                          autoFocus
                        />
                        <button
                          onClick={() => handleEditAudio(audio.id, editingName)}
                          className="p-1 text-emerald-600 hover:text-emerald-700"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <h4 className="font-medium text-gray-900 text-sm truncate">{audio.name}</h4>
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDuration(audio.duration)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(audio.created_at)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Edit/Delete Icons - Show on hover */}
                  {hoveredAudioId === audio.id && editingId !== audio.id && (
                    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(audio.id);
                          setEditingName(audio.name);
                        }}
                        className="p-1.5 rounded-md hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleDeleteAudio(audio.id, e)}
                        className="p-1.5 rounded-md hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Panel - Upload Options */}
        <div className="w-[480px] p-6 flex flex-col bg-gray-100">
          {/* Show selected file if exists - Centered in middle */}
          {selectedFile ? (
            <div className="flex-1 flex flex-col justify-center items-center">
              <div 
                className="relative flex flex-col items-center p-6 bg-white border-2 border-emerald-300 rounded-xl w-full max-w-xs"
                onMouseEnter={() => setHoveredSelectedFile(true)}
                onMouseLeave={() => setHoveredSelectedFile(false)}
              >
                {/* Audio Waveform Icon with Play overlay - ABOVE title */}
                <div 
                  className="relative w-20 h-16 rounded-xl bg-blue-100 flex items-center justify-center cursor-pointer overflow-hidden mb-4"
                  onClick={handlePlaySelectedFile}
                >
                  {/* Waveform bars */}
                  <div className="flex items-center gap-[3px] h-full py-3">
                    {[0.4, 0.6, 0.9, 1, 0.7, 0.5, 0.3].map((height, i) => (
                      <div
                        key={i}
                        className={`w-[4px] bg-blue-400 rounded-full transition-all ${
                          isPlayingSelected ? 'animate-pulse' : ''
                        }`}
                        style={{ 
                          height: `${height * 100}%`,
                          animationDelay: isPlayingSelected ? `${i * 0.1}s` : '0s',
                          animationDuration: isPlayingSelected ? '0.5s' : '0s',
                        }}
                      />
                    ))}
                  </div>
                  {hoveredSelectedFile && (
                    <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                      {isPlayingSelected ? (
                        <Pause className="w-6 h-6 text-white" fill="white" />
                      ) : (
                        <Play className="w-6 h-6 text-white ml-0.5" fill="white" />
                      )}
                    </div>
                  )}
                </div>

                {/* File Info - Below icon */}
                <div className="w-full text-center">
                  {isEditingFileName ? (
                    <div className="flex items-center justify-center gap-2">
                      <input
                        type="text"
                        value={editedFileName}
                        onChange={(e) => setEditedFileName(e.target.value)}
                        className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-[180px]"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveFileName}
                        className="p-1 text-emerald-600 hover:text-emerald-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setIsEditingFileName(false);
                          setEditedFileName(selectedFile.name);
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <h4 className="font-medium text-gray-900 text-sm truncate max-w-[200px]">{selectedFile.name}</h4>
                      <button
                        onClick={() => setIsEditingFileName(true)}
                        className="p-1 text-gray-400 hover:text-gray-600 flex-shrink-0"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedFile.duration > 0 ? formatDuration(selectedFile.duration) : 'Duration unknown'}
                  </p>
                </div>

                {/* Delete button - positioned top right */}
                <button
                  onClick={handleClearSelectedFile}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-red-100 hover:bg-red-200 text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {/* Upload Audio Option - 1st */}
              <label
                className={`
                  relative flex flex-col items-center justify-center p-5 
                  border-2 border-dashed rounded-xl cursor-pointer
                  transition-all duration-200 bg-white
                  border-gray-300 hover:border-emerald-400 hover:bg-gray-50
                `}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="audio/*,.mp3,.wav,.m4a,.webm,.mp4"
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={isUploading}
                />
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 bg-emerald-100">
                  {isUploading ? (
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                  ) : (
                    <div className="text-emerald-500">
                      <UploadAudioIcon />
                    </div>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Upload Audio</h3>
                <p className="text-xs text-gray-500">Audio: MP3, WAV Up to 20MB</p>
              </label>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">- or -</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Upload Link Section */}
              <div
                className={`
                  relative overflow-hidden rounded-2xl transition-all duration-300 border-2 border-dashed
                  ${isExtractingYouTube
                    ? 'bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 shadow-lg shadow-purple-500/30 border-transparent'
                    : mediaUrl 
                      ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 shadow-lg shadow-indigo-500/30 border-transparent' 
                      : 'bg-white hover:bg-gray-50 border-gray-300 hover:border-emerald-400'
                  }
                `}
              >
                {/* Animated background pattern - only show when extracting or has URL */}
                {(isExtractingYouTube || mediaUrl) && (
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
                  </div>
                )}

                <div className="relative p-5 flex flex-col items-center">
                  {/* Icon with glow effect */}
                  <div className={`
                    w-16 h-16 rounded-2xl flex items-center justify-center mb-3 
                    ${isExtractingYouTube 
                      ? 'bg-white/20 backdrop-blur-sm' 
                      : mediaUrl
                        ? 'bg-white/10 backdrop-blur-sm'
                        : 'bg-blue-100'
                    }
                    transition-all duration-300
                  `}>
                    {isExtractingYouTube ? (
                      <div className="relative">
                        <Loader2 className="w-7 h-7 text-white animate-spin" />
                        <div className="absolute inset-0 w-7 h-7 bg-white/30 rounded-full blur-md animate-pulse" />
                      </div>
                    ) : (
                      <div className={mediaUrl ? 'text-white' : 'text-blue-500'}>
                        <OnlineFileIcon />
                      </div>
                    )}
                  </div>

                  {/* Title */}
                  <h3 className={`font-bold text-sm mb-0.5 tracking-wide ${isExtractingYouTube || mediaUrl ? 'text-white' : 'text-gray-800'}`}>
                    {isExtractingYouTube ? 'Extracting Audio...' : 'Upload Link'}
                  </h3>
                  <p className={`text-xs text-center mb-4 ${isExtractingYouTube || mediaUrl ? 'text-white/70' : 'text-gray-500'}`}>
                    {isExtractingYouTube ? 'Processing your media' : 'Paste Any Video Link To Extract Audio'}
                  </p>

                  {/* URL Input */}
                  <div className="w-full mb-4 relative">
                    <input
                      type="url"
                      value={mediaUrl}
                      onChange={handleMediaUrlChange}
                      placeholder="Paste URL Here..."
                      disabled={isExtractingYouTube}
                      className={`w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 transition-all text-center disabled:opacity-50 disabled:cursor-not-allowed ${
                        isExtractingYouTube || mediaUrl
                          ? 'bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/50 focus:ring-white/40'
                          : 'bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 focus:ring-blue-400 focus:border-transparent'
                      }`}
                    />
                    {mediaUrl && !isExtractingYouTube && (
                      <button
                        onClick={() => setMediaUrl('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                      >
                        <X className="w-3 h-3 text-white" />
                      </button>
                    )}
                  </div>

                  {/* Supported platforms badge */}
                  <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full mb-3 ${
                    isExtractingYouTube || mediaUrl ? 'bg-white/10 backdrop-blur-sm' : 'bg-gray-100'
                  }`}>
                    <span className={`text-[10px] font-medium ${isExtractingYouTube || mediaUrl ? 'text-white/80' : 'text-gray-500'}`}>Supports 50+ Platforms</span>
                  </div>

                  {/* Social Platform Icons - Stylish row */}
                  <div className="flex items-center justify-center gap-1 flex-wrap max-w-full">
                    {socialPlatforms.slice(0, 8).map(({ icon: Icon, name }) => (
                      <div
                        key={name}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/15 transition-all duration-200 cursor-pointer transform hover:scale-110"
                        title={name}
                      >
                        <div className="[&_svg]:w-4 [&_svg]:h-4 opacity-70 hover:opacity-100 transition-opacity">
                          <Icon />
                        </div>
                      </div>
                    ))}
                    <div className="px-2 py-1 rounded-lg bg-white/10 text-[10px] text-white/60 font-medium">
                      +40
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3 py-1">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">- or -</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Record Audio Option - 3rd */}
              <button
                onClick={handleRecordClick}
                disabled={isUploading}
                className={`
                  relative flex flex-col items-center justify-center p-5 
                  border-2 border-dashed rounded-xl cursor-pointer
                  transition-all duration-200 bg-white
                  ${isRecording
                    ? 'border-red-400 bg-red-50' 
                    : 'border-gray-300 hover:border-emerald-400 hover:bg-gray-50'
                  }
                `}
              >
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 bg-red-100 relative">
                  {isRecording ? (
                    <>
                      {/* Recording animation - pulsing rings */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="absolute w-12 h-12 bg-red-300/30 rounded-full animate-ping" />
                        <div className="absolute w-10 h-10 bg-red-300/50 rounded-full animate-pulse" />
                      </div>
                      {/* Stop icon overlay */}
                      <Square className="w-6 h-6 text-red-500 fill-red-500 relative z-10" />
                    </>
                  ) : (
                    <Mic className="w-8 h-8 text-red-400" />
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm mb-0.5">Record Audio</h3>
                <p className="text-xs text-gray-500">
                  {isRecording ? (
                    <span className="text-red-500 font-medium">Recording... {formatDuration(recordingTime)} - Click to Stop</span>
                  ) : (
                    'Click To Start Recording'
                  )}
                </p>
              </button>
            </div>
          )}

          {/* Use Button - Anchored at bottom */}
          <div className="mt-6 pt-4">
            <button
              onClick={handleUse}
              disabled={(!selectedFile && !mediaUrl) || isUploading || isExtractingYouTube}
              className={`
                w-full py-3 rounded-xl font-semibold text-white
                transition-all duration-200 flex items-center justify-center gap-2
                ${(selectedFile || mediaUrl) && !isUploading && !isExtractingYouTube
                  ? 'bg-emerald-400 hover:bg-emerald-500 active:scale-[0.98] shadow-lg shadow-emerald-400/30'
                  : 'bg-gray-300 cursor-not-allowed'
                }
              `}
            >
              {isUploading || isExtractingYouTube ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {isExtractingYouTube ? 'Starting...' : 'Processing...'}
                </>
              ) : mediaUrl ? (
                'Process & Transcribe'
              ) : (
                'Use'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AudioLibraryModal;
