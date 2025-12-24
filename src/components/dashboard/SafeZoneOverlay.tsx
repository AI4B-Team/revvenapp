import React from 'react';
import { Heart, MessageCircle, Send, Bookmark, Share2, ThumbsUp, MoreHorizontal, Search, Camera, User, Play, Plus, Home, Music } from 'lucide-react';
import { FaInstagram, FaTiktok, FaYoutube, FaFacebookF, FaLinkedin, FaSnapchatGhost, FaWhatsapp } from 'react-icons/fa';

type SafeZoneType = 'none' | 'reels' | 'facebook' | 'tiktok' | 'shorts' | 'linkedin' | 'snapchat';

interface SafeZoneOverlayProps {
  platform: SafeZoneType;
}

// This component renders platform-specific UI overlays to show safe zones
// The semi-transparent areas show where platform UI elements will cover content
const SafeZoneOverlay: React.FC<SafeZoneOverlayProps> = ({ platform }) => {
  if (platform === 'none') return null;

  // Instagram Reels overlay
  if (platform === 'reels') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top - Status bar and header */}
        <div className="absolute top-0 left-0 right-0 bg-black/40">
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-2 text-white text-xs">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-white rounded-sm">
                <div className="w-3/4 h-full bg-white rounded-sm" />
              </div>
            </div>
          </div>
          {/* Reels header */}
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-white font-semibold text-lg">Reels</span>
            <Camera className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Right side - Engagement buttons */}
        <div className="absolute right-3 bottom-[25%] flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <Heart className="w-7 h-7 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">30.2K</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageCircle className="w-7 h-7 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">671</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Send className="w-7 h-7 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">1,054</span>
          </div>
          <MoreHorizontal className="w-7 h-7 text-white drop-shadow-lg" />
        </div>

        {/* Bottom - User info and caption */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-9 h-9 rounded-full bg-gray-400" />
            <span className="text-white font-medium">username</span>
            <button className="px-3 py-1 border border-white rounded-lg text-white text-sm">Follow</button>
          </div>
          <div className="flex items-center gap-2 text-white">
            <Music className="w-4 h-4" />
            <span className="text-sm">Music</span>
          </div>
          <p className="text-white text-sm mt-1">Caption goes here...</p>
          <p className="text-gray-300 text-xs mt-1">Liked by user and 30,240 others</p>
        </div>
      </div>
    );
  }

  // TikTok overlay
  if (platform === 'tiktok') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top - Status bar and tabs */}
        <div className="absolute top-0 left-0 right-0 bg-black/40">
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-2 text-white text-xs">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-white rounded-sm">
                <div className="w-3/4 h-full bg-white rounded-sm" />
              </div>
            </div>
          </div>
          {/* TikTok header */}
          <div className="flex items-center justify-center py-3 gap-4">
            <span className="text-gray-400 font-medium">Following</span>
            <span className="text-white font-semibold">For you</span>
          </div>
        </div>

        {/* Left - Live indicator */}
        <div className="absolute top-20 left-3">
          <div className="px-2 py-1 bg-rose-500 rounded text-white text-xs font-medium">LIVE</div>
        </div>

        {/* Right side - Engagement buttons */}
        <div className="absolute right-3 bottom-[20%] flex flex-col items-center gap-5">
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gray-400 border-2 border-white" />
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center">
              <Plus className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Heart className="w-8 h-8 text-white drop-shadow-lg" fill="white" />
            <span className="text-white text-xs font-medium drop-shadow">145.1K</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">942</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Bookmark className="w-8 h-8 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">6180</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Share2 className="w-8 h-8 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">28.1K</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-white animate-spin-slow" />
        </div>

        {/* Bottom - User info and caption */}
        <div className="absolute bottom-0 left-0 right-14 bg-gradient-to-t from-black/60 to-transparent px-4 py-6">
          <div className="px-2 py-0.5 bg-gray-800/60 rounded text-white text-xs inline-block mb-2">Your friend</div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-white font-semibold">@username</span>
            <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
              </svg>
            </div>
          </div>
          <p className="text-white text-sm">This is a TikTok video with a long description of the video content. #tiktok #viral... more</p>
          <p className="text-gray-300 text-xs mt-1">See translation</p>
        </div>
      </div>
    );
  }

  // YouTube Shorts overlay
  if (platform === 'shorts') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top - Status bar and icons */}
        <div className="absolute top-0 left-0 right-0 bg-black/40">
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-2 text-white text-xs">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-white rounded-sm">
                <div className="w-3/4 h-full bg-white rounded-sm" />
              </div>
            </div>
          </div>
          {/* Top right icons */}
          <div className="flex items-center justify-end gap-4 px-4 py-2">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 3v18H3V3h18zm-2 2H5v14h14V5z"/>
            </svg>
            <Search className="w-6 h-6 text-white" />
            <MoreHorizontal className="w-6 h-6 text-white rotate-90" />
          </div>
        </div>

        {/* Right side - Engagement buttons */}
        <div className="absolute right-3 bottom-[22%] flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <ThumbsUp className="w-8 h-8 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">248</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <ThumbsUp className="w-8 h-8 text-white drop-shadow-lg rotate-180" />
            <span className="text-white text-xs font-medium drop-shadow">Dislike</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">25</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Share2 className="w-8 h-8 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">Share</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <svg className="w-8 h-8 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 4v12m-6-6h12M4 20h16" stroke="currentColor" strokeWidth="2" fill="none"/>
            </svg>
            <span className="text-white text-xs font-medium drop-shadow">Remix</span>
          </div>
          <div className="w-9 h-9 rounded-md bg-gray-400" />
        </div>

        {/* Bottom - User info */}
        <div className="absolute bottom-0 left-0 right-14 bg-gradient-to-t from-black/60 to-transparent px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-400" />
            <span className="text-white font-medium">@youtube</span>
            <button className="px-4 py-1.5 bg-white rounded-full text-black text-sm font-medium">Subscribe</button>
          </div>
          <div className="flex items-center gap-2 text-white mb-1">
            <Play className="w-4 h-4" fill="white" />
            <span className="text-sm">Playlist 1</span>
          </div>
          <p className="text-white text-sm">Youtube shorts interface #youtube #shorts #viral</p>
        </div>
      </div>
    );
  }

  // Facebook overlay
  if (platform === 'facebook') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top - Status bar and header */}
        <div className="absolute top-0 left-0 right-0 bg-black/40">
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-2 text-white text-xs">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-white rounded-sm">
                <div className="w-3/4 h-full bg-white rounded-sm" />
              </div>
            </div>
          </div>
          {/* Facebook header */}
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <div className="flex items-center gap-1 text-white">
                <span className="font-semibold">Reels</span>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Search className="w-6 h-6 text-white" />
              <Camera className="w-6 h-6 text-white" />
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        {/* Right side - Engagement buttons */}
        <div className="absolute right-3 bottom-[22%] flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <ThumbsUp className="w-8 h-8 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">37.9K</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">61</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Share2 className="w-8 h-8 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">768</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <FaWhatsapp className="w-8 h-8 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">Send</span>
          </div>
          <MoreHorizontal className="w-8 h-8 text-white drop-shadow-lg" />
        </div>

        {/* Bottom - User info */}
        <div className="absolute bottom-0 left-0 right-14 bg-gradient-to-t from-black/60 to-transparent px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-400" />
            <span className="text-white font-semibold">Facebook</span>
            <FaInstagram className="w-4 h-4 text-white" />
          </div>
          <p className="text-white text-sm mb-2">This is a Facebook video</p>
          <div className="flex items-center gap-2 text-white">
            <Music className="w-4 h-4" />
            <span className="text-sm">Soundtrack</span>
          </div>
        </div>
      </div>
    );
  }

  // LinkedIn overlay
  if (platform === 'linkedin') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top - Status bar */}
        <div className="absolute top-0 left-0 right-0 bg-black/40">
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-2 text-white text-xs">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-white rounded-sm">
                <div className="w-3/4 h-full bg-white rounded-sm" />
              </div>
            </div>
          </div>
          {/* Top right menu */}
          <div className="flex justify-end px-4 py-2">
            <MoreHorizontal className="w-6 h-6 text-white" />
          </div>
        </div>

        {/* Right side - Engagement buttons */}
        <div className="absolute right-3 bottom-[22%] flex flex-col items-center gap-5">
          <div className="flex flex-col items-center gap-1">
            <ThumbsUp className="w-8 h-8 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">2.1K</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <MessageCircle className="w-8 h-8 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">146</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Share2 className="w-8 h-8 text-white drop-shadow-lg" />
            <span className="text-white text-xs font-medium drop-shadow">0</span>
          </div>
          <Bookmark className="w-8 h-8 text-white drop-shadow-lg" />
        </div>

        {/* Bottom - User info */}
        <div className="absolute bottom-0 left-0 right-14 bg-gradient-to-t from-black/60 to-transparent px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-gray-400" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold">Linkedin</span>
                <button className="px-2 py-0.5 border border-white rounded-full text-white text-xs">Follow</button>
              </div>
              <span className="text-gray-300 text-xs">1,814 followers</span>
            </div>
          </div>
          <p className="text-white text-sm">This is a Linkedin video</p>
          <p className="text-gray-400 text-xs mt-1 text-right">...more</p>
          {/* Progress bar */}
          <div className="w-full h-1 bg-gray-600 rounded-full mt-3">
            <div className="w-1/3 h-full bg-white rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // Snapchat overlay - minimal UI
  if (platform === 'snapchat') {
    return (
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Top - Status bar */}
        <div className="absolute top-0 left-0 right-0 bg-black/30">
          {/* Status bar */}
          <div className="flex items-center justify-between px-4 py-2 text-white text-xs">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 border border-white rounded-sm">
                <div className="w-3/4 h-full bg-white rounded-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Top left - Back button and username */}
        <div className="absolute top-12 left-3 flex items-center gap-2">
          <svg className="w-6 h-6 text-white drop-shadow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-400" />
            <span className="text-white font-medium text-sm drop-shadow">username</span>
          </div>
        </div>

        {/* Top right - Icons */}
        <div className="absolute top-12 right-3 flex items-center gap-3">
          <MoreHorizontal className="w-6 h-6 text-white drop-shadow" />
        </div>

        {/* Bottom - Minimal UI */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/40 to-transparent px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                <Share2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default SafeZoneOverlay;