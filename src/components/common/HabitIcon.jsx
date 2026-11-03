import React from 'react';
import {
  Sparkles,
  BookOpen,
  Droplets,
  Zap,
  Flame,
  Dumbbell,
  Coffee,
  Heart,
  Smile,
  Sun,
  Moon,
  Target,
  Clock,
  Compass,
  CheckCircle2,
  Code,
  Laptop,
  Music,
  Feather,
  Pencil,
  Activity,
  Award,
} from 'lucide-react';

export const HABIT_ICONS = {
  Sparkles,
  BookOpen,
  Droplets,
  Zap,
  Flame,
  Dumbbell,
  Coffee,
  Heart,
  Smile,
  Sun,
  Moon,
  Target,
  Clock,
  Compass,
  CheckCircle2,
  Code,
  Laptop,
  Music,
  Feather,
  Pencil,
  Activity,
  Award,
};

export const HabitIcon = ({ name = 'Sparkles', className = 'w-5 h-5', style }) => {
  const IconComponent = HABIT_ICONS[name] || HABIT_ICONS.Sparkles;
  return <IconComponent className={className} style={style} />;
};
