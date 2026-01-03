import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shapes,
  Search,
  Circle,
  Square,
  Triangle,
  Star,
  Heart,
  Hexagon,
  Pentagon,
  Octagon,
  Plus,
  Minus,
  X,
  Check,
  ChevronRight,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowUpRight,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowDownLeft,
  MoveHorizontal,
  MoveVertical,
  Move,
  CornerDownRight,
  CornerUpRight,
  ArrowBigUp,
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  Undo2,
  Redo2,
  RotateCw,
  Smile,
  Sun,
  Moon,
  Cloud,
  Zap,
  MessageCircle,
  ThumbsUp,
  Music,
  Camera,
  Film,
  Diamond,
  Gem,
  Shield,
  Flag,
  Bookmark,
  Tag,
  Award,
  Crown,
  Sparkles,
  Box,
  FileText,
  Hash,
  // New Icons
  Home,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  User,
  Users,
  Settings,
  Bell,
  Gift,
  Trophy,
  Flame,
  Umbrella,
  Droplet,
  Share2,
  Link,
  Download,
  Upload,
  AlertCircle,
  Info,
  HelpCircle,
  Lock,
  Unlock,
  Eye,
  Image,
  Globe,
  Wifi,
  // Widgets
  Play,
  PlayCircle,
  Video,
  Mic,
  Volume2,
  Radio,
  Podcast,
  FileImage,
  FileVideo,
  FileAudio,
  QrCode,
  ScanLine,
  Timer,
  Hourglass,
  Map,
  Navigation,
  Rss,
  Smartphone,
  Tablet,
  Monitor,
  Tv,
  Code,
  Terminal,
  ExternalLink,
  Layers,
  // Charts
  BarChart,
  BarChart2,
  BarChart3,
  BarChartHorizontal,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  AreaChart,
  Gauge,
  Target,
  // Tables & Data
  Table,
  Table2,
  Grid3X3,
  LayoutGrid,
  Columns,
  Rows,
  List,
  ListOrdered,
  CheckSquare,
  Kanban,
  // Badges
  BadgeCheck,
  BadgeAlert,
  BadgePercent,
  BadgeDollarSign,
  CircleDollarSign,
  Percent,
  AtSign,
  Fingerprint,
  ShieldCheck,
  Verified,
  // Social
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  Github,
  Twitch,
} from 'lucide-react';
import { toast } from 'sonner';

interface Element {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  color: string;
}

interface ElementsPanelProps {
  onAddElement?: (element: Element) => void;
}

const elementCategories = ['All', 'Shapes', 'Lines & Arrows', 'Icons', 'Widgets', 'Charts', 'Tables', 'Stickers', 'Social'];

