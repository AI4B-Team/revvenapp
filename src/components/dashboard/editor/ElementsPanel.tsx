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
  Divide,
  Equal,
  ChevronRight,
  ChevronLeft,
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
  CornerDownLeft,
  CornerUpRight,
  CornerUpLeft,
  CornerRightDown,
  CornerLeftDown,
  CornerRightUp,
  CornerLeftUp,
  ArrowBigUp,
  ArrowBigDown,
  ArrowBigLeft,
  ArrowBigRight,
  Undo2,
  Redo2,
  RefreshCw,
  RotateCw,
  RotateCcw,
  Check,
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
  Ribbon,
  Award,
  Crown,
  Sparkles,
  Cylinder,
  Box,
  Scroll,
  FileText,
  Braces,
  Parentheses,
  Slash,
  Grip,
  GripVertical,
  Merge,
  Split,
  GitBranch,
  GitMerge,
  Workflow,
  Crosshair,
  Target,
  CircleDot,
  CircleDashed,
  SquareDashed,
  Hash,
} from 'lucide-react';
import { toast } from 'sonner';

interface Element {
  id: string;
  name: string;
  category: string;
  subcategory?: string;
  icon: React.ReactNode;
  color: string;
}

interface ElementsPanelProps {
  onAddElement?: (element: Element) => void;
}

const elementCategories = ['All', 'Lines', 'Arrows', 'Basic Shapes', 'Signs', 'Icons', 'Stickers'];

