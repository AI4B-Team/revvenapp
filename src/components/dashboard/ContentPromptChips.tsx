import React from "react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  BadgeCheck,
  Brush,
  CalendarDays,
  Clock,
  Flag,
  GalleryHorizontal,
  Image as ImageIcon,
  Mic,
  UserCircle,
  Video,
  Wand2,
} from "lucide-react";
import type { LucideProps } from "lucide-react";

type IconType = React.ComponentType<LucideProps>;

interface ContentPromptChipsProps {
  postType: string;
  goal: string;
  language: string;
  days: number;
  time: string;
  style: string;
  brandEnabled: boolean;
  className?: string;
}

const postTypeIcon = (postType: string): IconType => {
  switch (postType) {
    case "Carousel":
      return GalleryHorizontal;
    case "Videos":
      return Video;
    case "Voiceover Videos":
      return Mic;
    case "Avatar Videos":
      return UserCircle;
    case "Single Image":
    default:
      return ImageIcon;
  }
};

const timeIcon = (time: string): IconType => (time === "Auto" ? Wand2 : Clock);

const styleIcon = (style: string): IconType => (style === "Stock" ? ImageIcon : Brush);

const chipClassName =
  "shrink-0 border border-border/60 bg-background/70 backdrop-blur text-foreground";

export default function ContentPromptChips({
  postType,
  goal,
  language,
  days,
  time,
  style,
  brandEnabled,
  className,
}: ContentPromptChipsProps) {
  const PostIcon = postTypeIcon(postType);
  const TimeIcon = timeIcon(time);
  const StyleIcon = styleIcon(style);

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Badge variant="secondary" className={cn(chipClassName)}>
        <PostIcon size={14} className="mr-1 text-gray-400" />
        <span className="text-muted-foreground">Post:</span> {postType}
      </Badge>

      <Badge variant="secondary" className={cn(chipClassName)}>
        <Flag size={14} className="mr-1 text-gray-400" />
        <span className="text-muted-foreground">Goal:</span> {goal}
      </Badge>

      <Badge variant="secondary" className={cn(chipClassName)}>
        <span className="text-muted-foreground">Lang:</span> {language}
      </Badge>

      <Badge variant="secondary" className={cn(chipClassName)}>
        <CalendarDays size={14} className="mr-1 text-gray-400" />
        <span className="text-muted-foreground">Freq:</span> {days}d
      </Badge>

      <Badge variant="secondary" className={cn(chipClassName)}>
        <TimeIcon size={14} className="mr-1 text-gray-400" />
        <span className="text-muted-foreground">Time:</span> {time}
      </Badge>

      <Badge variant="secondary" className={cn(chipClassName)}>
        <StyleIcon size={14} className="mr-1 text-gray-400" />
        <span className="text-muted-foreground">Style:</span> {style}
      </Badge>

      <Badge variant="secondary" className={cn(chipClassName)}>
        <BadgeCheck size={14} className="mr-1 text-gray-400" />
        <span className="text-muted-foreground">Brand:</span> {brandEnabled ? "On" : "Off"}
      </Badge>
    </div>
  );
}