// Shapes - geometric elements with colors
const shapes: Element[] = [
  { id: 'rect-filled', name: 'Rectangle', category: 'Shapes', icon: <div className="w-full h-3/4 rounded-sm" style={{ backgroundColor: '#8B5CF6' }} />, color: '#8B5CF6' },
  { id: 'rect-rounded', name: 'Rounded Rect', category: 'Shapes', icon: <div className="w-full h-3/4 rounded-lg" style={{ backgroundColor: '#A78BFA' }} />, color: '#A78BFA' },
  { id: 'circle-filled', name: 'Circle', category: 'Shapes', icon: <Circle className="w-full h-full" fill="#3B82F6" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'circle-outline', name: 'Circle Outline', category: 'Shapes', icon: <Circle className="w-full h-full" stroke="#60A5FA" strokeWidth={2} />, color: '#60A5FA' },
  { id: 'square-filled', name: 'Square', category: 'Shapes', icon: <Square className="w-full h-full" fill="#10B981" stroke="#10B981" />, color: '#10B981' },
  { id: 'square-outline', name: 'Square Outline', category: 'Shapes', icon: <Square className="w-full h-full" stroke="#34D399" strokeWidth={2} />, color: '#34D399' },
  { id: 'triangle-filled', name: 'Triangle', category: 'Shapes', icon: <Triangle className="w-full h-full" fill="#F59E0B" stroke="#F59E0B" />, color: '#F59E0B' },
  { id: 'diamond-filled', name: 'Diamond', category: 'Shapes', icon: <Diamond className="w-full h-full" fill="#EC4899" stroke="#EC4899" />, color: '#EC4899' },
  { id: 'pentagon-filled', name: 'Pentagon', category: 'Shapes', icon: <Pentagon className="w-full h-full" fill="#6366F1" stroke="#6366F1" />, color: '#6366F1' },
  { id: 'hexagon-filled', name: 'Hexagon', category: 'Shapes', icon: <Hexagon className="w-full h-full" fill="#14B8A6" stroke="#14B8A6" />, color: '#14B8A6' },
  { id: 'octagon-filled', name: 'Octagon', category: 'Shapes', icon: <Octagon className="w-full h-full" fill="#F97316" stroke="#F97316" />, color: '#F97316' },
  { id: 'star-filled', name: 'Star', category: 'Shapes', icon: <Star className="w-full h-full" fill="#FBBF24" stroke="#FBBF24" />, color: '#FBBF24' },
  { id: 'star-outline', name: 'Star Outline', category: 'Shapes', icon: <Star className="w-full h-full" stroke="#FCD34D" strokeWidth={2} />, color: '#FCD34D' },
  { id: 'heart-filled', name: 'Heart', category: 'Shapes', icon: <Heart className="w-full h-full" fill="#EF4444" stroke="#EF4444" />, color: '#EF4444' },
  { id: 'heart-outline', name: 'Heart Outline', category: 'Shapes', icon: <Heart className="w-full h-full" stroke="#F87171" strokeWidth={2} />, color: '#F87171' },
  { id: 'cube', name: 'Cube', category: 'Shapes', icon: <Box className="w-full h-full" stroke="#8B5CF6" />, color: '#8B5CF6' },
  { id: 'gem-shape', name: 'Gem', category: 'Shapes', icon: <Gem className="w-full h-full" stroke="#EC4899" />, color: '#EC4899' },
  { id: 'shield-shape', name: 'Shield', category: 'Shapes', icon: <Shield className="w-full h-full" fill="#3B82F6" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'flag-shape', name: 'Flag', category: 'Shapes', icon: <Flag className="w-full h-full" fill="#EF4444" stroke="#EF4444" />, color: '#EF4444' },
  { id: 'bookmark-shape', name: 'Bookmark', category: 'Shapes', icon: <Bookmark className="w-full h-full" fill="#F59E0B" stroke="#F59E0B" />, color: '#F59E0B' },
  { id: 'tag-shape', name: 'Tag', category: 'Shapes', icon: <Tag className="w-full h-full" fill="#10B981" stroke="#10B981" />, color: '#10B981' },
  { id: 'award-shape', name: 'Award', category: 'Shapes', icon: <Award className="w-full h-full" stroke="#FBBF24" />, color: '#FBBF24' },
  { id: 'crown-shape', name: 'Crown', category: 'Shapes', icon: <Crown className="w-full h-full" stroke="#FBBF24" />, color: '#FBBF24' },
  { id: 'trophy-shape', name: 'Trophy', category: 'Shapes', icon: <Trophy className="w-full h-full" stroke="#FBBF24" />, color: '#FBBF24' },
];