// Line shapes
const lines: Element[] = [
  { id: 'line-straight', name: 'Straight Line', category: 'Lines', icon: <div className="w-full h-0.5 bg-current" />, color: '#6B7280' },
  { id: 'line-dashed', name: 'Dashed Line', category: 'Lines', icon: <div className="w-full h-0.5 border-t-2 border-dashed border-current" />, color: '#6B7280' },
  { id: 'line-dotted', name: 'Dotted Line', category: 'Lines', icon: <div className="w-full h-0.5 border-t-2 border-dotted border-current" />, color: '#6B7280' },
  { id: 'line-curve', name: 'Curve', category: 'Lines', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20 Q 12 4 20 20" /></svg>, color: '#6B7280' },
  { id: 'line-arc-left', name: 'Arc Left', category: 'Lines', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4 Q 4 20 20 20" /></svg>, color: '#6B7280' },
  { id: 'line-arc-right', name: 'Arc Right', category: 'Lines', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 4 Q 20 20 4 20" /></svg>, color: '#6B7280' },
  { id: 'line-s-curve', name: 'S Curve', category: 'Lines', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4 Q 12 4 12 12 Q 12 20 20 20" /></svg>, color: '#6B7280' },
  { id: 'line-wave', name: 'Wave', category: 'Lines', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12 Q 6 4 10 12 Q 14 20 18 12 Q 22 4 22 12" /></svg>, color: '#6B7280' },
  { id: 'line-angle-right', name: 'Angle Right', category: 'Lines', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4 L 4 20 L 20 20" /></svg>, color: '#6B7280' },
  { id: 'line-angle-left', name: 'Angle Left', category: 'Lines', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 4 L 20 20 L 4 20" /></svg>, color: '#6B7280' },
  { id: 'line-zigzag', name: 'Zigzag', category: 'Lines', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 18 L 8 6 L 14 18 L 20 6 L 22 12" /></svg>, color: '#6B7280' },
  { id: 'line-step', name: 'Step Line', category: 'Lines', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4 L 4 12 L 12 12 L 12 20 L 20 20" /></svg>, color: '#6B7280' },
];

// Arrow shapes - expanded
const arrows: Element[] = [
  { id: 'arrow-up', name: 'Arrow Up', category: 'Arrows', icon: <ArrowUp className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-down', name: 'Arrow Down', category: 'Arrows', icon: <ArrowDown className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-left', name: 'Arrow Left', category: 'Arrows', icon: <ArrowLeft className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-right', name: 'Arrow Right', category: 'Arrows', icon: <ArrowRight className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-horizontal', name: 'Horizontal', category: 'Arrows', icon: <MoveHorizontal className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-vertical', name: 'Vertical', category: 'Arrows', icon: <MoveVertical className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-big-up', name: 'Big Arrow Up', category: 'Arrows', icon: <ArrowBigUp className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-big-down', name: 'Big Arrow Down', category: 'Arrows', icon: <ArrowBigDown className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-big-left', name: 'Big Arrow Left', category: 'Arrows', icon: <ArrowBigLeft className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-big-right', name: 'Big Arrow Right', category: 'Arrows', icon: <ArrowBigRight className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-up-right', name: 'Up Right', category: 'Arrows', icon: <ArrowUpRight className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-up-left', name: 'Up Left', category: 'Arrows', icon: <ArrowUpLeft className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-down-right', name: 'Down Right', category: 'Arrows', icon: <ArrowDownRight className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-down-left', name: 'Down Left', category: 'Arrows', icon: <ArrowDownLeft className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-move', name: 'Move All', category: 'Arrows', icon: <Move className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-corner-dr', name: 'Corner Down Right', category: 'Arrows', icon: <CornerDownRight className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-corner-dl', name: 'Corner Down Left', category: 'Arrows', icon: <CornerDownLeft className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-corner-ur', name: 'Corner Up Right', category: 'Arrows', icon: <CornerUpRight className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-corner-ul', name: 'Corner Up Left', category: 'Arrows', icon: <CornerUpLeft className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-corner-rd', name: 'Right Down', category: 'Arrows', icon: <CornerRightDown className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-corner-ld', name: 'Left Down', category: 'Arrows', icon: <CornerLeftDown className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-corner-ru', name: 'Right Up', category: 'Arrows', icon: <CornerRightUp className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-corner-lu', name: 'Left Up', category: 'Arrows', icon: <CornerLeftUp className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-undo', name: 'Undo', category: 'Arrows', icon: <Undo2 className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-redo', name: 'Redo', category: 'Arrows', icon: <Redo2 className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-refresh', name: 'Refresh', category: 'Arrows', icon: <RefreshCw className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-rotate-cw', name: 'Rotate CW', category: 'Arrows', icon: <RotateCw className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-rotate-ccw', name: 'Rotate CCW', category: 'Arrows', icon: <RotateCcw className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-merge', name: 'Merge', category: 'Arrows', icon: <Merge className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-split', name: 'Split', category: 'Arrows', icon: <Split className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-branch', name: 'Branch', category: 'Arrows', icon: <GitBranch className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-git-merge', name: 'Git Merge', category: 'Arrows', icon: <GitMerge className="w-full h-full" />, color: '#6B7280' },
  { id: 'arrow-workflow', name: 'Workflow', category: 'Arrows', icon: <Workflow className="w-full h-full" />, color: '#6B7280' },
];

// Basic Shapes - expanded
const shapes: Element[] = [
  // Filled shapes
  { id: 'rect-filled', name: 'Rectangle', category: 'Basic Shapes', icon: <div className="w-full h-3/4 bg-current rounded-sm" />, color: '#6B7280' },
  { id: 'rect-outline', name: 'Rect Outline', category: 'Basic Shapes', icon: <div className="w-full h-3/4 border-2 border-current rounded-sm" />, color: '#6B7280' },
  { id: 'rect-rounded', name: 'Rounded Rect', category: 'Basic Shapes', icon: <div className="w-full h-3/4 bg-current rounded-lg" />, color: '#6B7280' },
  { id: 'circle-filled', name: 'Circle', category: 'Basic Shapes', icon: <Circle className="w-full h-full" fill="currentColor" />, color: '#6B7280' },
  { id: 'circle-outline', name: 'Circle Outline', category: 'Basic Shapes', icon: <Circle className="w-full h-full" />, color: '#6B7280' },
  { id: 'circle-half', name: 'Half Circle', category: 'Basic Shapes', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M12 2A10 10 0 0 1 12 22 Z" /></svg>, color: '#6B7280' },
  { id: 'oval-filled', name: 'Oval', category: 'Basic Shapes', icon: <div className="w-full h-2/3 bg-current rounded-full" />, color: '#6B7280' },
  { id: 'oval-outline', name: 'Oval Outline', category: 'Basic Shapes', icon: <div className="w-full h-2/3 border-2 border-current rounded-full" />, color: '#6B7280' },
  { id: 'square-filled', name: 'Square', category: 'Basic Shapes', icon: <Square className="w-full h-full" fill="currentColor" />, color: '#6B7280' },
  { id: 'square-outline', name: 'Square Outline', category: 'Basic Shapes', icon: <Square className="w-full h-full" />, color: '#6B7280' },
  { id: 'square-dashed', name: 'Dashed Square', category: 'Basic Shapes', icon: <SquareDashed className="w-full h-full" />, color: '#6B7280' },
  { id: 'triangle-filled', name: 'Triangle', category: 'Basic Shapes', icon: <Triangle className="w-full h-full" fill="currentColor" />, color: '#6B7280' },
  { id: 'triangle-outline', name: 'Triangle Outline', category: 'Basic Shapes', icon: <Triangle className="w-full h-full" />, color: '#6B7280' },
  { id: 'diamond-filled', name: 'Diamond', category: 'Basic Shapes', icon: <Diamond className="w-full h-full" fill="currentColor" />, color: '#6B7280' },
  { id: 'diamond-outline', name: 'Diamond Outline', category: 'Basic Shapes', icon: <Diamond className="w-full h-full" />, color: '#6B7280' },
  { id: 'pentagon-filled', name: 'Pentagon', category: 'Basic Shapes', icon: <Pentagon className="w-full h-full" fill="currentColor" />, color: '#6B7280' },
  { id: 'pentagon-outline', name: 'Pentagon Outline', category: 'Basic Shapes', icon: <Pentagon className="w-full h-full" />, color: '#6B7280' },
  { id: 'hexagon-filled', name: 'Hexagon', category: 'Basic Shapes', icon: <Hexagon className="w-full h-full" fill="currentColor" />, color: '#6B7280' },
  { id: 'hexagon-outline', name: 'Hexagon Outline', category: 'Basic Shapes', icon: <Hexagon className="w-full h-full" />, color: '#6B7280' },
  { id: 'octagon-filled', name: 'Octagon', category: 'Basic Shapes', icon: <Octagon className="w-full h-full" fill="currentColor" />, color: '#6B7280' },
  { id: 'octagon-outline', name: 'Octagon Outline', category: 'Basic Shapes', icon: <Octagon className="w-full h-full" />, color: '#6B7280' },
  { id: 'star-filled', name: 'Star', category: 'Basic Shapes', icon: <Star className="w-full h-full" fill="currentColor" />, color: '#6B7280' },
  { id: 'star-outline', name: 'Star Outline', category: 'Basic Shapes', icon: <Star className="w-full h-full" />, color: '#6B7280' },
  { id: 'star-6point', name: '6 Point Star', category: 'Basic Shapes', icon: <Sparkles className="w-full h-full" fill="currentColor" />, color: '#6B7280' },
  { id: 'heart-filled', name: 'Heart', category: 'Basic Shapes', icon: <Heart className="w-full h-full" fill="currentColor" />, color: '#6B7280' },
  { id: 'heart-outline', name: 'Heart Outline', category: 'Basic Shapes', icon: <Heart className="w-full h-full" />, color: '#6B7280' },
  { id: 'parallelogram', name: 'Parallelogram', category: 'Basic Shapes', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><polygon points="6,4 22,4 18,20 2,20" /></svg>, color: '#6B7280' },
  { id: 'trapezoid', name: 'Trapezoid', category: 'Basic Shapes', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><polygon points="6,6 18,6 22,18 2,18" /></svg>, color: '#6B7280' },
  { id: 'cylinder', name: 'Cylinder', category: 'Basic Shapes', icon: <Cylinder className="w-full h-full" />, color: '#6B7280' },
  { id: 'cube', name: 'Cube', category: 'Basic Shapes', icon: <Box className="w-full h-full" />, color: '#6B7280' },
  { id: 'scroll', name: 'Scroll', category: 'Basic Shapes', icon: <Scroll className="w-full h-full" />, color: '#6B7280' },
  { id: 'document', name: 'Document', category: 'Basic Shapes', icon: <FileText className="w-full h-full" />, color: '#6B7280' },
  { id: 'wave-shape', name: 'Wave', category: 'Basic Shapes', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M2 8 Q 6 2 10 8 Q 14 14 18 8 Q 22 2 22 8 L 22 20 L 2 20 Z" /></svg>, color: '#6B7280' },
  { id: 'crescent', name: 'Crescent', category: 'Basic Shapes', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M12 2 A10 10 0 1 0 12 22 A6 6 0 1 1 12 2" /></svg>, color: '#6B7280' },
  { id: 'ring', name: 'Ring', category: 'Basic Shapes', icon: <CircleDot className="w-full h-full" />, color: '#6B7280' },
  { id: 'circle-dashed', name: 'Dashed Circle', category: 'Basic Shapes', icon: <CircleDashed className="w-full h-full" />, color: '#6B7280' },
  { id: 'donut', name: 'Donut', category: 'Basic Shapes', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor" stroke="none"><path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" /></svg>, color: '#6B7280' },
  { id: 'cross', name: 'Cross', category: 'Basic Shapes', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M9 2h6v7h7v6h-7v7H9v-7H2V9h7V2z" /></svg>, color: '#6B7280' },
  { id: 'l-shape', name: 'L Shape', category: 'Basic Shapes', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M4 2h8v14h10v6H4V2z" /></svg>, color: '#6B7280' },
  { id: 't-shape', name: 'T Shape', category: 'Basic Shapes', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path d="M2 2h20v6H14v14H10V8H2V2z" /></svg>, color: '#6B7280' },
  { id: 'frame', name: 'Frame', category: 'Basic Shapes', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><path fillRule="evenodd" d="M2 2h20v20H2V2zm3 3v14h14V5H5z" /></svg>, color: '#6B7280' },
  { id: 'arrow-shape', name: 'Arrow Shape', category: 'Basic Shapes', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><polygon points="12,2 22,12 16,12 16,22 8,22 8,12 2,12" /></svg>, color: '#6B7280' },
  { id: 'chevron-shape', name: 'Chevron', category: 'Basic Shapes', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="currentColor"><polygon points="4,4 14,12 4,20 10,20 20,12 10,4" /></svg>, color: '#6B7280' },
  { id: 'ribbon-shape', name: 'Ribbon', category: 'Basic Shapes', icon: <Ribbon className="w-full h-full" />, color: '#6B7280' },
  { id: 'shield-shape', name: 'Shield', category: 'Basic Shapes', icon: <Shield className="w-full h-full" fill="currentColor" />, color: '#6B7280' },
  { id: 'flag-shape', name: 'Flag', category: 'Basic Shapes', icon: <Flag className="w-full h-full" fill="currentColor" />, color: '#6B7280' },
  { id: 'bookmark-shape', name: 'Bookmark', category: 'Basic Shapes', icon: <Bookmark className="w-full h-full" fill="currentColor" />, color: '#6B7280' },
  { id: 'tag-shape', name: 'Tag', category: 'Basic Shapes', icon: <Tag className="w-full h-full" fill="currentColor" />, color: '#6B7280' },
  { id: 'award-shape', name: 'Award', category: 'Basic Shapes', icon: <Award className="w-full h-full" />, color: '#6B7280' },
  { id: 'crown-shape', name: 'Crown', category: 'Basic Shapes', icon: <Crown className="w-full h-full" />, color: '#6B7280' },
  { id: 'gem-shape', name: 'Gem', category: 'Basic Shapes', icon: <Gem className="w-full h-full" />, color: '#6B7280' },
];

// Signs
const signs: Element[] = [
  { id: 'sign-plus', name: 'Plus', category: 'Signs', icon: <Plus className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-minus', name: 'Minus', category: 'Signs', icon: <Minus className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-x', name: 'X', category: 'Signs', icon: <X className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-divide', name: 'Divide', category: 'Signs', icon: <Divide className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-equal', name: 'Equal', category: 'Signs', icon: <Equal className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-not-equal', name: 'Not Equal', category: 'Signs', icon: <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="9" x2="19" y2="9" /><line x1="5" y1="15" x2="19" y2="15" /><line x1="5" y1="19" x2="19" y2="5" /></svg>, color: '#6B7280' },
  { id: 'sign-greater', name: 'Greater Than', category: 'Signs', icon: <ChevronRight className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-less', name: 'Less Than', category: 'Signs', icon: <ChevronLeft className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-check', name: 'Check', category: 'Signs', icon: <Check className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-hash', name: 'Hash', category: 'Signs', icon: <Hash className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-braces', name: 'Braces', category: 'Signs', icon: <Braces className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-parentheses', name: 'Parentheses', category: 'Signs', icon: <Parentheses className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-slash', name: 'Slash', category: 'Signs', icon: <Slash className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-crosshair', name: 'Crosshair', category: 'Signs', icon: <Crosshair className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-target', name: 'Target', category: 'Signs', icon: <Target className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-grip', name: 'Grip', category: 'Signs', icon: <Grip className="w-full h-full" />, color: '#6B7280' },
  { id: 'sign-grip-v', name: 'Grip Vertical', category: 'Signs', icon: <GripVertical className="w-full h-full" />, color: '#6B7280' },
];

const icons: Element[] = [
  { id: 'smile', name: 'Smile', category: 'Icons', icon: <Smile className="w-full h-full" />, color: '#FBBF24' },
  { id: 'sun', name: 'Sun', category: 'Icons', icon: <Sun className="w-full h-full" />, color: '#F59E0B' },
  { id: 'moon', name: 'Moon', category: 'Icons', icon: <Moon className="w-full h-full" />, color: '#6366F1' },
  { id: 'cloud', name: 'Cloud', category: 'Icons', icon: <Cloud className="w-full h-full" />, color: '#60A5FA' },
  { id: 'zap', name: 'Lightning', category: 'Icons', icon: <Zap className="w-full h-full" />, color: '#FBBF24' },
  { id: 'message', name: 'Message', category: 'Icons', icon: <MessageCircle className="w-full h-full" />, color: '#10B981' },
  { id: 'thumbs-up', name: 'Thumbs Up', category: 'Icons', icon: <ThumbsUp className="w-full h-full" />, color: '#3B82F6' },
  { id: 'music', name: 'Music', category: 'Icons', icon: <Music className="w-full h-full" />, color: '#EC4899' },
  { id: 'camera', name: 'Camera', category: 'Icons', icon: <Camera className="w-full h-full" />, color: '#8B5CF6' },
  { id: 'film', name: 'Film', category: 'Icons', icon: <Film className="w-full h-full" />, color: '#14B8A6' },
];

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
];

const allElements = [...lines, ...arrows, ...shapes, ...signs, ...icons, ...stickers];

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

    // Remove the added indicator after 1 second
    setTimeout(() => {
      setAddedElements((prev) => {
        const next = new Set(prev);
        next.delete(element.id);
        return next;
      });
    }, 1000);
  };

  const groupedElements = {
    Lines: lines,
    Arrows: arrows,
    'Basic Shapes': shapes,
    Signs: signs,
    Icons: icons,
    Stickers: stickers,
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
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              <h4 className="text-sm font-semibold text-gray-700 mb-3">{category}</h4>
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
                        ? 'bg-green-100 ring-2 ring-green-500'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                    style={{ color: element.color !== 'transparent' ? element.color : undefined }}
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
                    ? 'bg-green-100 ring-2 ring-green-500'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
                style={{ color: element.color !== 'transparent' ? element.color : undefined }}
              >
                <div className="w-6 h-6">{element.icon}</div>
                <span className="text-[9px] text-gray-500 truncate max-w-full px-1">{element.name}</span>
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
      </div>

      {/* Tip */}
      <div className="mt-4 p-2 bg-blue-50 rounded-lg text-xs text-blue-700 flex items-center gap-2">
        <Shapes className="w-4 h-4" />
        Drag elements to the canvas or click to add
      </div>
    </div>
  );
};

export default ElementsPanel;