// Lines & Arrows - combined and consolidated
const linesAndArrows: Element[] = [
  // Lines
  { id: 'line-straight', name: 'Straight Line', category: 'Lines & Arrows', icon: <div className="w-full h-0.5" style={{ backgroundColor: '#6366F1' }} />, color: '#6366F1' },
  { id: 'line-dashed', name: 'Dashed Line', category: 'Lines & Arrows', icon: <div className="w-full h-0.5 border-t-2 border-dashed" style={{ borderColor: '#8B5CF6' }} />, color: '#8B5CF6' },
  { id: 'line-dotted', name: 'Dotted Line', category: 'Lines & Arrows', icon: <div className="w-full h-0.5 border-t-2 border-dotted" style={{ borderColor: '#A855F7' }} />, color: '#A855F7' },
  { id: 'line-curve', name: 'Curve', category: 'Lines & Arrows', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="#EC4899" strokeWidth="2"><path d="M4 20 Q 12 4 20 20" /></svg>, color: '#EC4899' },
  // Arrows
  { id: 'arrow-up', name: 'Arrow Up', category: 'Lines & Arrows', icon: <ArrowUp className="w-full h-full" stroke="#F97316" />, color: '#F97316' },
  { id: 'arrow-down', name: 'Arrow Down', category: 'Lines & Arrows', icon: <ArrowDown className="w-full h-full" stroke="#F97316" />, color: '#F97316' },
  { id: 'arrow-left', name: 'Arrow Left', category: 'Lines & Arrows', icon: <ArrowLeft className="w-full h-full" stroke="#F97316" />, color: '#F97316' },
  { id: 'arrow-right', name: 'Arrow Right', category: 'Lines & Arrows', icon: <ArrowRight className="w-full h-full" stroke="#F97316" />, color: '#F97316' },
  { id: 'arrow-up-right', name: 'Diagonal', category: 'Lines & Arrows', icon: <ArrowUpRight className="w-full h-full" stroke="#FB923C" />, color: '#FB923C' },
  { id: 'arrow-down-right', name: 'Diagonal Down', category: 'Lines & Arrows', icon: <ArrowDownRight className="w-full h-full" stroke="#FB923C" />, color: '#FB923C' },
  { id: 'arrow-up-left', name: 'Up Left', category: 'Lines & Arrows', icon: <ArrowUpLeft className="w-full h-full" stroke="#FB923C" />, color: '#FB923C' },
  { id: 'arrow-down-left', name: 'Down Left', category: 'Lines & Arrows', icon: <ArrowDownLeft className="w-full h-full" stroke="#FB923C" />, color: '#FB923C' },
  { id: 'arrow-horizontal', name: 'Double H', category: 'Lines & Arrows', icon: <MoveHorizontal className="w-full h-full" stroke="#FBBF24" />, color: '#FBBF24' },
  { id: 'arrow-vertical', name: 'Double V', category: 'Lines & Arrows', icon: <MoveVertical className="w-full h-full" stroke="#FBBF24" />, color: '#FBBF24' },
  { id: 'arrow-move', name: 'Move All', category: 'Lines & Arrows', icon: <Move className="w-full h-full" stroke="#FBBF24" />, color: '#FBBF24' },
  { id: 'arrow-corner', name: 'Corner', category: 'Lines & Arrows', icon: <CornerDownRight className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'arrow-corner-up', name: 'Corner Up', category: 'Lines & Arrows', icon: <CornerUpRight className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'arrow-big-up', name: 'Big Up', category: 'Lines & Arrows', icon: <ArrowBigUp className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'arrow-big-down', name: 'Big Down', category: 'Lines & Arrows', icon: <ArrowBigDown className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'arrow-big-left', name: 'Big Left', category: 'Lines & Arrows', icon: <ArrowBigLeft className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'arrow-big-right', name: 'Big Right', category: 'Lines & Arrows', icon: <ArrowBigRight className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'arrow-undo', name: 'Undo', category: 'Lines & Arrows', icon: <Undo2 className="w-full h-full" stroke="#6B7280" />, color: '#6B7280' },
  { id: 'arrow-redo', name: 'Redo', category: 'Lines & Arrows', icon: <Redo2 className="w-full h-full" stroke="#6B7280" />, color: '#6B7280' },
  { id: 'arrow-rotate', name: 'Rotate', category: 'Lines & Arrows', icon: <RotateCw className="w-full h-full" stroke="#6B7280" />, color: '#6B7280' },
  { id: 'chevron', name: 'Chevron', category: 'Lines & Arrows', icon: <ChevronRight className="w-full h-full" stroke="#8B5CF6" />, color: '#8B5CF6' },
];

// Icons - general purpose icons with colors
const icons: Element[] = [
  { id: 'home', name: 'Home', category: 'Icons', icon: <Home className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'mail', name: 'Email', category: 'Icons', icon: <Mail className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'phone', name: 'Phone', category: 'Icons', icon: <Phone className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'location', name: 'Location', category: 'Icons', icon: <MapPin className="w-full h-full" stroke="#EF4444" />, color: '#EF4444' },
  { id: 'calendar', name: 'Calendar', category: 'Icons', icon: <Calendar className="w-full h-full" stroke="#8B5CF6" />, color: '#8B5CF6' },
  { id: 'clock', name: 'Clock', category: 'Icons', icon: <Clock className="w-full h-full" stroke="#F59E0B" />, color: '#F59E0B' },
  { id: 'user', name: 'User', category: 'Icons', icon: <User className="w-full h-full" stroke="#6366F1" />, color: '#6366F1' },
  { id: 'users', name: 'Team', category: 'Icons', icon: <Users className="w-full h-full" stroke="#6366F1" />, color: '#6366F1' },
  { id: 'settings', name: 'Settings', category: 'Icons', icon: <Settings className="w-full h-full" stroke="#6B7280" />, color: '#6B7280' },
  { id: 'bell', name: 'Notification', category: 'Icons', icon: <Bell className="w-full h-full" stroke="#FBBF24" />, color: '#FBBF24' },
  { id: 'gift', name: 'Gift', category: 'Icons', icon: <Gift className="w-full h-full" stroke="#EC4899" />, color: '#EC4899' },
  { id: 'smile', name: 'Smile', category: 'Icons', icon: <Smile className="w-full h-full" stroke="#FBBF24" />, color: '#FBBF24' },
  { id: 'sun', name: 'Sun', category: 'Icons', icon: <Sun className="w-full h-full" stroke="#F59E0B" />, color: '#F59E0B' },
  { id: 'moon', name: 'Moon', category: 'Icons', icon: <Moon className="w-full h-full" stroke="#6366F1" />, color: '#6366F1' },
  { id: 'cloud', name: 'Cloud', category: 'Icons', icon: <Cloud className="w-full h-full" stroke="#60A5FA" />, color: '#60A5FA' },
  { id: 'zap', name: 'Lightning', category: 'Icons', icon: <Zap className="w-full h-full" stroke="#FBBF24" />, color: '#FBBF24' },
  { id: 'flame', name: 'Fire', category: 'Icons', icon: <Flame className="w-full h-full" stroke="#F97316" />, color: '#F97316' },
  { id: 'sparkles', name: 'Sparkles', category: 'Icons', icon: <Sparkles className="w-full h-full" stroke="#A855F7" />, color: '#A855F7' },
  { id: 'umbrella', name: 'Umbrella', category: 'Icons', icon: <Umbrella className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'droplet', name: 'Water Drop', category: 'Icons', icon: <Droplet className="w-full h-full" stroke="#06B6D4" />, color: '#06B6D4' },
  { id: 'message', name: 'Message', category: 'Icons', icon: <MessageCircle className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'thumbs-up', name: 'Like', category: 'Icons', icon: <ThumbsUp className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'share', name: 'Share', category: 'Icons', icon: <Share2 className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'link', name: 'Link', category: 'Icons', icon: <Link className="w-full h-full" stroke="#6366F1" />, color: '#6366F1' },
  { id: 'download', name: 'Download', category: 'Icons', icon: <Download className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'upload', name: 'Upload', category: 'Icons', icon: <Upload className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'check', name: 'Checkmark', category: 'Icons', icon: <Check className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'x-icon', name: 'Close', category: 'Icons', icon: <X className="w-full h-full" stroke="#EF4444" />, color: '#EF4444' },
  { id: 'plus', name: 'Plus', category: 'Icons', icon: <Plus className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'minus', name: 'Minus', category: 'Icons', icon: <Minus className="w-full h-full" stroke="#EF4444" />, color: '#EF4444' },
  { id: 'alert', name: 'Alert', category: 'Icons', icon: <AlertCircle className="w-full h-full" stroke="#F59E0B" />, color: '#F59E0B' },
  { id: 'info', name: 'Info', category: 'Icons', icon: <Info className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'help', name: 'Help', category: 'Icons', icon: <HelpCircle className="w-full h-full" stroke="#8B5CF6" />, color: '#8B5CF6' },
  { id: 'lock', name: 'Lock', category: 'Icons', icon: <Lock className="w-full h-full" stroke="#6B7280" />, color: '#6B7280' },
  { id: 'unlock', name: 'Unlock', category: 'Icons', icon: <Unlock className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'eye', name: 'View', category: 'Icons', icon: <Eye className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'camera', name: 'Camera', category: 'Icons', icon: <Camera className="w-full h-full" stroke="#8B5CF6" />, color: '#8B5CF6' },
  { id: 'image', name: 'Image', category: 'Icons', icon: <Image className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'music', name: 'Music', category: 'Icons', icon: <Music className="w-full h-full" stroke="#EC4899" />, color: '#EC4899' },
  { id: 'film', name: 'Film', category: 'Icons', icon: <Film className="w-full h-full" stroke="#14B8A6" />, color: '#14B8A6' },
  { id: 'globe', name: 'Globe', category: 'Icons', icon: <Globe className="w-full h-full" stroke="#06B6D4" />, color: '#06B6D4' },
  { id: 'wifi', name: 'WiFi', category: 'Icons', icon: <Wifi className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
];

// Widgets - interactive/media elements
const widgets: Element[] = [
  { id: 'video-player', name: 'Video Player', category: 'Widgets', icon: <PlayCircle className="w-full h-full" stroke="#EF4444" />, color: '#EF4444' },
  { id: 'video-embed', name: 'Video Embed', category: 'Widgets', icon: <Video className="w-full h-full" stroke="#EC4899" />, color: '#EC4899' },
  { id: 'play-button', name: 'Play Button', category: 'Widgets', icon: <Play className="w-full h-full" stroke="#10B981" fill="#10B981" />, color: '#10B981' },
  { id: 'audio-player', name: 'Audio Player', category: 'Widgets', icon: <Volume2 className="w-full h-full" stroke="#A855F7" />, color: '#A855F7' },
  { id: 'podcast', name: 'Podcast', category: 'Widgets', icon: <Podcast className="w-full h-full" stroke="#F97316" />, color: '#F97316' },
  { id: 'microphone', name: 'Microphone', category: 'Widgets', icon: <Mic className="w-full h-full" stroke="#EF4444" />, color: '#EF4444' },
  { id: 'radio', name: 'Radio', category: 'Widgets', icon: <Radio className="w-full h-full" stroke="#8B5CF6" />, color: '#8B5CF6' },
  { id: 'document', name: 'Document', category: 'Widgets', icon: <FileText className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'image-gallery', name: 'Image Gallery', category: 'Widgets', icon: <FileImage className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'video-file', name: 'Video File', category: 'Widgets', icon: <FileVideo className="w-full h-full" stroke="#EC4899" />, color: '#EC4899' },
  { id: 'audio-file', name: 'Audio File', category: 'Widgets', icon: <FileAudio className="w-full h-full" stroke="#A855F7" />, color: '#A855F7' },
  { id: 'qr-code', name: 'QR Code', category: 'Widgets', icon: <QrCode className="w-full h-full" stroke="#1F2937" />, color: '#1F2937' },
  { id: 'barcode', name: 'Barcode', category: 'Widgets', icon: <ScanLine className="w-full h-full" stroke="#1F2937" />, color: '#1F2937' },
  { id: 'countdown', name: 'Countdown', category: 'Widgets', icon: <Timer className="w-full h-full" stroke="#EF4444" />, color: '#EF4444' },
  { id: 'hourglass', name: 'Hourglass', category: 'Widgets', icon: <Hourglass className="w-full h-full" stroke="#FBBF24" />, color: '#FBBF24' },
  { id: 'map', name: 'Map Embed', category: 'Widgets', icon: <Map className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'navigation', name: 'Navigation', category: 'Widgets', icon: <Navigation className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'rss', name: 'RSS Feed', category: 'Widgets', icon: <Rss className="w-full h-full" stroke="#F97316" />, color: '#F97316' },
  { id: 'mobile-frame', name: 'Mobile Frame', category: 'Widgets', icon: <Smartphone className="w-full h-full" stroke="#6366F1" />, color: '#6366F1' },
  { id: 'tablet-frame', name: 'Tablet Frame', category: 'Widgets', icon: <Tablet className="w-full h-full" stroke="#6366F1" />, color: '#6366F1' },
  { id: 'desktop-frame', name: 'Desktop Frame', category: 'Widgets', icon: <Monitor className="w-full h-full" stroke="#6366F1" />, color: '#6366F1' },
  { id: 'tv-frame', name: 'TV Frame', category: 'Widgets', icon: <Tv className="w-full h-full" stroke="#6366F1" />, color: '#6366F1' },
  { id: 'code-embed', name: 'Code Block', category: 'Widgets', icon: <Code className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'terminal', name: 'Terminal', category: 'Widgets', icon: <Terminal className="w-full h-full" stroke="#1F2937" />, color: '#1F2937' },
  { id: 'external-link', name: 'Link Button', category: 'Widgets', icon: <ExternalLink className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'layers', name: 'Layer Stack', category: 'Widgets', icon: <Layers className="w-full h-full" stroke="#8B5CF6" />, color: '#8B5CF6' },
];

// Charts - data visualization
const charts: Element[] = [
  { id: 'bar-chart', name: 'Bar Chart', category: 'Charts', icon: <BarChart className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'bar-chart-alt', name: 'Bar Chart 2', category: 'Charts', icon: <BarChart2 className="w-full h-full" stroke="#14B8A6" />, color: '#14B8A6' },
  { id: 'bar-chart-stacked', name: 'Stacked Bar', category: 'Charts', icon: <BarChart3 className="w-full h-full" stroke="#06B6D4" />, color: '#06B6D4' },
  { id: 'bar-chart-h', name: 'Horizontal Bar', category: 'Charts', icon: <BarChartHorizontal className="w-full h-full" stroke="#0EA5E9" />, color: '#0EA5E9' },
  { id: 'line-chart', name: 'Line Chart', category: 'Charts', icon: <LineChart className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'area-chart', name: 'Area Chart', category: 'Charts', icon: <AreaChart className="w-full h-full" stroke="#6366F1" />, color: '#6366F1' },
  { id: 'pie-chart', name: 'Pie Chart', category: 'Charts', icon: <PieChart className="w-full h-full" stroke="#A855F7" />, color: '#A855F7' },
  { id: 'donut-chart', name: 'Donut Chart', category: 'Charts', icon: <PieChart className="w-full h-full" stroke="#EC4899" />, color: '#EC4899' },
  { id: 'trending-up', name: 'Growth', category: 'Charts', icon: <TrendingUp className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'trending-down', name: 'Decline', category: 'Charts', icon: <TrendingDown className="w-full h-full" stroke="#EF4444" />, color: '#EF4444' },
  { id: 'activity', name: 'Activity', category: 'Charts', icon: <Activity className="w-full h-full" stroke="#F97316" />, color: '#F97316' },
  { id: 'gauge', name: 'Gauge', category: 'Charts', icon: <Gauge className="w-full h-full" stroke="#8B5CF6" />, color: '#8B5CF6' },
  { id: 'target', name: 'Target', category: 'Charts', icon: <Target className="w-full h-full" stroke="#EF4444" />, color: '#EF4444' },
];

// Tables - consolidated (removed duplicates like sheets/tables)
const tables: Element[] = [
  { id: 'data-table', name: 'Data Table', category: 'Tables', icon: <Table className="w-full h-full" stroke="#6366F1" />, color: '#6366F1' },
  { id: 'simple-table', name: 'Simple Table', category: 'Tables', icon: <Table2 className="w-full h-full" stroke="#8B5CF6" />, color: '#8B5CF6' },
  { id: 'grid', name: 'Grid', category: 'Tables', icon: <Grid3X3 className="w-full h-full" stroke="#A855F7" />, color: '#A855F7' },
  { id: 'card-grid', name: 'Card Grid', category: 'Tables', icon: <LayoutGrid className="w-full h-full" stroke="#EC4899" />, color: '#EC4899' },
  { id: 'columns', name: 'Columns', category: 'Tables', icon: <Columns className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'rows', name: 'Rows', category: 'Tables', icon: <Rows className="w-full h-full" stroke="#6366F1" />, color: '#6366F1' },
  { id: 'kanban', name: 'Kanban Board', category: 'Tables', icon: <Kanban className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'bullet-list', name: 'Bullet List', category: 'Tables', icon: <List className="w-full h-full" stroke="#6B7280" />, color: '#6B7280' },
  { id: 'numbered-list', name: 'Numbered List', category: 'Tables', icon: <ListOrdered className="w-full h-full" stroke="#6B7280" />, color: '#6B7280' },
  { id: 'checklist', name: 'Checklist', category: 'Tables', icon: <CheckSquare className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
];

// Stickers - emoji style elements
const stickers: Element[] = [
  { id: 'sticker-fire', name: 'Fire', category: 'Stickers', icon: <span className="text-2xl">🔥</span>, color: 'transparent' },
  { id: 'sticker-100', name: '100', category: 'Stickers', icon: <span className="text-2xl">💯</span>, color: 'transparent' },
  { id: 'sticker-rocket', name: 'Rocket', category: 'Stickers', icon: <span className="text-2xl">🚀</span>, color: 'transparent' },
  { id: 'sticker-star', name: 'Star', category: 'Stickers', icon: <span className="text-2xl">⭐</span>, color: 'transparent' },
  { id: 'sticker-sparkle', name: 'Sparkle', category: 'Stickers', icon: <span className="text-2xl">✨</span>, color: 'transparent' },
  { id: 'sticker-heart', name: 'Heart', category: 'Stickers', icon: <span className="text-2xl">❤️</span>, color: 'transparent' },
  { id: 'sticker-clap', name: 'Clap', category: 'Stickers', icon: <span className="text-2xl">👏</span>, color: 'transparent' },
  { id: 'sticker-eyes', name: 'Eyes', category: 'Stickers', icon: <span className="text-2xl">👀</span>, color: 'transparent' },
  { id: 'sticker-party', name: 'Party', category: 'Stickers', icon: <span className="text-2xl">🎉</span>, color: 'transparent' },
  { id: 'sticker-money', name: 'Money', category: 'Stickers', icon: <span className="text-2xl">💰</span>, color: 'transparent' },
  { id: 'sticker-crown', name: 'Crown', category: 'Stickers', icon: <span className="text-2xl">👑</span>, color: 'transparent' },
  { id: 'sticker-brain', name: 'Brain', category: 'Stickers', icon: <span className="text-2xl">🧠</span>, color: 'transparent' },
  { id: 'sticker-bulb', name: 'Idea', category: 'Stickers', icon: <span className="text-2xl">💡</span>, color: 'transparent' },
  { id: 'sticker-target', name: 'Target', category: 'Stickers', icon: <span className="text-2xl">🎯</span>, color: 'transparent' },
  { id: 'sticker-trophy', name: 'Trophy', category: 'Stickers', icon: <span className="text-2xl">🏆</span>, color: 'transparent' },
  { id: 'sticker-medal', name: 'Medal', category: 'Stickers', icon: <span className="text-2xl">🏅</span>, color: 'transparent' },
  { id: 'sticker-gem', name: 'Gem', category: 'Stickers', icon: <span className="text-2xl">💎</span>, color: 'transparent' },
  { id: 'sticker-check', name: 'Check', category: 'Stickers', icon: <span className="text-2xl">✅</span>, color: 'transparent' },
  { id: 'sticker-x', name: 'X Mark', category: 'Stickers', icon: <span className="text-2xl">❌</span>, color: 'transparent' },
  { id: 'sticker-wave', name: 'Wave', category: 'Stickers', icon: <span className="text-2xl">👋</span>, color: 'transparent' },
  // Badges
  { id: 'badge-check', name: 'Verified', category: 'Stickers', icon: <BadgeCheck className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'badge-alert', name: 'Alert Badge', category: 'Stickers', icon: <BadgeAlert className="w-full h-full" stroke="#EF4444" />, color: '#EF4444' },
  { id: 'badge-percent', name: 'Discount', category: 'Stickers', icon: <BadgePercent className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'badge-dollar', name: 'Price', category: 'Stickers', icon: <BadgeDollarSign className="w-full h-full" stroke="#FBBF24" />, color: '#FBBF24' },
  { id: 'dollar-circle', name: 'Money', category: 'Stickers', icon: <CircleDollarSign className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'percent', name: 'Percent', category: 'Stickers', icon: <Percent className="w-full h-full" stroke="#EF4444" />, color: '#EF4444' },
  { id: 'hashtag', name: 'Hashtag', category: 'Stickers', icon: <Hash className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
  { id: 'at-sign', name: 'Mention', category: 'Stickers', icon: <AtSign className="w-full h-full" stroke="#EC4899" />, color: '#EC4899' },
  { id: 'fingerprint', name: 'Fingerprint', category: 'Stickers', icon: <Fingerprint className="w-full h-full" stroke="#6366F1" />, color: '#6366F1' },
  { id: 'shield-check', name: 'Shield', category: 'Stickers', icon: <ShieldCheck className="w-full h-full" stroke="#10B981" />, color: '#10B981' },
  { id: 'verified', name: 'Verified Mark', category: 'Stickers', icon: <Verified className="w-full h-full" stroke="#3B82F6" />, color: '#3B82F6' },
];

// Social Media Icons
const social: Element[] = [
  { id: 'facebook', name: 'Facebook', category: 'Social', icon: <Facebook className="w-full h-full" stroke="#1877F2" />, color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', category: 'Social', icon: <Instagram className="w-full h-full" stroke="#E4405F" />, color: '#E4405F' },
  { id: 'twitter', name: 'X / Twitter', category: 'Social', icon: <Twitter className="w-full h-full" stroke="#1DA1F2" />, color: '#1DA1F2' },
  { id: 'linkedin', name: 'LinkedIn', category: 'Social', icon: <Linkedin className="w-full h-full" stroke="#0A66C2" />, color: '#0A66C2' },
  { id: 'youtube', name: 'YouTube', category: 'Social', icon: <Youtube className="w-full h-full" stroke="#FF0000" />, color: '#FF0000' },
  { id: 'github', name: 'GitHub', category: 'Social', icon: <Github className="w-full h-full" stroke="#181717" />, color: '#181717' },
  { id: 'twitch', name: 'Twitch', category: 'Social', icon: <Twitch className="w-full h-full" stroke="#9146FF" />, color: '#9146FF' },
];

const allElements = [...shapes, ...linesAndArrows, ...icons, ...widgets, ...charts, ...tables, ...stickers, ...social];

const groupedElements: Record<string, Element[]> = {
  Shapes: shapes,
  'Lines & Arrows': linesAndArrows,
  Icons: icons,
  Widgets: widgets,
  Charts: charts,
  Tables: tables,
  Stickers: stickers,
  Social: social,
};

const ElementsPanel: React.FC<ElementsPanelProps> = ({ onAddElement }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addedElements, setAddedElements] = useState<Set<string>>(new Set());

  const filteredElements = allElements.filter((el) => {
    const matchesSearch = el.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || el.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addElement = (element: Element) => {
    setAddedElements((prev) => new Set([...prev, element.id]));
    toast.success(`Added "${element.name}" to canvas`);

    if (onAddElement) {
      onAddElement(element);
    }

    setTimeout(() => {
      setAddedElements((prev) => {
        const next = new Set(prev);
        next.delete(element.id);
        return next;
      });
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Elements"
          className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {elementCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              selectedCategory === cat
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Elements */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {selectedCategory === 'All' ? (
          Object.entries(groupedElements).map(([category, elements]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3 flex items-center gap-2">
                {category}
                <span className="text-xs font-normal text-gray-400">({elements.length})</span>
              </h4>
              <div className="grid grid-cols-4 gap-2">
                {elements.map((element) => (
                  <motion.button
                    key={element.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addElement(element)}
                    draggable
                    onDragStart={(e) => {
                      const dragEvent = e as unknown as React.DragEvent;
                      dragEvent.dataTransfer?.setData(
                        'application/json',
                        JSON.stringify({ type: 'element', ...element })
                      );
                    }}
                    className={`aspect-square rounded-xl flex items-center justify-center transition-all relative ${
                      addedElements.has(element.id)
                        ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                    title={element.name}
                  >
                    <div className="w-6 h-6">{element.icon}</div>
                    {addedElements.has(element.id) && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <Check className="w-2.5 h-2.5 text-white" />
                      </motion.div>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {filteredElements.map((element) => (
              <motion.button
                key={element.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => addElement(element)}
                draggable
                onDragStart={(e) => {
                  const dragEvent = e as unknown as React.DragEvent;
                  dragEvent.dataTransfer?.setData(
                    'application/json',
                    JSON.stringify({ type: 'element', ...element })
                  );
                }}
                className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative ${
                  addedElements.has(element.id)
                    ? 'bg-green-100 dark:bg-green-900/30 ring-2 ring-green-500'
                    : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title={element.name}
              >
                <div className="w-6 h-6">{element.icon}</div>
                <span className="text-[9px] text-gray-500 dark:text-gray-400 truncate max-w-full px-1">{element.name}</span>
                {addedElements.has(element.id) && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <Check className="w-2.5 h-2.5 text-white" />
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        )}
        
        {filteredElements.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <p className="text-sm">No elements found</p>
            <p className="text-xs mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Tip */}
      <div className="mt-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-xs text-blue-700 dark:text-blue-300 flex items-center gap-2">
        <Shapes className="w-4 h-4" />
        Drag elements to canvas or click to add
      </div>
    </div>
  );
};

export default ElementsPanel;
